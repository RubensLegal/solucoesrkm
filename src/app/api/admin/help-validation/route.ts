import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { HELP_CATEGORIES } from '@/lib/help-topics';
import * as fs from 'fs';
import * as path from 'path';

const SETTINGS_KEY = 'help_topic_overrides';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSlugToTranslationKey(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const cat of HELP_CATEGORIES) {
        for (const topic of cat.topics) {
            map[topic.slug] = topic.translationKey;
        }
    }
    return map;
}

function jsonContentToMarkdown(topicData: any): string {
    if (!topicData) return '';
    const lines: string[] = [];
    if (topicData.title) lines.push(`# ${topicData.title}`);
    if (topicData.subtitle) lines.push('', topicData.subtitle);
    const content = topicData.content;
    if (!content) return lines.join('\n');
    if (content.intro) lines.push('', content.intro);
    if (content.warning) lines.push('', `> ⚠️ ${content.warning}`);
    for (const [key, value] of Object.entries(content)) {
        if (['intro', 'warning', 'tip'].includes(key)) continue;
        if (typeof value === 'string') { lines.push('', value); continue; }
        if (typeof value === 'object' && value !== null) {
            const section = value as Record<string, any>;
            if (section.title) lines.push('', `## ${section.title}`);
            if (section.desc) lines.push('', section.desc);
            for (const [subKey, subVal] of Object.entries(section)) {
                if (['title', 'desc'].includes(subKey)) continue;
                if (typeof subVal === 'string') {
                    if (subKey.startsWith('step') || subKey.startsWith('q')) {
                        const num = subKey.replace(/\D/g, '');
                        lines.push(`${num}. ${subVal}`);
                    } else {
                        lines.push(`- ${subVal}`);
                    }
                } else if (typeof subVal === 'object' && subVal !== null) {
                    const item = subVal as Record<string, any>;
                    if (item.q && item.a) {
                        lines.push('', `### ${item.q}`, '', item.a);
                    } else if (item.name) {
                        const icon = item.icon ? `${item.icon} ` : '';
                        lines.push(`- **${icon}${item.name}** — ${item.desc || ''}`);
                    } else if (item.title) {
                        lines.push('', `### ${item.title}`);
                        if (item.desc) lines.push('', item.desc);
                        for (const [ssKey, ssVal] of Object.entries(item)) {
                            if (['title', 'desc'].includes(ssKey)) continue;
                            if (typeof ssVal === 'string') lines.push(`- ${ssVal}`);
                        }
                    }
                }
            }
        }
    }
    if (content.tip) lines.push('', `> 💡 ${content.tip}`);
    return lines.join('\n');
}

// ─── GET: Listar overrides pendentes ─────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        const overrides = setting ? JSON.parse(setting.value) : {};

        if (Object.keys(overrides).length === 0) {
            return NextResponse.json({ pending: [], totalOverrides: 0 });
        }

        const slugToKey = getSlugToTranslationKey();
        const locales = ['pt', 'en'];
        const baseContent: Record<string, Record<string, string>> = {};

        for (const locale of locales) {
            const helpPath = path.join(process.cwd(), 'messages', 'help', `${locale}.json`);
            try {
                const helpData = JSON.parse(fs.readFileSync(helpPath, 'utf-8'));
                for (const [slug, translationKey] of Object.entries(slugToKey)) {
                    const topicData = helpData?.topics?.[translationKey as string];
                    if (!baseContent[slug]) baseContent[slug] = {};
                    if (topicData?.markdown) {
                        baseContent[slug][locale] = topicData.markdown;
                    } else {
                        baseContent[slug][locale] = jsonContentToMarkdown(topicData);
                    }
                }
            } catch { /* locale file not found */ }
        }

        const pending = Object.entries(overrides).map(([slug, data]: [string, any]) => ({
            slug,
            translationKey: slugToKey[slug] || slug,
            overrideMarkdown: data.markdown || '',
            baseMarkdownPt: baseContent[slug]?.pt || '',
            baseMarkdownEn: baseContent[slug]?.en || '',
            updatedAt: data.updatedAt || null,
            updatedBy: data.updatedBy || null,
            isDifferentFromBase: data.markdown !== baseContent[slug]?.pt,
        }));

        return NextResponse.json({ pending, totalOverrides: pending.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─── POST: Promover overrides para JSON ──────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden — SUPERADMIN only' }, { status: 403 });

        const body = await req.json();
        const { slugs } = body as { slugs: string[] };

        if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
            return NextResponse.json({ error: 'slugs é obrigatório (array)' }, { status: 400 });
        }

        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        if (!setting) {
            return NextResponse.json({ error: 'Sem overrides no banco' }, { status: 404 });
        }
        const overrides = JSON.parse(setting.value);
        const slugToKey = getSlugToTranslationKey();

        const results: { slug: string; success: boolean; error?: string }[] = [];

        for (const locale of ['pt', 'en']) {
            const helpPath = path.join(process.cwd(), 'messages', 'help', `${locale}.json`);
            let helpData: any;
            try {
                helpData = JSON.parse(fs.readFileSync(helpPath, 'utf-8'));
            } catch { continue; }

            for (const slug of slugs) {
                const translationKey = slugToKey[slug];
                if (!translationKey) {
                    results.push({ slug, success: false, error: `translationKey não encontrada para "${slug}"` });
                    continue;
                }

                const override = overrides[slug];
                if (!override?.markdown) {
                    results.push({ slug, success: false, error: `Override sem markdown para "${slug}"` });
                    continue;
                }

                if (!helpData.topics) helpData.topics = {};
                if (!helpData.topics[translationKey]) helpData.topics[translationKey] = {};

                helpData.topics[translationKey].markdown = override.markdown;
                helpData.topics[translationKey].validatedAt = new Date().toISOString();
                helpData.topics[translationKey].validatedBy = session.name || session.email || 'superadmin';
            }

            try {
                fs.writeFileSync(helpPath, JSON.stringify(helpData, null, 2), 'utf-8');
            } catch (err: any) {
                return NextResponse.json({
                    error: `Não foi possível escrever em ${locale}.json. Em produção o filesystem é read-only.`,
                    detail: err.message,
                }, { status: 500 });
            }
        }

        for (const slug of slugs) {
            if (overrides[slug]) {
                delete overrides[slug];
                results.push({ slug, success: true });
            }
        }

        if (Object.keys(overrides).length === 0) {
            await prisma.siteSettings.delete({ where: { key: SETTINGS_KEY } });
        } else {
            await prisma.siteSettings.update({
                where: { key: SETTINGS_KEY },
                data: { value: JSON.stringify(overrides) },
            });
        }

        return NextResponse.json({
            success: true,
            promoted: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
            message: `${results.filter(r => r.success).length} tópico(s) promovido(s) para JSON base.`,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
