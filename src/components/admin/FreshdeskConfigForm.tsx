'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateSiteSettings } from '@/actions/site-settings.actions';
import type { SettingsHistoryEntry } from '@/actions/site-settings.actions';
import { toast } from 'sonner';
import { FreshdeskConfig } from '@/config/freshdesk.config';
import { ChangeHistory } from '@/components/admin/ChangeHistory';
import {
    Headset,
    MessageCircle,
    BookOpen,
    Ticket,
    Eye,
    EyeOff,
    Save,
    ChevronDown,
    ChevronUp,
    Globe,
    RefreshCw,
    Loader2,
    CheckCircle,
    XCircle,
    Lock,
} from 'lucide-react';

/* ───────────────── Toggle Switch ────────────────── */

function ToggleSwitch({ label, checked, onChange, disabled, icon }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none
            ${checked
                ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5'
                : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0
                    ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm
                    ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                {icon || (checked
                    ? <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    : <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                )}
                {label}
            </span>
        </label>
    );
}

/* ───────────────── Field Wrapper ────────────────── */

function FieldGroup({ label, hint, children }: {
    label: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

/* ───────────────── Module Section ────────────────── */

function ModuleSection({ title, description, icon, enabled, onToggle, disabled, children }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    onToggle: (v: boolean) => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    const [expanded, setExpanded] = useState(enabled);

    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${enabled
            ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
            : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'}`}
                    >
                        {icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
                        <p className="text-[11px] text-gray-500">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ToggleSwitch
                        label=""
                        checked={enabled}
                        onChange={onToggle}
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Content (colapsável) */}
            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-white/5 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════ MAIN FORM ══════════════════════ */

interface FreshdeskConfigFormProps {
    initialData: FreshdeskConfig;
    canEdit?: boolean;
    history?: SettingsHistoryEntry[];
}

export function FreshdeskConfigForm({ initialData, canEdit = true, history = [] }: FreshdeskConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const [config, setConfig] = useState<FreshdeskConfig>(initialData);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ success: boolean; created: number; updated: number; errors: string[]; details: string[] } | null>(null);

    /** Sync Help → Freshdesk KB */
    const handleSyncKB = async () => {
        try {
            setSyncing(true);
            setSyncResult(null);
            const res = await fetch('/api/admin/freshdesk-sync', { method: 'POST' });
            const data = await res.json();
            setSyncResult(data);
            if (data.success) {
                toast.success(`KB sincronizada: ${data.created} criados, ${data.updated} atualizados`);
            } else {
                toast.error(`Sync com erros: ${data.errors?.length || 0} falhas`);
            }
        } catch {
            toast.error('Erro ao sincronizar com Freshdesk');
        } finally {
            setSyncing(false);
        }
    };

    /** Helper para atualizar um campo */
    const set = <K extends keyof FreshdeskConfig>(key: K, value: FreshdeskConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    /**
     * Extrai o widget_id de um script de deploy do Freshworks.
     * Se o admin colar o script inteiro, extrai automaticamente o número.
     * Se já for só o número, retorna como está.
     */
    const extractWidgetId = (input: string): string => {
        const match = input.match(/widget_id['"]?\s*[:=]\s*['"]?(\d+)/i);
        return match ? match[1] : input.trim();
    };

    /**
     * Extrai o token do Freshchat de um script de deploy.
     * Aceita UUID colado direto ou extraído do script.
     */
    const extractChatToken = (input: string): string => {
        const match = input.match(/token['"]?\s*[:=]\s*['"]?([a-f0-9-]{36})/i);
        return match ? match[1] : input.trim();
    };

    /** Salvar no banco */
    const handleSave = () => {
        if (!canEdit) return;
        startTransition(async () => {
            try {
                const result = await updateSiteSettings('freshdesk_config', config);
                if (result.success) {
                    toast.success('Configurações do Freshdesk salvas!');
                } else {
                    toast.error(result.error || 'Erro ao salvar.');
                }
            } catch {
                toast.error('Erro ao salvar configurações.');
            }
        });
    };

    return (
        <>
            <div className="space-y-6">

                {/* ── Domínio Global ── */}
                <FieldGroup
                    label="Domínio Freshworks"
                    hint="Seu domínio Freshworks (obtido no painel admin do Freshdesk)"
                >
                    <Input
                        value={config.domain}
                        onChange={e => set('domain', e.target.value)}
                        placeholder="seudominio.myfreshworks.com"
                        disabled={!canEdit}
                    />
                </FieldGroup>

                <div className="border-t border-gray-200 dark:border-white/5" />

                {/* ── 1. Widget de Suporte ── */}
                <ModuleSection
                    title="Widget de Suporte"
                    description="Bolha flutuante para contato e FAQ"
                    icon={<Globe className="w-4.5 h-4.5" />}
                    enabled={config.widgetEnabled}
                    onToggle={v => set('widgetEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label="Widget ID"
                        hint="Cole o ID numérico ou o script de deploy — o ID será extraído automaticamente"
                    >
                        <Input
                            value={config.widgetId}
                            onChange={e => set('widgetId', extractWidgetId(e.target.value))}
                            placeholder="67000001614"
                            disabled={!canEdit}
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Posição">
                            <select
                                value={config.widgetPosition}
                                onChange={e => set('widgetPosition', e.target.value as 'left' | 'right')}
                                disabled={!canEdit}
                                className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                                <option value="right">Direita</option>
                                <option value="left">Esquerda</option>
                            </select>
                        </FieldGroup>
                        <FieldGroup label="Offset (px)">
                            <Input
                                type="number"
                                value={config.widgetOffset}
                                onChange={e => set('widgetOffset', Number(e.target.value))}
                                min={0}
                                max={200}
                                disabled={!canEdit}
                            />
                        </FieldGroup>
                    </div>

                    <ToggleSwitch
                        label="Identificar usuário logado automaticamente"
                        checked={config.widgetAuthEnabled}
                        onChange={v => set('widgetAuthEnabled', v)}
                        disabled={!canEdit}
                    />
                </ModuleSection>

                {/* ── 2. Portal de Tickets ── */}
                <ModuleSection
                    title="Portal de Tickets"
                    description="Página dedicada para criar e acompanhar tickets"
                    icon={<Ticket className="w-4.5 h-4.5" />}
                    enabled={config.ticketsEnabled}
                    onToggle={v => set('ticketsEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label="URL do Portal de Tickets"
                        hint="Ex: https://seudominio.freshdesk.com/support/tickets"
                    >
                        <Input
                            value={config.ticketsUrl}
                            onChange={e => set('ticketsUrl', e.target.value)}
                            placeholder="https://seudominio.freshdesk.com/support/tickets"
                            disabled={!canEdit}
                        />
                    </FieldGroup>
                </ModuleSection>

                {/* ── 3. Knowledge Base ── */}
                <ModuleSection
                    title="Knowledge Base"
                    description="Base de conhecimento e artigos de ajuda"
                    icon={<BookOpen className="w-4.5 h-4.5" />}
                    enabled={config.kbEnabled}
                    onToggle={v => set('kbEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label="URL da Knowledge Base"
                        hint="Ex: https://seudominio.freshdesk.com/support/solutions"
                    >
                        <Input
                            value={config.kbUrl}
                            onChange={e => set('kbUrl', e.target.value)}
                            placeholder="https://seudominio.freshdesk.com/support/solutions"
                            disabled={!canEdit}
                        />
                    </FieldGroup>

                    {/* Sync Help → Freshdesk KB */}
                    <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Sincronizar Help → Freshdesk
                                </h5>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Publica os tópicos do Help interno como artigos na KB do Freshdesk.
                                    Tópicos públicos ficam visíveis a todos. Tópicos admin ficam <Lock className="w-3 h-3 inline" /> restritos a agentes.
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={handleSyncKB}
                                disabled={syncing || !canEdit}
                                className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-xs px-4 py-2"
                            >
                                {syncing ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sincronizando...</>
                                ) : (
                                    <><RefreshCw className="w-3.5 h-3.5" /> Sincronizar KB</>
                                )}
                            </Button>
                        </div>

                        {/* Resultado do Sync */}
                        {syncResult && (
                            <div className={`p-3 rounded-lg border text-xs space-y-2 ${syncResult.success
                                ? 'border-emerald-500/20 bg-emerald-500/5'
                                : 'border-red-500/20 bg-red-500/5'
                                }`}>
                                <div className="flex items-center gap-2 font-semibold">
                                    {syncResult.success
                                        ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Sync concluído</>
                                        : <><XCircle className="w-3.5 h-3.5 text-red-400" /> Sync com erros</>
                                    }
                                    <span className="text-gray-400 font-normal">
                                        — {syncResult.created} criados, {syncResult.updated} atualizados
                                    </span>
                                </div>
                                {syncResult.details?.length > 0 && (
                                    <div className="pl-5 space-y-0.5 text-gray-400">
                                        {syncResult.details.map((d, i) => (
                                            <div key={i}>{d}</div>
                                        ))}
                                    </div>
                                )}
                                {syncResult.errors?.length > 0 && (
                                    <div className="pl-5 space-y-0.5 text-red-400">
                                        {syncResult.errors.map((e, i) => (
                                            <div key={i}>❌ {e}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ModuleSection>

                {/* ── 4. Freshchat ── */}
                <ModuleSection
                    title="Freshchat"
                    description="Chat em tempo real com a equipe de suporte"
                    icon={<MessageCircle className="w-4.5 h-4.5" />}
                    enabled={config.chatEnabled}
                    onToggle={v => set('chatEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label="Chat Token"
                        hint="Cole o token UUID ou o script de deploy — o token será extraído automaticamente"
                    >
                        <Input
                            value={config.chatToken}
                            onChange={e => set('chatToken', extractChatToken(e.target.value))}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            disabled={!canEdit}
                        />
                    </FieldGroup>

                    <ToggleSwitch
                        label="Identificar usuário logado automaticamente"
                        checked={config.chatAuthEnabled}
                        onChange={v => set('chatAuthEnabled', v)}
                        disabled={!canEdit}
                    />
                </ModuleSection>

                {/* ── Botão Salvar ── */}
                {canEdit && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isPending}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 text-sm font-semibold px-6 py-2.5"
                        >
                            <Save className="w-4 h-4" />
                            {isPending ? 'Salvando...' : 'Salvar Freshdesk'}
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Histórico de Alterações ── */}
            <ChangeHistory
                entries={history}
                booleanFields={['widgetEnabled', 'ticketsEnabled', 'kbEnabled', 'chatEnabled', 'widgetAuthEnabled', 'chatAuthEnabled']}
            />
        </>
    );
}
