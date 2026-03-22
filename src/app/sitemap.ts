/**
 * @file sitemap.ts
 * @description Gera sitemap.xml dinâmico com todas as páginas públicas.
 *
 * Inclui locales (pt, en) para cada rota pública.
 */

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solucoesrkm.com';
    const locales = ['pt', 'en'];

    const routes = [
        '', // Landing page (/)
        '/about',
        '/terms',
        '/privacy',
        '/legal',
        '/help',
    ];

    const entries: MetadataRoute.Sitemap = [];

    for (const route of routes) {
        for (const locale of locales) {
            entries.push({
                url: `${siteUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '' ? 'weekly' : 'monthly',
                priority: route === '' ? 1.0 : 0.7,
            });
        }
    }

    return entries;
}
