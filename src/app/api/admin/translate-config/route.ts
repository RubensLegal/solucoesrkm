/**
 * @file translate-config/route.ts
 * @description One-time migration: translate full landing page config from one locale to another.
 * POST /api/admin/translate-config
 * Body: { fromLocale: 'pt' | 'en', toLocale: 'pt' | 'en' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { translateText, translateArray } from '@/lib/translate';

const TEXT_FIELDS = [
    'heroTitle', 'heroSubtitle', 'ctaPrimaryText',
    'featuresTitle', 'techTitle',
    'footerCtaTitle', 'footerCtaSubtitle', 'footerCtaButton', 'footerContact',
];

export async function POST(req: NextRequest) {
    // ── Auth ──
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const role = await getSystemRole(session.userId);
    if (role !== 'SUPERADMIN') {
        return NextResponse.json({ error: 'SUPERADMIN only' }, { status: 403 });
    }

    try {
        const { fromLocale = 'pt', toLocale = 'en' } = await req.json();

        // ── Read source config ──
        // Try locale-specific first, fall back to generic
        let sourceRow = await prisma.siteSettings.findUnique({
            where: { key: `landing_page_config_${fromLocale}` },
        });
        if (!sourceRow) {
            sourceRow = await prisma.siteSettings.findUnique({
                where: { key: 'landing_page_config' },
            });
        }

        if (!sourceRow) {
            return NextResponse.json({ error: 'No source config found' }, { status: 404 });
        }

        const sourceConfig = JSON.parse(sourceRow.value);
        const translatedConfig: Record<string, any> = { ...sourceConfig };
        const errors: string[] = [];

        // ── Translate text fields ──
        for (const field of TEXT_FIELDS) {
            if (sourceConfig[field] && typeof sourceConfig[field] === 'string') {
                const result = await translateText(sourceConfig[field], fromLocale, toLocale);
                translatedConfig[field] = result.translated;
                if (result.error) {
                    errors.push(`${field}: ${result.error}`);
                }
            }
        }

        // ── Translate testimonials array ──
        if (Array.isArray(sourceConfig.testimonials) && sourceConfig.testimonials.length > 0) {
            const { translated, errors: arrErrors } = await translateArray(
                sourceConfig.testimonials, fromLocale, toLocale
            );
            translatedConfig.testimonials = translated;
            errors.push(...arrErrors.map(e => `testimonials.${e}`));
        }

        // ── Translate FAQ array ──
        if (Array.isArray(sourceConfig.faq) && sourceConfig.faq.length > 0) {
            const { translated, errors: arrErrors } = await translateArray(
                sourceConfig.faq, fromLocale, toLocale
            );
            translatedConfig.faq = translated;
            errors.push(...arrErrors.map(e => `faq.${e}`));
        }

        // ── Translate footer links (labels only, not URLs) ──
        if (Array.isArray(sourceConfig.footerLinks) && sourceConfig.footerLinks.length > 0) {
            const translatedLinks = [];
            for (const link of sourceConfig.footerLinks) {
                const newLink = { ...link };
                if (link.label && typeof link.label === 'string') {
                    const result = await translateText(link.label, fromLocale, toLocale);
                    newLink.label = result.translated;
                    if (result.error) errors.push(`footerLinks.label: ${result.error}`);
                }
                translatedLinks.push(newLink);
            }
            translatedConfig.footerLinks = translatedLinks;
        }

        // ── Save translated config ──
        const targetKey = `landing_page_config_${toLocale}`;
        await prisma.siteSettings.upsert({
            where: { key: targetKey },
            update: { value: JSON.stringify(translatedConfig) },
            create: { key: targetKey, value: JSON.stringify(translatedConfig) },
        });

        // ── Also ensure source is saved with locale key ──
        const sourceKey = `landing_page_config_${fromLocale}`;
        const sourceLocalRow = await prisma.siteSettings.findUnique({ where: { key: sourceKey } });
        if (!sourceLocalRow) {
            await prisma.siteSettings.upsert({
                where: { key: sourceKey },
                update: { value: sourceRow.value },
                create: { key: sourceKey, value: sourceRow.value },
            });
        }

        return NextResponse.json({
            success: true,
            translatedFields: TEXT_FIELDS.length,
            testimonials: sourceConfig.testimonials?.length || 0,
            faq: sourceConfig.faq?.length || 0,
            footerLinks: sourceConfig.footerLinks?.length || 0,
            errors,
        });
    } catch (err: any) {
        console.error('[translate-config]', err);
        return NextResponse.json(
            { error: err?.message || 'Translation failed' },
            { status: 500 }
        );
    }
}
