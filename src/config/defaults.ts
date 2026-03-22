/**
 * @file defaults.ts
 * @description Valores padrão para a landing page.
 *
 * Usados quando o banco não tem config salva.
 * Admin pode customizar tudo via /admin/settings.
 */

import { LandingPageConfig } from '@/config/landing.config';

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
    heroImage: '/hero-bg.png',

    showFeatures: true,
    showTechnology: true,
    showPricing: true,
    showTestimonials: false,
    showFaq: true,

    featureTooltips: {
        items: 'Quantidade máxima de itens que você pode cadastrar',
        visionAi: 'Identificação inteligente de itens por foto usando IA',
        houses: 'Número de residências/locais que você pode gerenciar',
        roomsPerHouse: 'Cômodos disponíveis em cada residência',
        furniturePerRoom: 'Móveis que podem ser cadastrados por cômodo',
        photosPerItem: 'Fotos que podem ser anexadas a cada item',
        collaboratorsPerHouse: 'Pessoas que podem acessar sua residência',
        history: 'Registro de todas as movimentações dos seus itens',
        ranking: 'Veja quais itens são mais usados e movimentados',
        importExcel: 'Importe itens em massa via planilha Excel',
        exportData: 'Exporte seus dados para backup ou análise',
        consolidation: 'Organize e mova itens entre cômodos e casas',
        aiAssistant: 'Assistente inteligente que ajuda a organizar e encontrar itens',
    },
};
