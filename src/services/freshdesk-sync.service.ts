/**
 * @file freshdesk-sync.service.ts
 * @description Sincroniza conteúdo corporativo do help com a Knowledge Base do Freshdesk.
 *
 * Refatorado para ler conteúdo DINÂMICO:
 *   1. DB overrides (help-editor, Markdown) → prioridade
 *   2. JSON default (messages/help/pt.json) → fallback
 *   3. Converte Markdown/JSON → HTML para Freshdesk
 *
 * Hierarquia no Freshdesk:
 *   Category "Soluções RKM — Corporativo"
 *     └── Folder por categoria (Planos e Assinaturas, Técnico)
 *       └── Artigos individuais por tópico
 *
 * Credenciais: buscadas do banco via SiteSettings key 'api_keys'
 * Mapping: persistido em SiteSettings key 'freshdesk_corporate_mapping'
 */

import prisma from '@/lib/prisma';
import { getSiteSettings } from '@/actions/site-settings.actions';
import { HELP_CATEGORIES, type HelpCategory } from '@/lib/help-topics';
import { markdownToHtml, helpJsonToHtml } from '@/lib/markdown-to-html';
import path from 'path';
import fs from 'fs';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FreshdeskMapping {
    categories: Record<string, number>;
    folders: Record<string, number>;
    articles: Record<string, number>;
    lastSync?: string;
    lastPull?: string;
}

interface PullResult {
    success: boolean;
    pulled: number;
    unchanged: number;
    errors: string[];
    details: string[];
}

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
    details: string[];
}

interface CorporateArticle {
    slug: string;
    title: string;
    folder: string;
    htmlContent: string;
    superadminOnly?: boolean;
}

interface HelpOverride {
    markdown: string;
    updatedAt: string;
    updatedBy: string;
}

// ─── Freshdesk API helpers ───────────────────────────────────────────────────

async function getFreshdeskCredentials() {
    const apiKeys = await getSiteSettings('api_keys');
    const apiKey = apiKeys?.freshdeskApiKey || process.env.FRESHDESK_API_KEY;
    const domain = apiKeys?.freshdeskDomain || process.env.FRESHDESK_DOMAIN || 'solucoesrkm.freshdesk.com';

    if (!apiKey) throw new Error('FRESHDESK_API_KEY não configurada (banco ou env)');
    return { apiKey, baseUrl: `https://${domain}/api/v2` };
}

async function freshdeskRequest(
    method: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    body?: Record<string, any>
) {
    const { apiKey, baseUrl } = await getFreshdeskCredentials();
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${apiKey}:X`).toString('base64')}`,
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Freshdesk ${method} ${endpoint}: ${res.status} ${text}`);
    }

    return res.json();
}

// ─── Dynamic Content Loading ─────────────────────────────────────────────────

const HELP_OVERRIDES_KEY = 'help_topic_overrides';

/**
 * Carrega overrides do help-editor salvos no banco.
 */
async function loadHelpOverrides(): Promise<Record<string, HelpOverride>> {
    const setting = await prisma.siteSettings.findUnique({ where: { key: HELP_OVERRIDES_KEY } });
    return setting ? JSON.parse(setting.value) : {};
}

/**
 * Carrega o conteúdo default dos tópicos do JSON de tradução.
 */
function loadHelpJsonContent(): Record<string, any> {
    try {
        const helpPath = path.join(process.cwd(), 'messages', 'help', 'pt.json');
        const helpPt = JSON.parse(fs.readFileSync(helpPath, 'utf-8'));
        return helpPt.topics || {};
    } catch {
        return {};
    }
}

/**
 * Gera os artigos corporativos para sincronização com o Freshdesk.
 * 
 * Prioridade:
 *   1. DB override (Markdown editado via help-editor) → convertido para HTML
 *   2. JSON default (messages/help/pt.json) → convertido para HTML
 * 
 * Usa HELP_CATEGORIES de help-topics.ts como fonte dos tópicos.
 */
async function getCorporateArticles(): Promise<CorporateArticle[]> {
    const overrides = await loadHelpOverrides();
    const jsonTopics = loadHelpJsonContent();
    const articles: CorporateArticle[] = [];

    for (const category of HELP_CATEGORIES) {
        for (const topic of category.topics) {
            const slug = topic.slug;
            const translationKey = topic.translationKey;

            let htmlContent = '';
            let title = '';

            // 1. Verificar DB override (Markdown do help-editor)
            const override = overrides[slug];
            if (override?.markdown) {
                htmlContent = markdownToHtml(override.markdown);
            }

            // 2. Fallback: JSON default
            if (!htmlContent) {
                const topicData = jsonTopics[translationKey];
                if (topicData?.content) {
                    htmlContent = helpJsonToHtml(topicData);
                }
            }

            // Título: do JSON ou slug formatado
            const topicJson = jsonTopics[translationKey];
            title = topicJson?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            // Só adiciona se tem conteúdo
            if (htmlContent) {
                articles.push({
                    slug,
                    title: `${title} — Soluções RKM`,
                    folder: category.id,
                    htmlContent,
                    superadminOnly: topic.superadminOnly,
                });
            }
        }
    }

    return articles;
}

// ─── Folder Config ───────────────────────────────────────────────────────────

/**
 * Gera as seções corporativas a partir de HELP_CATEGORIES.
 */
function getCorporateSections(): { id: string; name: string; folderName: string }[] {
    return HELP_CATEGORIES.map((cat: HelpCategory) => ({
        id: cat.id,
        name: `${cat.emoji} ${cat.translationKey === 'business' ? 'Planos e Assinaturas' : 'Documentação Técnica'}`,
        folderName: cat.translationKey === 'business' ? 'Planos e Assinaturas' : 'Documentação Técnica',
    }));
}

// ─── Load/Save mapping ───────────────────────────────────────────────────────

const MAPPING_KEY = 'freshdesk_corporate_mapping';

async function loadMapping(): Promise<FreshdeskMapping> {
    const data = await getSiteSettings(MAPPING_KEY);
    if (!data) {
        return { categories: {}, folders: {}, articles: {} };
    }
    return data as unknown as FreshdeskMapping;
}

async function saveMapping(mapping: FreshdeskMapping) {
    mapping.lastSync = new Date().toISOString();
    await prisma.siteSettings.upsert({
        where: { key: MAPPING_KEY },
        update: { value: JSON.stringify(mapping) },
        create: { key: MAPPING_KEY, value: JSON.stringify(mapping) },
    });
}

// ─── Main sync ───────────────────────────────────────────────────────────────

const CATEGORY_NAME = '🏢 Soluções RKM — Corporativo';

export async function syncCorporateToFreshdesk(): Promise<SyncResult> {
    const result: SyncResult = { success: true, created: 0, updated: 0, errors: [], details: [] };
    const mapping = await loadMapping();
    const articles = await getCorporateArticles();
    const sections = getCorporateSections();

    try {
        // ── Criar/buscar Category ──
        let categoryId = mapping.categories['corporate'];
        if (!categoryId) {
            const created = await freshdeskRequest('POST', '/solutions/categories', {
                name: CATEGORY_NAME,
                description: 'Conteúdo corporativo da Soluções RKM — gerado automaticamente do help',
            });
            categoryId = created.id;
            mapping.categories['corporate'] = categoryId;
            result.created++;
            result.details.push(`📁 Categoria criada: ${CATEGORY_NAME}`);
        }

        // ── Criar/buscar Folders ──
        for (const section of sections) {
            let folderId = mapping.folders[section.id];
            if (!folderId) {
                const created = await freshdeskRequest('POST', `/solutions/categories/${categoryId}/folders`, {
                    name: `${section.name}`,
                    description: `${section.folderName} — Soluções RKM`,
                    visibility: 1, // público
                });
                folderId = created.id;
                mapping.folders[section.id] = folderId;
                result.created++;
                result.details.push(`📂 Pasta criada: ${section.name}`);
            }
        }

        // ── Artigos ──
        for (const article of articles) {
            const folderId = mapping.folders[article.folder];
            if (!folderId) {
                result.errors.push(`Pasta não encontrada para: ${article.folder}`);
                continue;
            }

            // Tópicos superadminOnly → visíveis apenas para agentes
            const visibility = article.superadminOnly ? 4 : 1; // 4 = agents only, 1 = público

            const articlePayload = {
                title: article.title,
                description: article.htmlContent,
                status: 2, // published
                art_type: 1, // permanent
            };

            const articleId = mapping.articles[article.slug];

            try {
                if (articleId) {
                    await freshdeskRequest('PUT', `/solutions/articles/${articleId}`, articlePayload);
                    result.updated++;
                    result.details.push(`✏️ Atualizado: ${article.title}`);
                } else {
                    const created = await freshdeskRequest('POST', `/solutions/folders/${folderId}/articles`, articlePayload);
                    mapping.articles[article.slug] = created.id;
                    result.created++;
                    result.details.push(`✅ Criado: ${article.title}`);
                }
            } catch (err: any) {
                result.errors.push(`${article.title}: ${err.message}`);
            }
        }

        await saveMapping(mapping);

    } catch (err: any) {
        result.success = false;
        result.errors.push(err.message);
    }

    return result;
}

// ─── Pull from Freshdesk (reverse sync) ──────────────────────────────────────

/**
 * Busca artigos corporativos editados no Freshdesk KB e importa como overrides.
 */
export async function pullCorporateFromFreshdesk(): Promise<PullResult> {
    const result: PullResult = { success: true, pulled: 0, unchanged: 0, errors: [], details: [] };
    const mapping = await loadMapping();
    const lastPull = mapping.lastPull ? new Date(mapping.lastPull) : new Date(0);

    if (Object.keys(mapping.articles).length === 0) {
        result.errors.push('Nenhum artigo mapeado. Rode o push primeiro.');
        result.success = false;
        return result;
    }

    // Carregar overrides atuais
    let overrides: Record<string, any> = {};
    try {
        const setting = await prisma.siteSettings.findUnique({ where: { key: HELP_OVERRIDES_KEY } });
        if (setting) overrides = JSON.parse(setting.value);
    } catch { /* continua vazio */ }

    for (const [slug, articleId] of Object.entries(mapping.articles)) {
        try {
            const article = await freshdeskRequest('GET', `/solutions/articles/${articleId}`);
            const updatedAt = new Date(article.updated_at);

            if (updatedAt > lastPull) {
                overrides[slug] = {
                    ...overrides[slug],
                    html: article.description,
                    title: article.title,
                    source: 'freshdesk',
                    pulledAt: new Date().toISOString(),
                };
                result.pulled++;
                result.details.push(`⬇️ Importado: ${article.title}`);
            } else {
                result.unchanged++;
            }
        } catch (err: any) {
            if (err.message.includes('404')) {
                result.details.push(`⚠️ Artigo removido no Freshdesk: ${slug}`);
                delete mapping.articles[slug];
            } else {
                result.errors.push(`${slug}: ${err.message}`);
            }
        }
    }

    if (result.pulled > 0) {
        await prisma.siteSettings.upsert({
            where: { key: HELP_OVERRIDES_KEY },
            update: { value: JSON.stringify(overrides) },
            create: { key: HELP_OVERRIDES_KEY, value: JSON.stringify(overrides) },
        });
    }

    mapping.lastPull = new Date().toISOString();
    await saveMapping(mapping);

    if (result.errors.length > 0) result.success = false;
    return result;
}

/**
 * Retorna info do último sync para exibição no admin.
 */
export async function getSyncStatus(): Promise<{
    lastSync: string | null;
    lastPull: string | null;
    articleCount: number;
}> {
    const mapping = await loadMapping();
    return {
        lastSync: mapping.lastSync || null,
        lastPull: mapping.lastPull || null,
        articleCount: Object.keys(mapping.articles).length,
    };
}
