/**
 * @file settings-keys.ts
 * @description Constantes para chaves do SiteSettings (key-value store).
 *
 * Evita erros de typo ao referenciar chaves de configuração.
 */

/** Chaves de configuração principal. */
export const SETTINGS_KEYS = {
    LANDING_CONFIG: 'landing_page_config',
    LANDING_CONFIG_PT: 'landing_page_config_pt',
    LANDING_CONFIG_EN: 'landing_page_config_en',
    FRESHDESK_CONFIG: 'freshdesk_config',
    API_KEYS: 'api_keys',
    PRICING_VISIBILITY: 'pricing_visibility',
} as const;

/** Chaves de histórico (mapeiam 1:1 com config keys). */
export const HISTORY_KEYS: Record<string, string> = {
    [SETTINGS_KEYS.LANDING_CONFIG]: 'landing_page_history',
    [SETTINGS_KEYS.LANDING_CONFIG_PT]: 'landing_page_history',
    [SETTINGS_KEYS.LANDING_CONFIG_EN]: 'landing_page_history',
    [SETTINGS_KEYS.FRESHDESK_CONFIG]: 'freshdesk_history',
    [SETTINGS_KEYS.API_KEYS]: 'api_keys_history',
    [SETTINGS_KEYS.PRICING_VISIBILITY]: 'pricing_visibility_history',
} as const;

/** Limite máximo de entradas no histórico. */
export const MAX_HISTORY_ENTRIES = 100;
