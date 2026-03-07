/**
 * @file landing.config.ts
 * @description Interfaces e fetcher para configuração da Landing Page.
 *
 * A landing page é totalmente configurável via admin/settings.
 * getLandingPageConfig() faz smart merge: DB overrides defaults.
 */

import { getSiteSettings } from '@/actions/site-settings.actions';
import { DEFAULT_LANDING_CONFIG } from './defaults';

// ─── Tipos dos blocos dinâmicos ──────────────────────────────────

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FooterLinkItem {
    label: string;
    href: string;
}

export interface PricingParams {
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular: boolean;
    buttonText: string;
    buttonLink: string;
}

export interface TestimonialItem {
    name: string;
    role: string;
    content: string;
}

export interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

// ─── Config principal ────────────────────────────────────────────

export interface LandingPageConfig {
    // Hero
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;

    // Visibility flags
    showFeatures?: boolean;
    showTechnology?: boolean;
    showPricing?: boolean;
    showTestimonials?: boolean;
    showFaq?: boolean;

    // Textos customizáveis
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    featuresTitle?: string;
    techTitle?: string;

    // Footer CTA
    footerCtaTitle?: string;
    footerCtaSubtitle?: string;
    footerCtaButton?: string;

    // Contato
    footerContact?: string;

    // Conteúdo dinâmico
    features?: FeatureItem[];
    testimonials?: TestimonialItem[];
    faq?: FAQItem[];
    footerLinks?: FooterLinkItem[];
}

// ─── Fetcher com smart merge ─────────────────────────────────────

/**
 * Busca config da landing no banco e faz merge com defaults.
 * Valores vazios (null, undefined, '', []) são ignorados — usa o default.
 */
export async function getLandingPageConfig(): Promise<LandingPageConfig> {
    const settings = await getSiteSettings('landing_page_config');

    if (!settings) return DEFAULT_LANDING_CONFIG;

    const merged: Record<string, any> = { ...DEFAULT_LANDING_CONFIG };

    for (const [key, value] of Object.entries(settings)) {
        if (value === null || value === undefined) continue;
        if (typeof value === 'string' && value.trim() === '') continue;
        if (Array.isArray(value) && value.length === 0) continue;
        merged[key] = value;
    }

    return merged as LandingPageConfig;
}
