'use client';

/**
 * @file PricingVisibilityForm.tsx
 * @description Grid de checkboxes para controlar quais planos e features
 * aparecem na landing page da empresa. READ-ONLY dos dados do Tracka;
 * apenas salva visibilidade em SiteSettings (key: pricing_visibility).
 *
 * Os planos são passados como prop (fetch ocorre server-side no page.tsx).
 */

import { useState, useTransition } from 'react';
import { Check, Eye, EyeOff, Loader2, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateSiteSettings } from '@/actions/site-settings.actions';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────────── */

export interface PlanFromApi {
    name: string;
    price: string;
    description: string;
    features: string[];
    excludedFeatures?: string[];
    isPopular: boolean;
    buttonText: string;
    buttonLink: string;
}

export interface PricingVisibilityConfig {
    hiddenPlans: string[];
    hiddenFeatures: Record<string, string[]>;
}

interface Props {
    plans: PlanFromApi[];
    canEdit?: boolean;
    initialVisibility?: PricingVisibilityConfig | null;
}

/* ─── Defaults ──────────────────────────────────────────────── */

const EMPTY_VISIBILITY: PricingVisibilityConfig = {
    hiddenPlans: [],
    hiddenFeatures: {},
};

/* ═══════════════════ COMPONENT ═══════════════════════════════ */

export function PricingVisibilityForm({ plans, canEdit = true, initialVisibility }: Props) {
    const [isPending, startTransition] = useTransition();

    // Visibility state (what's hidden)
    const [visibility, setVisibility] = useState<PricingVisibilityConfig>(
        initialVisibility || EMPTY_VISIBILITY
    );
    const [dirty, setDirty] = useState(false);

    /* ── Toggle plan visibility ── */
    const togglePlan = (planName: string) => {
        if (!canEdit) return;
        setVisibility(prev => {
            const hidden = prev.hiddenPlans.includes(planName)
                ? prev.hiddenPlans.filter(p => p !== planName)
                : [...prev.hiddenPlans, planName];
            return { ...prev, hiddenPlans: hidden };
        });
        setDirty(true);
    };

    /* ── Toggle feature visibility ── */
    const toggleFeature = (planName: string, feature: string) => {
        if (!canEdit) return;
        setVisibility(prev => {
            const planFeatures = prev.hiddenFeatures[planName] || [];
            const newFeatures = planFeatures.includes(feature)
                ? planFeatures.filter(f => f !== feature)
                : [...planFeatures, feature];

            return {
                ...prev,
                hiddenFeatures: { ...prev.hiddenFeatures, [planName]: newFeatures },
            };
        });
        setDirty(true);
    };

    /* ── Helpers ── */
    const isPlanVisible = (planName: string) => !visibility.hiddenPlans.includes(planName);
    const isFeatureVisible = (planName: string, feature: string) =>
        !(visibility.hiddenFeatures[planName] || []).includes(feature);

    /* ── Save ── */
    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateSiteSettings('pricing_visibility', visibility);
                toast.success('Visibilidade dos planos salva!');
                setDirty(false);
            } catch {
                toast.error('Erro ao salvar visibilidade');
            }
        });
    };

    /* ── Count visible ── */
    const visiblePlans = plans.filter(p => isPlanVisible(p.name));
    const totalFeatures = plans.reduce((acc, p) => acc + p.features.length, 0);
    const hiddenFeatureCount = Object.values(visibility.hiddenFeatures)
        .reduce((acc, arr) => acc + arr.length, 0);

    /* ── Empty state ── */
    if (plans.length === 0) {
        return (
            <div className="py-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">Não foi possível carregar os planos do Tracka.</span>
                </div>
                <p className="text-xs text-gray-500">Verifique se o Tracka está acessível e recarregue a página.</p>
            </div>
        );
    }

    /* ── All unique features across all plans ── */
    const allFeatures = Array.from(
        new Set(plans.flatMap(p => [...p.features, ...(p.excludedFeatures || [])]))
    );

    return (
        <div className="space-y-6">
            {/* ── Status bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        {visiblePlans.length}/{plans.length} planos visíveis
                    </span>
                    <span className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-red-400" />
                        {hiddenFeatureCount}/{totalFeatures} features ocultas
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {dirty && canEdit && (
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="gap-1.5 text-xs bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
                        >
                            {isPending
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
                                : <><Save className="w-3.5 h-3.5" /> Salvar</>
                            }
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    {/* Header: plan columns */}
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-medium border-b border-gray-200 dark:border-white/5">
                                Feature
                            </th>
                            {plans.map(plan => {
                                const visible = isPlanVisible(plan.name);
                                return (
                                    <th key={plan.name} className={`py-3 px-4 text-center border-b border-gray-200 dark:border-white/5 transition-opacity ${!visible ? 'opacity-40' : ''}`}>
                                        <div className="flex flex-col items-center gap-2">
                                            {/* Plan toggle */}
                                            <button
                                                onClick={() => togglePlan(plan.name)}
                                                disabled={!canEdit}
                                                className={`
                                                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all
                                                    ${visible
                                                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25'
                                                        : 'bg-red-500/10 text-red-400/60 ring-1 ring-red-500/20 hover:bg-red-500/20 line-through'
                                                    }
                                                    ${!canEdit ? 'cursor-not-allowed' : 'cursor-pointer'}
                                                `}
                                            >
                                                {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {plan.name}
                                            </button>
                                            {/* Price */}
                                            <span className="text-[11px] text-gray-500 font-normal">{plan.price}</span>
                                            {plan.isPopular && (
                                                <span className="text-[10px] text-amber-400 font-medium">★ Popular</span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    {/* Body: feature rows */}
                    <tbody>
                        {allFeatures.map((feature, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300 text-xs font-medium border-b border-gray-100 dark:border-white/5 whitespace-nowrap">
                                    {feature}
                                </td>
                                {plans.map(plan => {
                                    const planVisible = isPlanVisible(plan.name);
                                    const hasFeature = plan.features.includes(feature);
                                    const isExcluded = plan.excludedFeatures?.includes(feature);
                                    const featureVisible = isFeatureVisible(plan.name, feature);

                                    // Feature doesn't exist in this plan
                                    if (!hasFeature && !isExcluded) {
                                        return (
                                            <td key={plan.name} className="py-2.5 px-4 text-center border-b border-gray-100 dark:border-white/5">
                                                <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                                            </td>
                                        );
                                    }

                                    // Excluded feature (❌ — not available in this plan)
                                    if (isExcluded) {
                                        return (
                                            <td key={plan.name} className={`py-2.5 px-3 border-b border-gray-100 dark:border-white/5 ${!planVisible ? 'opacity-40' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-4 h-4 rounded flex items-center justify-center bg-red-500/10 shrink-0">
                                                        <span className="text-red-400/60 text-[10px]">✕</span>
                                                    </span>
                                                    <span className="text-xs text-gray-400 line-through">{feature}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Included feature with checkbox + text
                                    return (
                                        <td key={plan.name} className={`py-2.5 px-3 border-b border-gray-100 dark:border-white/5 ${!planVisible ? 'opacity-40' : ''}`}>
                                            <button
                                                onClick={() => toggleFeature(plan.name, feature)}
                                                disabled={!canEdit || !planVisible}
                                                className={`
                                                    flex items-center gap-2 w-full text-left rounded-md px-1.5 py-1 transition-all
                                                    ${!canEdit || !planVisible ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5'}
                                                `}
                                            >
                                                <span className={`
                                                    w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all
                                                    ${featureVisible && planVisible
                                                        ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40'
                                                        : 'bg-gray-200/50 dark:bg-white/5 ring-1 ring-gray-300 dark:ring-white/10'
                                                    }
                                                `}>
                                                    {featureVisible && planVisible && (
                                                        <Check className="w-3 h-3 text-emerald-400" />
                                                    )}
                                                </span>
                                                <span className={`text-xs leading-tight ${featureVisible && planVisible
                                                    ? 'text-gray-700 dark:text-gray-300'
                                                    : 'text-gray-400 dark:text-gray-600 line-through'
                                                    }`}>
                                                    {feature}
                                                </span>
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Info ── */}
            <p className="text-[11px] text-gray-400 leading-relaxed">
                💡 Esta configuração <strong>não altera os planos no Tracka</strong> — apenas controla o que é exibido
                na landing page para fins de marketing. Os dados vêm da API do Tracka.
            </p>
        </div>
    );
}
