/**
 * @file page.tsx — Landing Page Principal (/)
 * @description Página raiz com landing page do Tracka estilo Netflix.
 *
 * Usa componentes modulares e configuração do banco via getLandingPageConfig().
 * Pricing vem da API pública do Tracka ou de fallback local.
 * Todos os CTAs redirecionam para tracka.solucoesrkm.com.
 */

import { getLandingPageConfig } from '@/config/landing.config';
import { getTranslations, getLocale } from 'next-intl/server';
import { getSiteSettings } from '@/actions/site-settings.actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { PricingVisibility } from '@/types';

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solucoesrkm.com';

    const pageTitle = `Tracka — ${t('hero.subtitle')}`;
    const pageDescription = t('hero.subtitle');
    const ogImage = `${siteUrl}/hero-bg.png`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: locale === 'pt'
            ? 'inventário pessoal, organizar pertences, gestão de mudanças, catalogar itens, app de inventário, Tracka'
            : 'personal inventory, organize belongings, moving management, catalog items, inventory app, Tracka',
        alternates: {
            canonical: `${siteUrl}/${locale}`,
            languages: {
                'pt': `${siteUrl}/pt`,
                'en': `${siteUrl}/en`,
            },
        },
        openGraph: {
            type: 'website',
            siteName: 'Soluções RKM',
            locale: locale === 'pt' ? 'pt_BR' : 'en_US',
            title: pageTitle,
            description: pageDescription,
            url: `${siteUrl}/${locale}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: 'Tracka — Smart Inventory Management' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [ogImage],
        },
    };
}

// ─── Pricing Fetcher ──────────────────────────────────────────────

/**
 * Busca planos da API pública do Tracka.
 * Aplica filtro de visibilidade (pricing_visibility do admin).
 * Fallback: usa traduções i18n se a API falhar.
 */
async function fetchPricing(t: any): Promise<PricingParams[]> {
    noStore(); // Sempre buscar dados frescos do banco
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';
    const visibility: PricingVisibility | null = await getSiteSettings('pricing_visibility');

    // Tenta buscar da API do Tracka (mesmo endpoint do admin)
    let plans: PricingParams[] = [];
    try {
        const res = await fetch(`${APP_URL}/api/plan-config`, {
            cache: 'no-store',
        });
        if (res.ok) {
            const plansConfig: Record<string, any> = await res.json();

            // Transformar PlansConfig → PricingParams[] (inclui trial)
            const PLAN_ORDER = ['free', 'trial', 'plus', 'pro'];
            for (const key of PLAN_ORDER) {
                const plan = plansConfig[key];
                if (!plan) continue;
                const lim = plan.limits || {};

            // Montar features como objetos { key, text }
                const numericFeatures: { key: string; text: string }[] = [];
                if (lim.items != null) numericFeatures.push({ key: 'items', text: `${Number(lim.items).toLocaleString('pt-BR')} Itens` });
                if (lim.visionAi != null) numericFeatures.push({ key: 'visionAi', text: `${Number(lim.visionAi).toLocaleString('pt-BR')} Vision AI 🤖` });
                if (lim.houses != null) numericFeatures.push({ key: 'houses', text: `${Number(lim.houses).toLocaleString('pt-BR')} Casas` });
                if (lim.roomsPerHouse != null) numericFeatures.push({ key: 'roomsPerHouse', text: `${Number(lim.roomsPerHouse).toLocaleString('pt-BR')} Cômodos/casa` });
                if (lim.furniturePerRoom != null) numericFeatures.push({ key: 'furniturePerRoom', text: `${Number(lim.furniturePerRoom).toLocaleString('pt-BR')} Móveis/cômodo` });
                if (lim.photosPerItem != null) numericFeatures.push({ key: 'photosPerItem', text: `${Number(lim.photosPerItem).toLocaleString('pt-BR')} Fotos/item` });
                if (lim.collaboratorsPerHouse != null) numericFeatures.push({ key: 'collaboratorsPerHouse', text: `${Number(lim.collaboratorsPerHouse).toLocaleString('pt-BR')} Colaboradores/casa` });

                const booleanFeatures: { key: string; text: string }[] = [];
                if (lim.history) booleanFeatures.push({ key: 'history', text: 'Histórico de uso' });
                if (lim.ranking) booleanFeatures.push({ key: 'ranking', text: 'Ranking (mais usados)' });
                if (lim.importExcel) booleanFeatures.push({ key: 'importExcel', text: 'Importação (Excel)' });
                if (lim.exportData) booleanFeatures.push({ key: 'exportData', text: 'Exportação de dados' });
                if (lim.consolidation) booleanFeatures.push({ key: 'consolidation', text: 'Consolidação/Mudança' });
                if (lim.aiAssistant) booleanFeatures.push({ key: 'aiAssistant', text: 'Assistente IA 🤖' });

                // Trial plan: todas as features incluídas, sem excluded
                const isTrial = key === 'trial';
                const excludedFeatures: { key: string; text: string }[] = [];
                if (!isTrial) {
                    if (!lim.history) excludedFeatures.push({ key: 'history', text: 'Histórico de uso' });
                    if (!lim.ranking) excludedFeatures.push({ key: 'ranking', text: 'Ranking (mais usados)' });
                    if (!lim.importExcel) excludedFeatures.push({ key: 'importExcel', text: 'Importação (Excel)' });
                    if (!lim.exportData) excludedFeatures.push({ key: 'exportData', text: 'Exportação de dados' });
                    if (!lim.consolidation) excludedFeatures.push({ key: 'consolidation', text: 'Consolidação/Mudança' });
                    if (!lim.aiAssistant) excludedFeatures.push({ key: 'aiAssistant', text: 'Assistente IA 🤖' });
                }

                // Determine button text and link
                let buttonText: string;
                let buttonLink: string;
                if (key === 'free') {
                    buttonText = t('pricing.free.button');
                    buttonLink = '/register';
                } else if (isTrial) {
                    buttonText = t('pricing.free.button'); // "Começar Grátis"
                    buttonLink = '/register';
                } else {
                    buttonText = t('pricing.plus.button');
                    buttonLink = `/register?plan=${key}`;
                }

                plans.push({
                    name: plan.name || key.charAt(0).toUpperCase() + key.slice(1),
                    price: isTrial ? t('pricing.trial_price') : (plan.price || (key === 'free' ? 'Grátis' : '')),
                    description: isTrial ? t('pricing.trial_desc') : (plan.description || ''),
                    features: [...numericFeatures, ...booleanFeatures],
                    excludedFeatures: excludedFeatures.length > 0 ? excludedFeatures : undefined,
                    isPopular: plan.isPopular || false,
                    isTrial: isTrial,
                    buttonText,
                    buttonLink,
                });
            }
        }
    } catch {
        // Silently fall through to i18n fallback
    }

    // Fallback: i18n (se API falhar ou retornar vazio)
    // Para o fallback, usamos key genérica 'fallback' pois não temos keys individuais
    if (plans.length === 0) {
        const freeExcluded = (() => {
            try { return t.has('pricing.free.excluded') ? t('pricing.free.excluded').split(',') : []; }
            catch { return []; }
        })();

        const toFeatures = (csv: string): { key: string; text: string }[] =>
            csv.split(',').map((text, i) => ({ key: `fallback_${i}`, text: text.trim() }));

        plans = [
            {
                name: t('pricing.free.name'),
                price: t('pricing.free.price'),
                description: t('pricing.free.desc'),
                features: toFeatures(t('pricing.free.features')),
                excludedFeatures: freeExcluded.map((text: string, i: number) => ({ key: `fallback_excl_${i}`, text: text.trim() })),
                isPopular: false,
                buttonText: t('pricing.free.button'),
                buttonLink: '/register',
            },
            {
                name: t('pricing.plus.name'),
                price: t('pricing.plus.price'),
                description: t('pricing.plus.desc'),
                features: toFeatures(t('pricing.plus.features')),
                isPopular: true,
                buttonText: t('pricing.plus.button'),
                buttonLink: '/register?plan=plus',
            },
            {
                name: t('pricing.pro.name'),
                price: t('pricing.pro.price'),
                description: t('pricing.pro.desc'),
                features: toFeatures(t('pricing.pro.features')),
                isPopular: false,
                buttonText: t('pricing.pro.button'),
                buttonLink: '/register?plan=pro',
            },
        ];
    }

    // Aplicar filtro de visibilidade (marketing)
    if (visibility) {
        // Ocultar planos inteiros (case-insensitive: "free" matches "Free")
        plans = plans.filter(p =>
            !visibility.hiddenPlans.some(hp =>
                hp.toLowerCase() === p.name.toLowerCase()
            )
        );

        // Ocultar features individuais (agora usa feature.key diretamente!)
        plans = plans.map(p => {
            const hiddenKeys =
                visibility.hiddenFeatures[p.name] ||
                visibility.hiddenFeatures[p.name.toLowerCase()] ||
                [];

            if (hiddenKeys.length === 0) return p;

            return {
                ...p,
                features: p.features.filter(f => !hiddenKeys.includes(f.key)),
            };
        });
    }

    return plans;
}

// ─── Page Component ───────────────────────────────────────────────

export default async function TrackaLandingPage() {
    const locale = await getLocale();
    const [t, tc, config] = await Promise.all([
        getTranslations('tracka'),
        getTranslations('corporate'),
        getLandingPageConfig(locale),
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

    // ─── JSON-LD Structured Data ──────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solucoesrkm.com';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                name: 'Tracka',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                description: t('hero.subtitle'),
                url: appUrl,
                offers: pricingItems
                    .filter(p => p.price !== 'Grátis' && p.price !== 'Free')
                    .map(p => ({
                        '@type': 'Offer',
                        name: p.name,
                        priceCurrency: 'BRL',
                        price: p.price.replace(/[^\d,]/g, '').replace(',', '.'),
                        description: p.description,
                    })),
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '150',
                },
            },
            {
                '@type': 'Organization',
                name: 'Soluções RKM',
                url: siteUrl,
                logo: `${siteUrl}/logo.png`,
                contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'suporte@solucoesrkm.com',
                    contactType: 'customer service',
                },
            },
            ...(faqItems.length > 0 ? [{
                '@type': 'FAQPage',
                mainEntity: faqItems.map((item: { question: string; answer: string }) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
            }] : []),
        ],
    };

    return (
        <div className="min-h-screen text-white overflow-x-hidden font-sans" style={{
            background: 'var(--landing-gradient-page)',
        }}>
            {/* ─── Structured Data (JSON-LD) ─── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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
                image={(config.heroImage || '/hero-bg.png').replace('hero-bg.jpg', 'hero-bg.png')}
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
                        dynamicFeatures={config.features}
                    />
                )}

                {/* Technology (conditional) */}
                {config.showTechnology !== false && (
                    <TechnologySection
                        title={config.techTitle || t('technology.title')}
                        viewAllText={t('features.view_all')}
                        features={{
                            tech: { title: t('technology.tech.title'), desc: t('technology.tech.desc') },
                            user_focus: { title: t('technology.user_focus.title'), desc: t('technology.user_focus.desc') },
                            innovation: { title: t('technology.innovation.title'), desc: t('technology.innovation.desc') },
                        }}
                    />
                )}

                {/* Testimonials (conditional) */}
                {config.showTestimonials && config.testimonials && config.testimonials.length > 0 && (
                    <TestimonialsSection items={config.testimonials} />
                )}

                {/* Pricing */}
                {config.showPricing !== false && pricingItems.length > 0 && (
                    <PricingSection
                        items={pricingItems}
                        locale={locale}
                        title={t('pricing.title')}
                        subtitle={t('pricing.subtitle')}
                        trialText={t('pricing.trial')}
                        includedLabel={t('pricing.included_label')}
                        popularLabel={t('pricing.plus.popular')}
                        featureTooltips={config.featureTooltips}
                        trialNoCardText={t('pricing.trial_no_card')}
                    />
                )}

                {/* CTA + FAQ + Footer */}
                <div className="mt-20">
                    <CallToActionSection
                        title={config.footerCtaTitle || t('cta.title')}
                        subtitle={config.footerCtaSubtitle || t('cta.subtitle')}
                        buttonText={config.footerCtaButton || t('cta.button')}
                        badgeText={t('cta.badge')}
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
