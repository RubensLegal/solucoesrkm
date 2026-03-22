/**
 * @file landing.types.ts
 * @description Tipos compartilhados para a landing page e seus componentes.
 */

/** Item de FAQ. */
export interface FAQItem {
    question: string;
    answer: string;
}

/** Link do rodapé. */
export interface FooterLinkItem {
    label: string;
    href: string;
}

/** Feature individual de um plano de pricing. */
export interface PricingFeature {
    /** Chave da feature (ex: 'items', 'visionAi', 'roomsPerHouse') */
    key: string;
    /** Texto de exibição (ex: '50 Itens', 'Histórico de uso') */
    text: string;
}

/** Parâmetros de um plano de pricing. */
export interface PricingParams {
    name: string;
    price: string;
    description: string;
    features: PricingFeature[];
    excludedFeatures?: PricingFeature[];
    isPopular: boolean;
    isTrial?: boolean;
    buttonText: string;
    buttonLink: string;
}

/** Depoimento de cliente. */
export interface TestimonialItem {
    name: string;
    role: string;
    content: string;
}

/** Feature para exibição em cards. */
export interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

/** Configuração completa da landing page (merge de defaults + DB). */
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

    // Tooltips das features de pricing
    featureTooltips?: Record<string, string>;
}
