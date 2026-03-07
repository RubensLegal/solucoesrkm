/**
 * @file defaults.ts
 * @description Valores padrão para a landing page.
 *
 * Usados quando o banco não tem config salva.
 * Admin pode customizar tudo via /admin/settings.
 */

import { LandingPageConfig } from '@/config/landing.config';

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
    heroTitle: 'Soluções RKM',
    heroSubtitle: 'Organize sua vida. Encontre tudo. O Tracka é o sistema definitivo para catalogar seus pertences.',
    heroImage: '/hero-bg.jpg',

    showFeatures: true,
    showTechnology: true,
    showPricing: true,
    showTestimonials: false,
    showFaq: true,

    ctaPrimaryText: 'Começar Agora',
    ctaPrimaryLink: '/register',
    featuresTitle: 'Principais Funcionalidades',
    techTitle: 'Tecnologia Soluções RKM',

    footerCtaTitle: 'Pronto para organizar sua casa?',
    footerCtaSubtitle: 'Junte-se a milhares de usuários e comece a catalogar seus pertences gratuitamente hoje mesmo.',
    footerCtaButton: 'Criar Conta Grátis',

    testimonials: [
        { name: 'Maria Silva', role: 'Dona de Casa', content: 'Mudou a forma como organizo minha mudança. Incrível!' },
        { name: 'João Pedro', role: 'Colecionador', content: 'Finalmente consigo achar meus cabos e adaptadores.' },
    ],

    faq: [
        { question: 'É gratuito?', answer: 'Sim, oferecemos um plano gratuito completo para uso pessoal.' },
        { question: 'Como funciona?', answer: 'Você cadastra seus itens, organiza por cômodos e caixas, e pode gerar etiquetas QR Code.' },
    ],

    footerContact: 'Dúvida? Mande um WhatsApp (011) 93230-5090',
    footerLinks: [
        { label: 'Perguntas frequentes', href: '#faq' },
        { label: 'Termos de Uso', href: '/terms' },
        { label: 'Privacidade', href: '/privacy' },
        { label: 'Cookies', href: '/cookies' },
        { label: 'Avisos Legais', href: '/legal' },
    ],
};
