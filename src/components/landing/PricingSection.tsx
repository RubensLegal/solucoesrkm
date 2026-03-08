/**
 * @file PricingSection.tsx
 * @description Seção de planos e preços com design premium.
 *
 * Exibe planos vindos da API pública do Tracka ou de defaults.
 * Botões de compra redirecionam para tracka.solucoesrkm.com/register.
 * Em EN, detecta a moeda local do visitante e converte BRL→moeda local
 * com câmbio ao vivo via AwesomeAPI.
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, X, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingParams } from '@/config/landing.config';
import { detectCurrency, fetchExchangeRate, convertFromBRL, getCacheKey, type CurrencyInfo } from '@/lib/currency-utils';

interface PricingSectionProps {
    items: PricingParams[];
    locale?: string;
    title?: string;
    subtitle?: string;
    trialText?: string;
    includedLabel?: string;
    popularLabel?: string;
}

export function PricingSection({
    items, locale = 'pt', title, subtitle, trialText,
    includedLabel, popularLabel
}: PricingSectionProps) {
    const [currency, setCurrency] = useState<CurrencyInfo>({ code: 'USD', symbol: '$', name: 'US Dollar' });
    const [exchangeRate, setExchangeRate] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('exchange_rate_USD_BRL');
            if (cached) return parseFloat(cached);
        }
        return 5.70;
    });
    const [rateLoaded, setRateLoaded] = useState(false);

    const BRL_PRICES: Record<string, number> = { plus: 9.90, pro: 19.90 };

    const toLocal = (brl: number) => convertFromBRL(brl, exchangeRate);

    // Detect currency and fetch rate (EN only)
    useEffect(() => {
        if (locale !== 'en') return;

        const detected = detectCurrency();
        setCurrency(detected);

        // Try cached rate first
        const cacheKey = getCacheKey(detected.code);
        const cached = localStorage.getItem(cacheKey);
        if (cached) setExchangeRate(parseFloat(cached));

        // Fetch live rate
        fetchExchangeRate(detected.code)
            .then(rate => {
                if (rate) {
                    setExchangeRate(rate);
                    localStorage.setItem(cacheKey, rate.toString());
                }
            })
            .finally(() => setRateLoaded(true));
    }, [locale]);

    if (!items || items.length === 0) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    const getPlanKey = (name: string) => {
        const lower = name.toLowerCase();
        if (lower === 'plus') return 'plus';
        if (lower === 'pro') return 'pro';
        return null;
    };

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
                    {items.map((plan, index) => {
                        const planKey = getPlanKey(plan.name);
                        const brlPrice = planKey ? BRL_PRICES[planKey] : null;
                        const showConverted = locale === 'en' && brlPrice;

                        return (
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
                                                {popularLabel || 'Popular'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* Plan name + price */}
                                <div className="mb-6 relative z-10">
                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                                    <div className="flex items-baseline gap-1 flex-wrap">
                                        {showConverted ? (
                                            <>
                                                <span className="text-4xl font-bold" style={plan.isPopular ? {
                                                    background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                } : {}}>~{currency.symbol}{toLocal(brlPrice)}</span>
                                                <span className="text-gray-500">/mo</span>
                                                <span className="text-xs text-gray-600 ml-1">
                                                    (R$ {brlPrice.toFixed(2).replace('.', ',')})
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-bold" style={plan.isPopular ? {
                                                    background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                } : {}}>{plan.price}</span>
                                                {plan.price !== 'Grátis' && plan.price !== 'Free' && !plan.price.includes('/') && <span className="text-gray-500">/mês</span>}
                                            </>
                                        )}
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

                                {/* Features */}
                                <div className="flex-1 space-y-3 relative z-10">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${plan.isPopular ? 'bg-indigo-500/20' : 'bg-emerald-500/15'}`}>
                                                <Check className={`w-3.5 h-3.5 ${plan.isPopular ? 'text-indigo-400' : 'text-emerald-400'}`} />
                                            </div>
                                            <span className="text-sm text-gray-300">{feature}</span>
                                        </div>
                                    ))}
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
                        );
                    })}
                </div>

                {/* Currency disclaimer (EN only) */}
                {locale === 'en' && (
                    <div className="mt-10 max-w-3xl mx-auto">
                        <div className="flex items-start gap-3 p-4 rounded-xl" style={{
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                        }}>
                            <span className="text-lg shrink-0 mt-0.5">💱</span>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-amber-400">
                                    Reference rate: 1 {currency.code} ≈ {exchangeRate.toFixed(2)} BRL
                                    {rateLoaded && (
                                        <span className="ml-1 font-normal text-amber-500/70">(live)</span>
                                    )}
                                </p>
                                <p className="text-xs text-amber-500/60 leading-relaxed">
                                    Prices shown in {currency.code} are approximate, based on a reference rate of 1 {currency.code} ≈ {exchangeRate.toFixed(2)} BRL.
                                    The final amount will be automatically calculated in {currency.code} at the current exchange rate at the time of payment.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
