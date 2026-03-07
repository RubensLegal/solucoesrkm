/**
 * @file page.tsx — Landing Page Principal (/)
 * @description Página raiz com landing page do Tracka estilo Netflix.
 *
 * Usa componentes modulares e configuração do banco via getLandingPageConfig().
 * Pricing vem da API pública do Tracka ou de fallback local.
 * Todos os CTAs redirecionam para tracka.solucoesrkm.com.
 */

import { getLandingPageConfig } from '@/config/landing.config';
import { getTranslations, getMessages } from 'next-intl/server';

// Landing Components (Netflix-style)
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TechnologySection } from '@/components/landing/TechnologySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CallToActionSection } from '@/components/landing/CallToActionSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import type { PricingParams } from '@/config/landing.config';

// ─── SEO Metadata ─────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'tracka' });

    return {
        title: `Tracka — ${t('hero.subtitle')}`,
        description: t('hero.subtitle'),
        openGraph: {
            title: `Tracka — ${t('hero.subtitle')}`,
            description: t('hero.subtitle'),
            images: [{ url: '/hero-bg.jpg', width: 1200, height: 630 }],
        },
    };
}

// ─── Pricing Fetcher ──────────────────────────────────────────────

/** Busca planos da API pública do Tracka com fallback para messages locais. */
async function fetchPricing(t: any): Promise<PricingParams[]> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    const freeExcluded = (() => {
        try { return t.has('pricing.free.excluded') ? t('pricing.free.excluded').split(',') : []; }
        catch { return []; }
    })();

    try {
        const res = await fetch(`${appUrl}/api/public/plans`, {
            next: { revalidate: 3600 }, // Cache 1h (ISR)
        });
        if (res.ok) {
            const data = await res.json();
            if (data.plans?.length > 0) {
                // Enrich Free plan with excludedFeatures from i18n
                return data.plans.map((plan: PricingParams) => {
                    if (plan.name === 'Free' && (!plan.excludedFeatures || plan.excludedFeatures.length === 0)) {
                        return { ...plan, excludedFeatures: freeExcluded };
                    }
                    return plan;
                });
            }
        }
    } catch {
        // Fallback silencioso para dados locais
    }
    return [
        {
            name: t('pricing.free.name'),
            price: t('pricing.free.price'),
            description: t('pricing.free.desc'),
            features: t('pricing.free.features').split(','),
            excludedFeatures: freeExcluded,
            isPopular: false,
            buttonText: t('pricing.free.button'),
            buttonLink: '/register',
        },
        {
            name: t('pricing.plus.name'),
            price: t('pricing.plus.price'),
            description: t('pricing.plus.desc'),
            features: t('pricing.plus.features').split(','),
            isPopular: true,
            buttonText: t('pricing.plus.button'),
            buttonLink: '/register?plan=plus',
        },
        {
            name: t('pricing.pro.name'),
            price: t('pricing.pro.price'),
            description: t('pricing.pro.desc'),
            features: t('pricing.pro.features').split(','),
            isPopular: false,
            buttonText: t('pricing.pro.button'),
            buttonLink: '/register?plan=pro',
        },
    ];
}

// ─── Page Component ───────────────────────────────────────────────

export default async function TrackaLandingPage() {
    const [t, tc, config] = await Promise.all([
        getTranslations('tracka'),
        getTranslations('corporate'),
        getLandingPageConfig(),
    ]);

    const showFeatures = config.showFeatures !== false;
    const faqItems = config.faq?.length ? config.faq : t.raw('faq.items') || [];
    const pricingItems = await fetchPricing(t);

    const footerLinks = config.footerLinks?.length ? config.footerLinks : [
        { label: tc('footer.links.faq'), href: '/faq' },
        { label: tc('footer.links.terms'), href: '/terms' },
        { label: tc('footer.links.privacy'), href: '/privacy' },
        { label: tc('footer.links.cookies'), href: '/cookies' },
        { label: tc('footer.links.legal'), href: '/legal' },
    ];

    return (
        <div className="min-h-screen text-white overflow-x-hidden font-sans" style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 20%, #0a0a1a 40%, #080816 100%)',
        }}>
            {/* ─── Header ─── */}
            <LandingHeader
                logoText="Tracka"
                navHome={tc('nav.home')}
                navFeatures={t('features.title')}
                navPricing={t('pricing.title')}
                navAbout="Soluções RKM"
                loginText={tc('login')}
            />

            {/* ─── Hero ─── */}
            <HeroSection
                title="Tracka"
                subtitle={config.heroSubtitle || t('hero.subtitle')}
                image={config.heroImage || '/hero-bg.jpg'}
                badgeNew={t('hero.badge_new')}
                badgeOriginal={t('hero.badge_original')}
                ctaPrimary={config.ctaPrimaryText || t('hero.cta_primary')}
                ctaSecondary={t('hero.cta_secondary')}
            />

            {/* ─── Content Sections ─── */}
            <div className="relative z-20 -mt-32 pl-4 md:pl-12 pb-20 space-y-16">
                {/* Features */}
                {showFeatures && (
                    <FeaturesSection
                        title={config.featuresTitle || t('features.title')}
                        viewAllText={t('features.view_all')}
                        features={{
                            search: { title: t('features.search.title'), desc: t('features.search.desc') },
                            moving: { title: t('features.moving.title'), desc: t('features.moving.desc') },
                            multi_device: { title: t('features.multi_device.title'), desc: t('features.multi_device.desc') },
                            security: { title: t('features.security.title'), desc: t('features.security.desc') },
                        }}
                    />
                )}

                {/* Technology */}
                <TechnologySection
                    title={config.techTitle || t('technology.title')}
                    viewAllText={t('features.view_all')}
                    features={{
                        tech: { title: t('technology.tech.title'), desc: t('technology.tech.desc') },
                        user_focus: { title: t('technology.user_focus.title'), desc: t('technology.user_focus.desc') },
                        innovation: { title: t('technology.innovation.title'), desc: t('technology.innovation.desc') },
                    }}
                />

                {/* Testimonials (conditional) */}
                {config.showTestimonials && config.testimonials && config.testimonials.length > 0 && (
                    <TestimonialsSection items={config.testimonials} />
                )}

                {/* Pricing */}
                {config.showPricing !== false && pricingItems.length > 0 && (
                    <PricingSection
                        items={pricingItems}
                        title={t('pricing.title')}
                        subtitle={t('pricing.subtitle')}
                        trialText={t('pricing.trial')}
                    />
                )}

                {/* CTA + FAQ + Footer */}
                <div className="mt-20">
                    <CallToActionSection
                        title={config.footerCtaTitle || t('cta.title')}
                        subtitle={config.footerCtaSubtitle || t('cta.subtitle')}
                        buttonText={config.footerCtaButton || t('cta.button')}
                    />

                    {config.showFaq !== false && faqItems.length > 0 && (
                        <FAQSection title={t('faq.title')} items={faqItems} />
                    )}

                    <LandingFooter
                        contactText={config.footerContact || tc('footer.contact')}
                        copyrightText={tc('footer.rights', { year: new Date().getFullYear() })}
                        links={footerLinks}
                    />
                </div>
            </div>
        </div>
    );
}
