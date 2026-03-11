'use server';

/**
 * @file translate.ts
 * @description Free Google Translate REST API wrapper.
 * Only called when content is edited/created — once translated, no further calls.
 */

interface TranslateResult {
    translated: string;
    error?: string;
    errorType?: 'network' | 'api' | 'empty';
}

/**
 * Translate a single text string using the free Google Translate REST endpoint.
 */
export async function translateText(
    text: string,
    from: string,
    to: string
): Promise<TranslateResult> {
    if (!text || text.trim() === '') {
        return { translated: '', error: 'Empty text', errorType: 'empty' };
    }

    try {
        const url = new URL('https://translate.googleapis.com/translate_a/single');
        url.searchParams.set('client', 'gtx');
        url.searchParams.set('sl', from);
        url.searchParams.set('tl', to);
        url.searchParams.set('dt', 't');
        url.searchParams.set('q', text);

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!res.ok) {
            return {
                translated: text,
                error: `Translation service error (HTTP ${res.status})`,
                errorType: 'api',
            };
        }

        const data = await res.json();

        // Google returns array of arrays: [[["translated","original",...],...]]]
        if (Array.isArray(data) && Array.isArray(data[0])) {
            const translated = data[0]
                .filter((segment: any) => Array.isArray(segment) && segment[0])
                .map((segment: any) => segment[0])
                .join('');

            if (translated) {
                return { translated };
            }
        }

        return {
            translated: text,
            error: 'Could not parse translation response',
            errorType: 'api',
        };
    } catch (err: any) {
        // Network / timeout errors
        if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
            return {
                translated: text,
                error: 'Translation service timed out',
                errorType: 'network',
            };
        }

        const isNetworkError =
            err?.code === 'ECONNREFUSED' ||
            err?.code === 'ENOTFOUND' ||
            err?.code === 'ETIMEDOUT' ||
            err?.message?.includes('fetch');

        return {
            translated: text,
            error: isNetworkError
                ? 'Translation service unreachable'
                : `Translation error: ${err?.message || 'unknown'}`,
            errorType: isNetworkError ? 'network' : 'api',
        };
    }
}

/**
 * Translate multiple key-value pairs. Returns per-field results.
 */
export async function translateFields(
    fields: Record<string, string>,
    from: string,
    to: string
): Promise<Record<string, TranslateResult>> {
    const results: Record<string, TranslateResult> = {};
    const entries = Object.entries(fields).filter(([, v]) => v && v.trim() !== '');

    // Translate all fields in parallel (with concurrency limit of 5)
    const chunks = [];
    for (let i = 0; i < entries.length; i += 5) {
        chunks.push(entries.slice(i, i + 5));
    }

    for (const chunk of chunks) {
        const promises = chunk.map(async ([key, value]) => {
            const result = await translateText(value, from, to);
            results[key] = result;
        });
        await Promise.all(promises);
    }

    return results;
}

/**
 * Translate an array of objects (testimonials, FAQ items, footer links).
 * Each object's string fields are translated individually.
 */
export async function translateArray(
    items: Record<string, any>[],
    from: string,
    to: string
): Promise<{ translated: Record<string, any>[]; errors: string[] }> {
    const errors: string[] = [];
    const translated: Record<string, any>[] = [];

    for (const item of items) {
        const newItem: Record<string, any> = {};
        for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'string' && value.trim() !== '') {
                const result = await translateText(value, from, to);
                newItem[key] = result.translated;
                if (result.error) {
                    errors.push(`${key}: ${result.error}`);
                }
            } else {
                newItem[key] = value;
            }
        }
        translated.push(newItem);
    }

    return { translated, errors };
}
