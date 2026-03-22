/**
 * @file robots.ts
 * @description Gera robots.txt dinâmico para SEO.
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solucoesrkm.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
