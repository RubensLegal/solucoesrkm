/**
 * @file PricingSection.tsx
 * @description Seção de planos e preços com design premium.
 *
 * Exibe planos vindos da API pública do Tracka ou de defaults.
 * Botões de compra redirecionam para tracka.solucoesrkm.com/register.
 * Suporta features incluídas (✓) e excluídas (✗).
 */

'use client';

import { Check, X, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingParams } from '@/config/landing.config';

interface PricingSectionProps {
    items: PricingParams[];
    title?: string;
    subtitle?: string;
    trialText?: string;
    includedLabel?: string;
}

export function PricingSection({ items, title, subtitle, trialText, includedLabel }: PricingSectionProps) {
    if (!items || items.length === 0) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    return (
        <section id="pricing" className="py-24 text-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-6 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>{title || 'Planos e Preços'}</h2>
                    {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
                </div>

                {/* Trial badge */}
                {trialText && (
                    <div className="flex justify-center mb-14">
                        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
                            style={{
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                color: '#c4b5fd',
                            }}>
                            <Sparkles className="w-4 h-4" />
                            {trialText}
                        </span>
                    </div>
                )}

                {/* Cards grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {items.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 ${plan.isPopular
                                ? 'hover:shadow-2xl hover:shadow-indigo-500/20'
                                : 'hover:shadow-xl hover:shadow-white/5'
                                }`}
                            style={{
                                background: plan.isPopular
                                    ? 'linear-gradient(135deg, rgba(30, 30, 60, 0.9), rgba(20, 20, 50, 0.95))'
                                    : 'linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(15, 15, 25, 0.9))',
                                border: plan.isPopular
                                    ? '1px solid rgba(99, 102, 241, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                        >
                            {/* Popular badge */}
                            {plan.isPopular && (
                                <>
                                    <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1))',
                                        filter: 'blur(1px)',
                                        zIndex: 0,
                                    }} />
                                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 z-10">
                                        <span className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg" style={{
                                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                        }}>
                                            <Crown className="w-3.5 h-3.5" />
                                            Popular
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Plan name + price */}
                            <div className="mb-6 relative z-10">
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold" style={plan.isPopular ? {
                                        background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    } : {}}>{plan.price}</span>
                                    {plan.price !== 'Grátis' && plan.price !== 'Free' && !plan.price.includes('/mês') && !plan.price.includes('/mo') && <span className="text-gray-500">/mês</span>}
                                </div>
                            </div>

                            {/* CTA button */}
                            <div className="relative z-10 mb-8">
                                <Button
                                    variant={plan.isPopular ? 'primary' : 'secondary'}
                                    className={`w-full ${plan.isPopular ? '' : 'border-white/10 hover:bg-white/5'}`}
                                    style={plan.isPopular ? {
                                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                    } : {}}
                                    href={`${appUrl}${plan.buttonLink}`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>

                            {/* Divider */}
                            <div className="relative z-10 border-t border-white/10 pt-6 mb-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    {includedLabel || "What's included"}
                                </p>
                            </div>

                            {/* Included features */}
                            <div className="flex-1 space-y-3 relative z-10">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${plan.isPopular ? 'bg-indigo-500/20' : 'bg-emerald-500/15'}`}>
                                            <Check className={`w-3.5 h-3.5 ${plan.isPopular ? 'text-indigo-400' : 'text-emerald-400'}`} />
                                        </div>
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </div>
                                ))}

                                {/* Excluded features */}
                                {plan.excludedFeatures && plan.excludedFeatures.length > 0 && plan.excludedFeatures.map((feature, idx) => (
                                    <div key={`excl-${idx}`} className="flex items-start gap-3">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-red-500/10">
                                            <X className="w-3.5 h-3.5 text-red-400/60" />
                                        </div>
                                        <span className="text-sm text-gray-600 line-through">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
