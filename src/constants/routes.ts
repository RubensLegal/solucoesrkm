/**
 * @file routes.ts
 * @description Constantes de rotas para navegação e redirects.
 *
 * Centralizar rotas evita links quebrados e facilita refatoração.
 */

export const ROUTES = {
    // Públicas
    HOME: '/',
    ABOUT: '/about',
    FAQ: '/faq',
    HELP: '/help',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    COOKIES: '/cookies',
    LEGAL: '/legal',
    TRACKA: '/tracka',

    // Admin
    ADMIN_LOGIN: '/admin/login',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_HELP: '/admin/help',
    ADMIN_HELP_EDITOR: '/admin/help-editor',
    ADMIN_HELP_VALIDATION: '/admin/help-validation',

    // Externas
    TRACKA_APP: 'https://tracka.solucoesrkm.com',
    TRACKA_REGISTER: 'https://tracka.solucoesrkm.com/register',
} as const;
