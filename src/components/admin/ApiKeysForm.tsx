'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Key, Eye, EyeOff } from 'lucide-react';
import { ChangeHistory } from '@/components/admin/ChangeHistory';
import type { SettingsHistoryEntry } from '@/actions/site-settings.actions';

interface ApiKeysFormProps {
    canEdit?: boolean;
    history?: SettingsHistoryEntry[];
}

export function ApiKeysForm({ canEdit = true, history = [] }: ApiKeysFormProps) {
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [loaded, setLoaded] = useState(false);

    // Carregar a chave do banco
    useEffect(() => {
        async function loadKey() {
            try {
                const res = await fetch('/api/admin/api-keys');
                if (res.ok) {
                    const data = await res.json();
                    setGoogleApiKey(data.googlePlacesApiKey || '');
                }
            } catch { /* silently fail */ }
            setLoaded(true);
        }
        loadKey();
    }, []);

    const handleSave = () => {
        if (!canEdit) return;
        startTransition(async () => {
            try {
                const res = await fetch('/api/admin/api-keys', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ googlePlacesApiKey: googleApiKey }),
                });
                if (res.ok) {
                    toast.success('API Key salva com sucesso!');
                } else {
                    toast.error('Erro ao salvar API Key.');
                }
            } catch {
                toast.error('Erro ao salvar API Key.');
            }
        });
    };

    if (!loaded) return null;

    return (
        <>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                        Google Places API Key
                    </label>
                    <div className="relative">
                        <Input
                            value={googleApiKey}
                            onChange={e => setGoogleApiKey(e.target.value)}
                            placeholder="AIza..."
                            type={showKey ? 'text' : 'password'}
                            disabled={!canEdit}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">
                        Opcional. Usado como fallback para busca de endereço internacional quando o Nominatim (OpenStreetMap) não retorna resultados.
                    </p>
                </div>

                {canEdit && (
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 text-sm font-semibold px-6 py-2.5"
                    >
                        {isPending ? 'Salvando...' : 'Salvar API Key'}
                    </Button>
                )}
            </div>

            {/* ── Histórico de Alterações ── */}
            <ChangeHistory entries={history} />
        </>
    );
}
