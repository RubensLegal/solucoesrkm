/**
 * @file translate-fields/route.ts
 * @description Translate specific changed fields and merge into the target locale config.
 * POST /api/admin/translate-fields
 * Body: { fields: Record<string, string>, arrays?: Record<string, any[]>,
 *         fromLocale: string, toLocale: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSystemRole, canEdit as checkCanEdit } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { translateText, translateArray } from '@/lib/translate';

export async function POST(req: NextRequest) {
    // ── Auth ──
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const role = await getSystemRole(session.userId);
    if (!checkCanEdit(role)) {
        return NextResponse.json({ error: 'No edit permission' }, { status: 403 });
    }

    try {
        const { fields = {}, arrays = {}, fromLocale, toLocale } = await req.json();

        const results: Record<string, { value: string; error?: string; errorType?: string }> = {};
        const arrayResults: Record<string, { translated: any[]; errors: string[] }> = {};

        // ── Translate text fields ──
        for (const [key, value] of Object.entries(fields)) {
            if (typeof value === 'string' && value.trim()) {
                const result = await translateText(value, fromLocale, toLocale);
                results[key] = {
                    value: result.translated,
                    error: result.error,
                    errorType: result.errorType,
                };
            }
        }

        // ── Translate arrays (testimonials, faq, footerLinks) ──
        for (const [key, items] of Object.entries(arrays)) {
            if (Array.isArray(items) && items.length > 0) {
                if (key === 'footerLinks') {
                    // Only translate labels, keep URLs
                    const translatedLinks = [];
                    const errors: string[] = [];
                    for (const link of items) {
                        const newLink = { ...link };
                        if (link.label && typeof link.label === 'string') {
                            const result = await translateText(link.label, fromLocale, toLocale);
                            newLink.label = result.translated;
                            if (result.error) errors.push(`${key}.label: ${result.error}`);
                        }
                        translatedLinks.push(newLink);
                    }
                    arrayResults[key] = { translated: translatedLinks, errors };
                } else {
                    // Translate all string fields (testimonials, faq)
                    const { translated, errors } = await translateArray(items, fromLocale, toLocale);
                    arrayResults[key] = { translated, errors };
                }
            }
        }

        // ── Merge into target locale config ──
        const targetKey = `landing_page_config_${toLocale}`;
        const targetRow = await prisma.siteSettings.findUnique({ where: { key: targetKey } });
        const targetConfig = targetRow ? JSON.parse(targetRow.value) : {};

        // Apply translated text fields
        for (const [key, result] of Object.entries(results)) {
            if (!result.error) {
                targetConfig[key] = result.value;
            }
        }

        // Apply translated arrays
        for (const [key, result] of Object.entries(arrayResults)) {
            if (result.errors.length === 0) {
                targetConfig[key] = result.translated;
            }
        }

        // Save merged config
        await prisma.siteSettings.upsert({
            where: { key: targetKey },
            update: { value: JSON.stringify(targetConfig) },
            create: { key: targetKey, value: JSON.stringify(targetConfig) },
        });

        return NextResponse.json({
            success: true,
            results,
            arrayResults: Object.fromEntries(
                Object.entries(arrayResults).map(([k, v]) => [k, { errors: v.errors }])
            ),
        });
    } catch (err: any) {
        console.error('[translate-fields]', err);

        // Detect DB vs other errors
        const isDbError = err?.message?.includes('prisma') ||
            err?.message?.includes('database') ||
            err?.code === 'P2002';

        return NextResponse.json({
            error: isDbError
                ? 'Database unreachable. Translations were not saved.'
                : err?.message || 'Translation failed',
            errorType: isDbError ? 'database' : 'system',
        }, { status: 500 });
    }
}
