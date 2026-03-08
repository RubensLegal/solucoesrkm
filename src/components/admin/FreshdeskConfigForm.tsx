'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
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
    const [linksCopied, setLinksCopied] = useState(false);
    const t = useTranslations('admin.freshdesk');

    /** Copia links de todos os tópicos do help para o clipboard */
    const copyHelpLinks = async () => {
        const links = [
            '💰 Negócios',
            '• Planos e Limites → https://solucoesrkm.com/pt/help/plans-limits',
            '• Segurança de Pagamento → https://solucoesrkm.com/pt/help/payment-security',
            '• Fluxo de Assinatura → https://solucoesrkm.com/pt/help/subscription-flow',
            '• Gestão de Assinaturas → https://solucoesrkm.com/pt/help/admin-subscriptions',
            '• Guia de Configurações → https://solucoesrkm.com/pt/help/admin-settings-guide',
            '• Sync Freshdesk → https://solucoesrkm.com/pt/help/freshdesk-sync',
            '• Freshdesk KB → https://solucoesrkm.com/pt/help/freshdesk-kb',
            '',
            '🔧 Técnico',
            '• Documentação Técnica → https://solucoesrkm.com/pt/help/tech-docs',
            '• Setup Dev → https://solucoesrkm.com/pt/help/dev-setup',
            '• Banco de Dados → https://solucoesrkm.com/pt/help/dev-database',
            '• Referência API → https://solucoesrkm.com/pt/help/dev-api',
            '• Deploy → https://solucoesrkm.com/pt/help/dev-deploy',
            '• Tradução Automática → https://solucoesrkm.com/pt/help/auto-translation',
        ].join('\n');

        await navigator.clipboard.writeText(links);
        setLinksCopied(true);
        toast.success('Links copiados!');
        setTimeout(() => setLinksCopied(false), 3000);
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
                    toast.success(t('saveFreshdesk') + ' ✓');
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
                    label={t('domain')}
                    hint={t('domainHint')}
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
                    title={t('widget')}
                    description={t('widgetDesc')}
                    icon={<Globe className="w-4.5 h-4.5" />}
                    enabled={config.widgetEnabled}
                    onToggle={v => set('widgetEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label={t('widgetId')}
                        hint={t('widgetIdHint')}
                    >
                        <Input
                            value={config.widgetId}
                            onChange={e => set('widgetId', extractWidgetId(e.target.value))}
                            placeholder="67000001614"
                            disabled={!canEdit}
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label={t('position')}>
                            <select
                                value={config.widgetPosition}
                                onChange={e => set('widgetPosition', e.target.value as 'left' | 'right')}
                                disabled={!canEdit}
                                className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                                <option value="right">{t('positionRight')}</option>
                                <option value="left">{t('positionLeft')}</option>
                            </select>
                        </FieldGroup>
                        <FieldGroup label={t('offset')}>
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
                        label={t('autoIdentify')}
                        checked={config.widgetAuthEnabled}
                        onChange={v => set('widgetAuthEnabled', v)}
                        disabled={!canEdit}
                    />
                </ModuleSection>

                {/* ── 2. Portal de Tickets ── */}
                <ModuleSection
                    title={t('tickets')}
                    description={t('ticketsDesc')}
                    icon={<Ticket className="w-4.5 h-4.5" />}
                    enabled={config.ticketsEnabled}
                    onToggle={v => set('ticketsEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label={t('ticketsUrl')}
                        hint={t('ticketsUrlHint')}
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
                    title={t('kb')}
                    description={t('kbDesc')}
                    icon={<BookOpen className="w-4.5 h-4.5" />}
                    enabled={config.kbEnabled}
                    onToggle={v => set('kbEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label={t('kbUrl')}
                        hint={t('kbUrlHint')}
                    >
                        <Input
                            value={config.kbUrl}
                            onChange={e => set('kbUrl', e.target.value)}
                            placeholder="https://seudominio.freshdesk.com/support/solutions"
                            disabled={!canEdit}
                        />
                    </FieldGroup>

                    {/* Links do Help — para copiar ao Freshdesk KB */}
                    <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" />
                                    {t('syncTitle')}
                                </h5>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Copie os links dos tópicos do help para criar artigos no Freshdesk KB
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={copyHelpLinks}
                                className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-xs px-4 py-2"
                            >
                                {linksCopied ? (
                                    <><CheckCircle className="w-3.5 h-3.5" /> Copiado!</>
                                ) : (
                                    <><Globe className="w-3.5 h-3.5" /> Copiar Links</>
                                )}
                            </Button>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            💡 Fonte única de verdade: crie artigos no Freshdesk com links diretos para{' '}
                            <a href="https://solucoesrkm.com/pt/help" target="_blank" rel="noopener" className="text-teal-400 hover:underline">
                                solucoesrkm.com/help
                            </a>
                            . Assim, ao editar no help-editor, o conteúdo atualiza automaticamente.
                        </p>
                    </div>
                </ModuleSection>

                {/* ── 4. Freshchat ── */}
                <ModuleSection
                    title={t('chat')}
                    description={t('chatDesc')}
                    icon={<MessageCircle className="w-4.5 h-4.5" />}
                    enabled={config.chatEnabled}
                    onToggle={v => set('chatEnabled', v)}
                    disabled={!canEdit}
                >
                    <FieldGroup
                        label={t('chatToken')}
                        hint={t('chatTokenHint')}
                    >
                        <Input
                            value={config.chatToken}
                            onChange={e => set('chatToken', extractChatToken(e.target.value))}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            disabled={!canEdit}
                        />
                    </FieldGroup>

                    <ToggleSwitch
                        label={t('autoIdentify')}
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
                            {isPending ? t('saving') : t('saveFreshdesk')}
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
