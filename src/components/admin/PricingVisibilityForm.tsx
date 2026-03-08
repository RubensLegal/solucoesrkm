'use client';

/**
 * @file PricingVisibilityForm.tsx
 * @description Grid de visibilidade — mostra dados brutos do Tracka (limites,
 * features, notificações, suporte) e permite controlar via checkbox o que será
 * exibido na landing page. READ-ONLY dos dados — nunca edita planos.
 */

import { useState, useTransition } from 'react';
import { Check, Eye, EyeOff, Loader2, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateSiteSettings } from '@/actions/site-settings.actions';
import type { SettingsHistoryEntry } from '@/actions/site-settings.actions';
import { ChangeHistory } from '@/components/admin/ChangeHistory';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/* ─── Types (espelham plan-limits.ts do Tracka) ─────────────── */

export interface PlanLimits {
    items: number;
    visionAi: number;
    houses: number;
    roomsPerHouse: number;
    furniturePerRoom: number;
    photosPerItem: number;
    collaboratorsPerHouse: number;
    history: boolean;
    ranking: boolean;
    importExcel: boolean;
    exportData: boolean;
    consolidation: boolean;
    notifications: 'basic' | 'full';
    support: 'community' | 'email' | 'priority';
}

export interface PlanConfig {
    name: string;
    price: string;
    description: string;
    trialDays: number;
    isPopular?: boolean;
    limits: PlanLimits;
}

export type PlansConfig = Record<string, PlanConfig>;

export interface PricingVisibilityConfig {
    hiddenPlans: string[];
    hiddenFeatures: Record<string, string[]>;
}

interface Props {
    plansConfig: PlansConfig | null;
    canEdit?: boolean;
    initialVisibility?: PricingVisibilityConfig | null;
    history?: SettingsHistoryEntry[];
}

/* ─── Feature keys ──────────────────────────────────────────── */

const NUMERIC_KEYS = ['items', 'visionAi', 'houses', 'roomsPerHouse', 'furniturePerRoom', 'photosPerItem', 'collaboratorsPerHouse'] as const;
const BOOLEAN_KEYS = ['history', 'ranking', 'importExcel', 'exportData', 'consolidation'] as const;

/* ─── Defaults ──────────────────────────────────────────────── */

const EMPTY_VISIBILITY: PricingVisibilityConfig = {
    hiddenPlans: [],
    hiddenFeatures: {},
};

/* ═══════════════════ COMPONENT ═══════════════════════════════ */

export function PricingVisibilityForm({ plansConfig, canEdit = true, initialVisibility, history = [] }: Props) {
    const [isPending, startTransition] = useTransition();
    const [visibility, setVisibility] = useState<PricingVisibilityConfig>(
        initialVisibility || EMPTY_VISIBILITY
    );
    const [dirty, setDirty] = useState(false);
    const t = useTranslations('admin.visibility');

    /* ── Empty state ── */
    if (!plansConfig || Object.keys(plansConfig).length === 0) {
        return (
            <div className="py-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('emptyTitle')}</span>
                </div>
                <p className="text-xs text-gray-500">{t('emptyDescription')}</p>
            </div>
        );
    }

    const planKeys = Object.keys(plansConfig);
    const plans = planKeys.map(key => ({ key, ...plansConfig[key] }));

    /* ── Toggles ── */
    const togglePlan = (planKey: string) => {
        if (!canEdit) return;
        setVisibility(prev => {
            const hidden = prev.hiddenPlans.includes(planKey)
                ? prev.hiddenPlans.filter(p => p !== planKey)
                : [...prev.hiddenPlans, planKey];
            return { ...prev, hiddenPlans: hidden };
        });
        setDirty(true);
    };

    const toggleFeature = (planKey: string, featureKey: string) => {
        if (!canEdit) return;
        setVisibility(prev => {
            const planFeatures = prev.hiddenFeatures[planKey] || [];
            const newFeatures = planFeatures.includes(featureKey)
                ? planFeatures.filter(f => f !== featureKey)
                : [...planFeatures, featureKey];
            return {
                ...prev,
                hiddenFeatures: { ...prev.hiddenFeatures, [planKey]: newFeatures },
            };
        });
        setDirty(true);
    };

    const isPlanVisible = (planKey: string) => !visibility.hiddenPlans.includes(planKey);
    const isFeatureVisible = (planKey: string, featureKey: string) =>
        !(visibility.hiddenFeatures[planKey] || []).includes(featureKey);

    /* ── Save ── */
    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateSiteSettings('pricing_visibility', visibility);
                toast.success(t('saveSuccess'));
                setDirty(false);
            } catch {
                toast.error(t('saveError'));
            }
        });
    };

    /* ── Counts ── */
    const visiblePlanCount = plans.filter(p => isPlanVisible(p.key)).length;
    const hiddenFeatureCount = Object.values(visibility.hiddenFeatures)
        .reduce((acc, arr) => acc + arr.length, 0);

    /* ── Render helpers ── */
    const cellBase = "py-2 px-3 border-b border-gray-100 dark:border-white/5 text-center";

    const FeatureCheckbox = ({ planKey, featureKey, children }: { planKey: string; featureKey: string; children: React.ReactNode }) => {
        const planVis = isPlanVisible(planKey);
        const featVis = isFeatureVisible(planKey, featureKey);
        const active = planVis && featVis;

        return (
            <button
                onClick={() => toggleFeature(planKey, featureKey)}
                disabled={!canEdit || !planVis}
                className={`
                    inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all w-full justify-center
                    ${active
                        ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                        : 'text-gray-400 dark:text-gray-600 line-through hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                    ${!canEdit || !planVis ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
            >
                <span className={`
                    w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center
                    ${active
                        ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40'
                        : 'bg-gray-200/50 dark:bg-white/5 ring-1 ring-gray-300 dark:ring-white/10'
                    }
                `}>
                    {active && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                </span>
                {children}
            </button>
        );
    };

    /* ── Notification/support label helpers (using t()) ── */
    const notifLabel = (val: string) => val === 'full' ? t('notifFull') : t('notifBasic');
    const supportLabel = (val: string) => val === 'priority' ? t('supportPriority') : val === 'email' ? t('supportEmail') : t('supportCommunity');

    return (
        <>
            <div className="space-y-4">
                {/* ── Status bar ── */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        {t('plansVisible', { visible: visiblePlanCount, total: plans.length })}
                    </span>
                    {hiddenFeatureCount > 0 && (
                        <span className="flex items-center gap-1.5">
                            <EyeOff className="w-3.5 h-3.5 text-red-400" />
                            {t('featuresHidden', { count: hiddenFeatureCount })}
                        </span>
                    )}
                </div>

                {/* ── Grid ── */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/5">
                    <table className="w-full text-sm border-collapse">
                        {/* Header */}
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/[0.02]">
                                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-medium border-b border-gray-200 dark:border-white/5 w-48">
                                    {t('feature')}
                                </th>
                                {plans.map(plan => {
                                    const visible = isPlanVisible(plan.key);
                                    return (
                                        <th key={plan.key} className={`py-3 px-3 text-center border-b border-gray-200 dark:border-white/5 transition-opacity ${!visible ? 'opacity-40' : ''}`}>
                                            <button
                                                onClick={() => togglePlan(plan.key)}
                                                disabled={!canEdit}
                                                className={`
                                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all
                                                ${visible
                                                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25'
                                                        : 'bg-red-500/10 text-red-400/60 ring-1 ring-red-500/20 hover:bg-red-500/20 line-through'
                                                    }
                                                ${!canEdit ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                            >
                                                {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {plan.name}
                                                {plan.trialDays > 0 && ` (${plan.trialDays} ${t('days')})`}
                                            </button>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {/* ── Numeric limits ── */}
                            {NUMERIC_KEYS.map(key => (
                                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/5">
                                        {t(key)}
                                    </td>
                                    {plans.map(plan => (
                                        <td key={plan.key} className={`${cellBase} ${!isPlanVisible(plan.key) ? 'opacity-40' : ''}`}>
                                            <FeatureCheckbox planKey={plan.key} featureKey={key}>
                                                <span className="font-mono font-semibold">
                                                    {(plan.limits[key as keyof PlanLimits] as number).toLocaleString('pt-BR')}
                                                </span>
                                            </FeatureCheckbox>
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* ── Separator ── */}
                            <tr>
                                <td colSpan={plans.length + 1} className="py-1 border-b-2 border-dashed border-gray-200 dark:border-white/10" />
                            </tr>

                            {/* ── Boolean features ── */}
                            {BOOLEAN_KEYS.map(key => (
                                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/5">
                                        {t(key)}
                                    </td>
                                    {plans.map(plan => {
                                        const enabled = plan.limits[key as keyof PlanLimits] as boolean;
                                        return (
                                            <td key={plan.key} className={`${cellBase} ${!isPlanVisible(plan.key) ? 'opacity-40' : ''}`}>
                                                <FeatureCheckbox planKey={plan.key} featureKey={key}>
                                                    <span className={`flex items-center gap-1 ${enabled ? 'text-emerald-500' : 'text-red-400/70'}`}>
                                                        {enabled ? '✓' : '✕'}
                                                        <span>{enabled ? t('enabled') : t('disabled')}</span>
                                                    </span>
                                                </FeatureCheckbox>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* ── Separator ── */}
                            <tr>
                                <td colSpan={plans.length + 1} className="py-1 border-b-2 border-dashed border-gray-200 dark:border-white/10" />
                            </tr>

                            {/* ── Popular ── */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="py-2 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/5">
                                    ★ {t('popularPlan')}
                                </td>
                                {plans.map(plan => (
                                    <td key={plan.key} className={`${cellBase} ${!isPlanVisible(plan.key) ? 'opacity-40' : ''}`}>
                                        {plan.isPopular ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                {t('popular')}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-700">—</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* ── Notifications ── */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="py-2 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/5">
                                    {t('notifications')}
                                </td>
                                {plans.map(plan => (
                                    <td key={plan.key} className={`${cellBase} ${!isPlanVisible(plan.key) ? 'opacity-40' : ''}`}>
                                        <FeatureCheckbox planKey={plan.key} featureKey="notifications">
                                            <span className={`flex items-center gap-1 ${plan.limits.notifications === 'full' ? 'text-amber-500' : 'text-gray-500'}`}>
                                                {plan.limits.notifications === 'full' ? '▲' : '■'}
                                                <span>{notifLabel(plan.limits.notifications)}</span>
                                            </span>
                                        </FeatureCheckbox>
                                    </td>
                                ))}
                            </tr>

                            {/* ── Support ── */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="py-2 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/5">
                                    {t('support')}
                                </td>
                                {plans.map(plan => (
                                    <td key={plan.key} className={`${cellBase} ${!isPlanVisible(plan.key) ? 'opacity-40' : ''}`}>
                                        <FeatureCheckbox planKey={plan.key} featureKey="support">
                                            <span className={`flex items-center gap-1 ${plan.limits.support === 'priority' ? 'text-emerald-500' :
                                                    plan.limits.support === 'email' ? 'text-blue-500' :
                                                        'text-gray-500'
                                                }`}>
                                                ■
                                                <span>{supportLabel(plan.limits.support)}</span>
                                            </span>
                                        </FeatureCheckbox>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ── Info ── */}
                <p className="text-[11px] text-gray-400 leading-relaxed">
                    💡 {t('info')}
                </p>

                {/* ── Save button (matching other sections) ── */}
                {canEdit && (
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
                        <Button
                            onClick={handleSave}
                            disabled={isPending || !dirty}
                            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 text-sm font-semibold px-8 py-2.5 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isPending ? t('saving') : t('saveButton')}
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Histórico de Alterações ── */}
            <ChangeHistory
                entries={history}
                booleanFields={['hiddenPlans', 'hiddenFeatures']}
            />
        </>
    );
}
