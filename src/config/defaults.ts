/**
 * @file defaults.ts
 * @description Valores padrão para a landing page.
 *
 * Usados quando o banco não tem config salva.
 * Admin pode customizar tudo via /admin/settings.
 */

import { LandingPageConfig } from '@/config/landing.config';

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
    heroImage: '/hero-bg.jpg',

    showFeatures: true,
    showTechnology: true,
    showPricing: true,
    showTestimonials: false,
    showFaq: true,
};
