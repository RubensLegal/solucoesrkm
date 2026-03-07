/**
 * @file freshdesk.config.ts
 * @description Configuração Freshdesk independente para o site corporativo.
 *
 * Cada workspace (solucoesrkm e tracka) tem seu próprio Freshdesk config no banco.
 * Permite widget de suporte, tickets, knowledge base e chat em tempo real.
 */

import { getSiteSettings } from '@/actions/site-settings.actions';

// ─── Tipos ────────────────────────────────────────────────────────

export interface FreshdeskConfig {
    /** Domínio Freshworks (ex: "solucoesrkm.myfreshworks.com") */
    domain: string;

    // Widget de Suporte (bolha flutuante)
    widgetEnabled: boolean;
    widgetId: string;
    widgetPosition: 'left' | 'right';
    widgetOffset: number;
    widgetAuthEnabled: boolean;

    // Portal de Tickets
    ticketsEnabled: boolean;
    ticketsUrl: string;

    // Knowledge Base
    kbEnabled: boolean;
    kbUrl: string;

    // Freshchat (chat em tempo real)
    chatEnabled: boolean;
    chatToken: string;
    chatAuthEnabled: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────

export const DEFAULT_FRESHDESK_CONFIG: FreshdeskConfig = {
    domain: 'solucoesrkm.myfreshworks.com',

    widgetEnabled: false,
    widgetId: '',
    widgetPosition: 'right',
    widgetOffset: 20,
    widgetAuthEnabled: false,

    ticketsEnabled: false,
    ticketsUrl: '',

    kbEnabled: false,
    kbUrl: '',

    chatEnabled: false,
    chatToken: '',
    chatAuthEnabled: false,
};

// ─── Fetcher ──────────────────────────────────────────────────────

/** Busca config do Freshdesk do banco com smart merge. */
export async function getFreshdeskConfig(): Promise<FreshdeskConfig> {
    const settings = await getSiteSettings('freshdesk_config');

    if (!settings) return DEFAULT_FRESHDESK_CONFIG;

    const merged: Record<string, any> = { ...DEFAULT_FRESHDESK_CONFIG };
    for (const [key, value] of Object.entries(settings)) {
        if (value === null || value === undefined) continue;
        if (typeof value === 'string' && value.trim() === '') continue;
        merged[key] = value;
    }

    return merged as FreshdeskConfig;
}

/** Verifica se algum módulo Freshdesk está ativo. */
export function isFreshdeskActive(config: FreshdeskConfig): boolean {
    return config.widgetEnabled || config.ticketsEnabled || config.kbEnabled || config.chatEnabled;
}
