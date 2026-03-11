/**
 * @file currency-utils.ts
 * @description Detects the user's local currency from browser locale
 * and provides exchange rate fetching from AwesomeAPI.
 */

/** Maps browser locale regions to currency codes */
const LOCALE_CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
    US: { code: 'USD', symbol: '$', name: 'US Dollar' },
    GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
    EU: { code: 'EUR', symbol: '€', name: 'Euro' },
    // Eurozone countries
    DE: { code: 'EUR', symbol: '€', name: 'Euro' },
    FR: { code: 'EUR', symbol: '€', name: 'Euro' },
    IT: { code: 'EUR', symbol: '€', name: 'Euro' },
    ES: { code: 'EUR', symbol: '€', name: 'Euro' },
    PT: { code: 'EUR', symbol: '€', name: 'Euro' },
    NL: { code: 'EUR', symbol: '€', name: 'Euro' },
    BE: { code: 'EUR', symbol: '€', name: 'Euro' },
    AT: { code: 'EUR', symbol: '€', name: 'Euro' },
    IE: { code: 'EUR', symbol: '€', name: 'Euro' },
    FI: { code: 'EUR', symbol: '€', name: 'Euro' },
    // Americas
    CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    MX: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
    AR: { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
    CL: { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
    CO: { code: 'COP', symbol: 'CO$', name: 'Colombian Peso' },
    // Asia & Oceania
    JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    // Other
    CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    SE: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    NO: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    DK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    IL: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
    ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
};

export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
}

/** Default fallback currency for EN locale */
const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', name: 'US Dollar' };

/**
 * Detects the user's likely currency from browser locale.
 * Uses navigator.languages to identify the region.
 * 
 * Rule: If pt-BR is in the languages list, the user is Brazilian
 * and should see USD (since prices are natively in BRL).
 * Other currencies (GBP, EUR, etc.) are only detected when the user
 * is genuinely from another country.
 */
export function detectCurrency(): CurrencyInfo {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY;

    try {
        const languages = navigator.languages || [navigator.language];

        // If any language is pt-BR, user is Brazilian → always USD
        const isBrazilian = languages.some(lang =>
            lang.toLowerCase().startsWith('pt-br') || lang.toLowerCase() === 'pt'
        );
        if (isBrazilian) return DEFAULT_CURRENCY;

        // For non-Brazilian users, detect currency from region
        for (const lang of languages) {
            const parts = lang.split('-');
            if (parts.length >= 2) {
                const region = parts[parts.length - 1].toUpperCase();
                if (LOCALE_CURRENCY_MAP[region]) {
                    return LOCALE_CURRENCY_MAP[region];
                }
            }
        }
    } catch {
        // Fallback
    }

    return DEFAULT_CURRENCY;
}

/**
 * Fetches the exchange rate for a given currency against BRL.
 * Uses AwesomeAPI (free, no key needed).
 * Returns the rate (how many BRL per 1 unit of currency).
 */
export async function fetchExchangeRate(currencyCode: string): Promise<number | null> {
    try {
        const res = await fetch(`https://economia.awesomeapi.com.br/json/last/${currencyCode}-BRL`);
        if (!res.ok) return null;
        const data = await res.json();
        const key = `${currencyCode}BRL`;
        if (data?.[key]?.bid) {
            return parseFloat(data[key].bid);
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Converts a BRL amount to the target currency.
 * @param brl Amount in BRL
 * @param rate How many BRL per 1 unit of target currency
 */
export function convertFromBRL(brl: number, rate: number): string {
    return (brl / rate).toFixed(2);
}

/** localStorage key for cached rate */
export function getCacheKey(currencyCode: string) {
    return `exchange_rate_${currencyCode}_BRL`;
}
