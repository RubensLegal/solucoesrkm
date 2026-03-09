'use client';

/**
 * @file FreshdeskSyncButton.tsx
 * @description Botão para disparar sincronização bidirecional do conteúdo do help com Freshdesk KB.
 * 
 * Mostra tópicos dinâmicos (de HELP_CATEGORIES) e suporta push + pull.
 */

import { useState, useEffect } from 'react';
import {
    RefreshCw, CheckCircle, AlertTriangle, Loader2, Clock,
    ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HELP_CATEGORIES } from '@/lib/help-topics';

interface SyncStatus {
    lastSync: string | null;
    lastPull: string | null;
    articleCount: number;
}

interface SyncResult {
    success: boolean;
    created?: number;
    updated?: number;
    pulled?: number;
    unchanged?: number;
    errors: string[];
    details: string[];
}

export function FreshdeskSyncButton() {
    const [syncing, setSyncing] = useState(false);
    const [pulling, setPulling] = useState(false);
    const [status, setStatus] = useState<SyncStatus | null>(null);
    const [result, setResult] = useState<SyncResult | null>(null);
    const [direction, setDirection] = useState<'push' | 'pull' | null>(null);

    // Buscar status ao montar
    useEffect(() => {
        fetch('/api/admin/freshdesk-sync')
            .then(r => r.json())
            .then(setStatus)
            .catch(() => { });
    }, []);

    const handlePush = async () => {
        setSyncing(true);
        setResult(null);
        setDirection('push');
        try {
            const res = await fetch('/api/admin/freshdesk-sync', { method: 'POST' });
            const data = await res.json();
            setResult(data);
            // Atualizar status
            const statusRes = await fetch('/api/admin/freshdesk-sync');
            setStatus(await statusRes.json());
        } catch (err: any) {
            setResult({ success: false, created: 0, updated: 0, errors: [err.message], details: [] });
        } finally {
            setSyncing(false);
        }
    };

    const handlePull = async () => {
        setPulling(true);
        setResult(null);
        setDirection('pull');
        try {
            const res = await fetch('/api/admin/freshdesk-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'pull' }),
            });
            const data = await res.json();
            setResult(data);
            const statusRes = await fetch('/api/admin/freshdesk-sync');
            setStatus(await statusRes.json());
        } catch (err: any) {
            setResult({ success: false, pulled: 0, unchanged: 0, errors: [err.message], details: [] });
        } finally {
            setPulling(false);
        }
    };

    // Gerar lista de tópicos dinâmicos a partir de HELP_CATEGORIES
    const allTopics = HELP_CATEGORIES.flatMap(cat =>
        cat.topics.map(t => ({
            emoji: cat.emoji,
            name: t.translationKey.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim(),
            slug: t.slug,
            superadminOnly: t.superadminOnly,
        }))
    );

    const isWorking = syncing || pulling;

    return (
        <div className="space-y-4">
            {/* Botões de ação */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={handlePush}
                    disabled={isWorking}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 text-sm font-semibold px-5 py-2.5"
                >
                    {syncing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                        <><ArrowUpCircle className="w-4 h-4" /> Push para Freshdesk</>
                    )}
                </Button>

                <Button
                    onClick={handlePull}
                    disabled={isWorking}
                    variant="outline"
                    className="gap-2 text-sm font-semibold px-5 py-2.5 border-indigo-500/30 hover:bg-indigo-500/10"
                >
                    {pulling ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                    ) : (
                        <><ArrowDownCircle className="w-4 h-4" /> Pull do Freshdesk</>
                    )}
                </Button>
            </div>

            {/* Status info */}
            {status && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {status.lastSync && (
                        <span className="flex items-center gap-1">
                            <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
                            Último push: {new Date(status.lastSync).toLocaleString('pt-BR')}
                        </span>
                    )}
                    {status.lastPull && (
                        <span className="flex items-center gap-1">
                            <ArrowDownCircle className="w-3 h-3 text-indigo-500" />
                            Último pull: {new Date(status.lastPull).toLocaleString('pt-BR')}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {status.articleCount} artigos mapeados
                    </span>
                </div>
            )}

            {/* Tópicos dinâmicos */}
            <div className="space-y-2">
                {HELP_CATEGORIES.map(cat => (
                    <div key={cat.id}>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            {cat.emoji} {cat.translationKey === 'business' ? 'Planos e Assinaturas' : 'Documentação Técnica'}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {cat.topics.map(topic => (
                                <div
                                    key={topic.slug}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs"
                                >
                                    <span className="text-gray-700 dark:text-gray-300 truncate">
                                        {topic.translationKey.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    {topic.superadminOnly && (
                                        <span className="text-[10px] text-amber-500" title="Agents Only no Freshdesk">🔒</span>
                                    )}
                                </div>
                            ))}
                        </div>
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
                            {result.success
                                ? (direction === 'push' ? 'Push concluído' : 'Pull concluído')
                                : (direction === 'push' ? 'Erro no push' : 'Erro no pull')
                            }
                        </span>
                        <span className="text-xs text-gray-500">
                            {direction === 'push'
                                ? `(${result.created || 0} criados, ${result.updated || 0} atualizados)`
                                : `(${result.pulled || 0} importados, ${result.unchanged || 0} sem alteração)`
                            }
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
