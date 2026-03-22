/**
 * @file landing.config.ts
 * @description Interfaces e fetcher para configuração da Landing Page.
 *
 * A landing page é totalmente configurável via admin/settings.
 * getLandingPageConfig() faz smart merge: DB overrides defaults.
 */

import { getSiteSettings } from '@/actions/site-settings.actions';
import { DEFAULT_LANDING_CONFIG } from './defaults';
import { SETTINGS_KEYS } from '@/constants';
import { unstable_noStore as noStore } from 'next/cache';

// Re-export de tipos para backward compatibility
export type {
    FAQItem,
    FooterLinkItem,
    PricingParams,
    TestimonialItem,
    FeatureItem,
    LandingPageConfig,
} from '@/types';


// ─── Fetcher com smart merge ─────────────────────────────────────

/**
 * Busca config da landing no banco e faz merge com defaults.
 * Valores vazios (null, undefined, '', []) são ignorados — usa o default.
 * 
 * Prioridade: DB locale-specific → DB generic → defaults
 */
import type { LandingPageConfig } from '@/types';

export async function getLandingPageConfig(locale?: string): Promise<LandingPageConfig> {
    noStore(); // Sempre buscar dados frescos do banco
    // Fetch both generic and locale-specific configs in parallel
    const [genericSettings, localeSettings] = await Promise.all([
        getSiteSettings(SETTINGS_KEYS.LANDING_CONFIG),
        locale ? getSiteSettings(`landing_page_config_${locale}`) : null,
    ]);

    const merged: Record<string, any> = { ...DEFAULT_LANDING_CONFIG };

    // Layer 1: generic DB settings
    if (genericSettings) {
        for (const [key, value] of Object.entries(genericSettings)) {
            if (value === null || value === undefined) continue;
            if (typeof value === 'string' && value.trim() === '') continue;
            if (Array.isArray(value) && value.length === 0) continue;
            // Deep merge for featureTooltips (don't overwrite defaults with empty strings)
            if (key === 'featureTooltips' && typeof value === 'object' && !Array.isArray(value)) {
                const base = (merged.featureTooltips || {}) as Record<string, string>;
                for (const [tk, tv] of Object.entries(value as Record<string, string>)) {
                    if (tv && typeof tv === 'string' && tv.trim() !== '') {
                        base[tk] = tv;
                    }
                }
                merged.featureTooltips = base;
                continue;
            }
            merged[key] = value;
        }
    }

    // Layer 2: locale-specific DB settings (highest priority for text fields)
    if (localeSettings) {
        for (const [key, value] of Object.entries(localeSettings)) {
            if (value === null || value === undefined) continue;
            if (typeof value === 'string' && value.trim() === '') continue;
            if (Array.isArray(value) && value.length === 0) continue;
            // Deep merge for featureTooltips
            if (key === 'featureTooltips' && typeof value === 'object' && !Array.isArray(value)) {
                const base = (merged.featureTooltips || {}) as Record<string, string>;
                for (const [tk, tv] of Object.entries(value as Record<string, string>)) {
                    if (tv && typeof tv === 'string' && tv.trim() !== '') {
                        base[tk] = tv;
                    }
                }
                merged.featureTooltips = base;
                continue;
            }
            merged[key] = value;
        }
    }

    return merged as LandingPageConfig;
}

