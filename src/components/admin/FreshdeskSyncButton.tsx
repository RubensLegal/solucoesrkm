'use client';

/**
 * @file FreshdeskSyncButton.tsx
 * @description Botão para disparar sincronização do conteúdo corporativo com Freshdesk KB.
 */

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SyncStatus {
    lastSync: string | null;
    articleCount: number;
}

export function FreshdeskSyncButton() {
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState<SyncStatus | null>(null);
    const [result, setResult] = useState<{
        success: boolean;
        created: number;
        updated: number;
        errors: string[];
        details: string[];
    } | null>(null);

    // Buscar status ao montar
    useEffect(() => {
        fetch('/api/admin/freshdesk-sync')
            .then(r => r.json())
            .then(setStatus)
            .catch(() => { });
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        setResult(null);
        try {
            const res = await fetch('/api/admin/freshdesk-sync', { method: 'POST' });
            const data = await res.json();
            setResult(data);
            // Atualizar status
            const statusRes = await fetch('/api/admin/freshdesk-sync');
            const statusData = await statusRes.json();
            setStatus(statusData);
        } catch (err: any) {
            setResult({ success: false, created: 0, updated: 0, errors: [err.message], details: [] });
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Status info */}
            <div className="flex flex-wrap items-center gap-4">
                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 text-sm font-semibold px-6 py-2.5"
                >
                    {syncing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sincronizando...</>
                    ) : (
                        <><RefreshCw className="w-4 h-4" /> Sincronizar com Freshdesk KB</>
                    )}
                </Button>

                {status && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {status.lastSync && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Último sync: {new Date(status.lastSync).toLocaleString('pt-BR')}
                            </span>
                        )}
                        <span>{status.articleCount} artigos sincronizados</span>
                    </div>
                )}
            </div>

            {/* Artigos que serão sincronizados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {[
                    { emoji: '❓', name: 'FAQ' },
                    { emoji: '📋', name: 'Termos de Uso' },
                    { emoji: '🔒', name: 'Privacidade' },
                    { emoji: '⚖️', name: 'Aviso Legal' },
                    { emoji: '🍪', name: 'Cookies' },
                ].map(item => (
                    <div key={item.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
                        <span>{item.emoji}</span>
                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* Resultado do sync */}
            {result && (
                <div className={`p-4 rounded-xl border ${result.success
                    ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {result.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-semibold ${result.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                            {result.success ? 'Sincronização concluída' : 'Erro na sincronização'}
                        </span>
                        <span className="text-xs text-gray-500">
                            ({result.created} criados, {result.updated} atualizados)
                        </span>
                    </div>

                    {result.details.length > 0 && (
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mb-2">
                            {result.details.map((d, i) => (
                                <li key={i}>{d}</li>
                            ))}
                        </ul>
                    )}

                    {result.errors.length > 0 && (
                        <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                            {result.errors.map((e, i) => (
                                <li key={i}>⚠️ {e}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
