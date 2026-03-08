/**
 * @file freshdesk-sync.service.ts
 * @description Sincroniza tópicos do Help corporativo com a Knowledge Base do Freshdesk.
 *
 * Hierarquia Freshdesk:
 *   HELP_CATEGORIES → Freshdesk Category (ex: "💰 Negócios")
 *   (cada categoria) → Freshdesk Folder (contém artigos do mesmo grupo)
 *   Tópico (slug)    → Freshdesk Article (conteúdo HTML do tópico)
 *
 * Visibilidade:
 *   superadminOnly: false → visibility: 1 (All Users — público)
 *   superadminOnly: true  → visibility: 3 (Agents Only — interno)
 *
 * O mapeamento slug↔freshdeskId é armazenado em SiteSettings
 * com key "freshdesk_kb_mapping" para permitir updates idempotentes.
 * Isso significa que rodar o sync várias vezes atualiza em vez de duplicar.
 */

import { HELP_CATEGORIES, type HelpTopic } from '@/lib/help-topics';
import { getSiteSettings } from '@/actions/site-settings.actions';
import prisma from '@/lib/prisma';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Mapeamento persistente entre IDs internos e IDs do Freshdesk. */
interface FreshdeskMapping {
    categories: Record<string, number>;   // categoryId → freshdeskCategoryId
    folders: Record<string, number>;      // categoryId → freshdeskFolderId
    articles: Record<string, number>;     // topicSlug → freshdeskArticleId
    lastSync?: string;
}

/** Resultado detalhado de uma operação de sync. */
interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
    details: string[];
}

// ─── Freshdesk API helpers ───────────────────────────────────────────────────

/**
 * Obtém credenciais da API do Freshdesk a partir de variáveis de ambiente.
 * FRESHDESK_API_KEY é obrigatória; FRESHDESK_DOMAIN tem fallback.
 */
function getFreshdeskCredentials() {
    const apiKey = process.env.FRESHDESK_API_KEY;
    const domain = process.env.FRESHDESK_DOMAIN || 'solucoesrkm.freshdesk.com';
    if (!apiKey) throw new Error('FRESHDESK_API_KEY não configurada');
    return { apiKey, baseUrl: `https://${domain}/api/v2` };
}

/**
 * Wrapper para chamadas à API REST do Freshdesk.
 * Usa Basic Auth (apiKey:X) conforme documentação oficial.
 */
async function freshdeskRequest(
    method: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    body?: Record<string, any>
) {
    const { apiKey, baseUrl } = getFreshdeskCredentials();
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

// ─── Markdown → HTML converter ───────────────────────────────────────────────

/**
 * Converte Markdown simples em HTML limpo para publicação no Freshdesk.
 * Usado quando o admin customizou o tópico via editor Markdown.
 * Não inclui classes CSS — o Freshdesk aplica seu próprio estilo.
 */
function markdownToHtml(md: string): string {
    return md
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
            const isOrdered = match.match(/^\d+\./);
            return isOrdered ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
        })
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hbulop])/gm, (line) => line ? `<p>${line}</p>` : '')
        .replace(/<p><\/p>/g, '');
}

// ─── Content renderer ────────────────────────────────────────────────────────

/**
 * Converte o conteúdo estruturado do JSON de traduções (help.topics.X.content)
 * em HTML para o artigo do Freshdesk.
 *
 * Lida automaticamente com a estrutura:
 * - intro → parágrafo introdutório
 * - seções com title/desc → h3 + p
 * - steps (step1, step2, ...) → lista ordenada
 * - rules (rule1, rule2, ...) → lista não-ordenada
 * - sub-itens com name/desc → tabela HTML
 * - tip/warning → blockquote com ícone
 */
function renderTopicToHtml(
    topicData: { title: string; subtitle: string; content: Record<string, any> },
    topic: HelpTopic
): string {
    const { content } = topicData;
    let html = '';

    html += `<p><em>${topicData.subtitle}</em></p>\n`;

    if (content.intro) {
        html += `<p>${content.intro}</p>\n`;
    }

    // Itera pelas seções do content
    for (const [key, value] of Object.entries(content)) {
        if (key === 'intro') continue;
        if (typeof value === 'string') {
            if (key === 'warning') {
                html += `<blockquote><strong>⚠️ Atenção:</strong> ${value}</blockquote>\n`;
            } else if (key === 'tip') {
                html += `<blockquote><strong>💡 Dica:</strong> ${value}</blockquote>\n`;
            }
            continue;
        }

        if (typeof value === 'object' && value !== null) {
            const section = value as Record<string, any>;

            if (section.title) {
                html += `<h3>${section.title}</h3>\n`;
            }
            if (section.desc) {
                html += `<p>${section.desc}</p>\n`;
            }

            // Steps (step1, step2, ...)
            const steps = Object.keys(section).filter(k => k.startsWith('step')).sort();
            if (steps.length > 0) {
                html += '<ol>\n';
                for (const s of steps) html += `  <li>${section[s]}</li>\n`;
                html += '</ol>\n';
            }

            // Rules (rule1, rule2, ...)
            const rules = Object.keys(section).filter(k => k.startsWith('rule')).sort();
            if (rules.length > 0) {
                html += '<ul>\n';
                for (const r of rules) html += `  <li>${section[r]}</li>\n`;
                html += '</ul>\n';
            }

            // Sub-itens com name/desc → tabela
            const subItems = Object.entries(section).filter(
                ([, v]) => typeof v === 'object' && v !== null && 'name' in v
            );
            if (subItems.length > 0) {
                html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">\n';
                for (const [, item] of subItems) {
                    const i = item as { icon?: string; name: string; desc: string };
                    html += `  <tr><td><strong>${i.icon ? i.icon + ' ' : ''}${i.name}</strong></td><td>${i.desc}</td></tr>\n`;
                }
                html += '</table>\n';
            }
        }
    }

    return html;
}

// ─── Load/Save mapping ──────────────────────────────────────────────────────

/** Carrega o mapeamento slug↔freshdeskId do banco. */
async function loadMapping(): Promise<FreshdeskMapping> {
    const data = await getSiteSettings('freshdesk_kb_mapping');
    if (!data) return { categories: {}, folders: {}, articles: {} };
    return data as unknown as FreshdeskMapping;
}

/** Persiste o mapeamento atualizado no banco. */
async function saveMapping(mapping: FreshdeskMapping) {
    mapping.lastSync = new Date().toISOString();
    await prisma.siteSettings.upsert({
        where: { key: 'freshdesk_kb_mapping' },
        update: { value: JSON.stringify(mapping) },
        create: { key: 'freshdesk_kb_mapping', value: JSON.stringify(mapping) },
    });
}

// ─── Main sync ───────────────────────────────────────────────────────────────

/**
 * Sincroniza TODOS os tópicos do help corporativo com o Freshdesk.
 *
 * Fluxo:
 * 1. Carrega traduções do locale especificado
 * 2. Carrega overrides do admin (markdown customizado)
 * 3. Para cada categoria: cria/atualiza Category + Folder no Freshdesk
 * 4. Para cada tópico: cria/atualiza Article (usando override ou JSON padrão)
 * 5. Salva mapeamento atualizado para futuros updates
 *
 * @param locale - Idioma dos artigos (default: 'pt')
 * @returns SyncResult com contadores e detalhes
 */
export async function syncHelpToFreshdesk(locale: string = 'pt'): Promise<SyncResult> {
    const result: SyncResult = { success: true, created: 0, updated: 0, errors: [], details: [] };

    // Carregar traduções
    let messages: Record<string, any>;
    try {
        messages = require(`../../../messages/${locale}.json`);
    } catch {
        result.success = false;
        result.errors.push(`Arquivo de tradução ${locale}.json não encontrado`);
        return result;
    }

    const helpMessages = messages.help;
    if (!helpMessages?.topics || !helpMessages?.categories) {
        result.success = false;
        result.errors.push('Estrutura de help inválida no arquivo de tradução');
        return result;
    }

    // Carregar overrides do banco (editor admin)
    let overrides: Record<string, { markdown: string; title?: string; subtitle?: string }> = {};
    try {
        const overrideSetting = await prisma.siteSettings.findUnique({ where: { key: 'help_topic_overrides' } });
        if (overrideSetting) {
            overrides = JSON.parse(overrideSetting.value);
        }
    } catch {
        // Se falhar, continua com o JSON padrão
    }

    const mapping = await loadMapping();

    for (const category of HELP_CATEGORIES) {
        const categoryName = helpMessages.categories[category.translationKey] || category.id;

        try {
            // ── Criar/atualizar Category no Freshdesk ──
            let categoryId = mapping.categories[category.id];
            if (!categoryId) {
                const created = await freshdeskRequest('POST', '/solutions/categories', {
                    name: `${category.emoji} ${categoryName}`,
                    description: `Soluções RKM — ${categoryName}`,
                });
                categoryId = created.id;
                mapping.categories[category.id] = categoryId;
                result.created++;
                result.details.push(`📁 Categoria criada: ${categoryName}`);
            }

            // ── Criar/atualizar Folder no Freshdesk ──
            let folderId = mapping.folders[category.id];
            if (!folderId) {
                const created = await freshdeskRequest('POST', `/solutions/categories/${categoryId}/folders`, {
                    name: categoryName,
                    description: `Artigos sobre ${categoryName}`,
                    visibility: 1,
                });
                folderId = created.id;
                mapping.folders[category.id] = folderId;
                result.created++;
                result.details.push(`📂 Pasta criada: ${categoryName}`);
            }

            // ── Artigos (1 por tópico) ──
            for (const topic of category.topics) {
                const topicData = helpMessages.topics[topic.translationKey];
                if (!topicData) {
                    result.errors.push(`Tradução não encontrada: ${topic.translationKey}`);
                    continue;
                }

                // Visibilidade baseada em permissão
                const visibility = topic.superadminOnly ? 3 : 1;

                // Conteúdo: override (Markdown→HTML) ou JSON padrão (estruturado→HTML)
                const override = overrides[topic.slug];
                let articleBody: string;
                let articleTitle = topicData.title;

                if (override?.markdown) {
                    articleBody = markdownToHtml(override.markdown);
                    if (override.title) articleTitle = override.title;
                    result.details.push(`📝 Override: ${articleTitle}`);
                } else {
                    articleBody = renderTopicToHtml(topicData, topic);
                }

                const articlePayload = {
                    title: articleTitle,
                    description: articleBody,
                    status: 2, // published
                    art_type: 1, // permanent
                    ...(visibility !== 1 && { visibility }),
                };

                const articleId = mapping.articles[topic.slug];

                try {
                    if (articleId) {
                        await freshdeskRequest('PUT', `/solutions/articles/${articleId}`, articlePayload);
                        result.updated++;
                        result.details.push(`✏️ Atualizado: ${topicData.title} ${topic.superadminOnly ? '🔒' : '🌐'}`);
                    } else {
                        const created = await freshdeskRequest('POST', `/solutions/folders/${folderId}/articles`, articlePayload);
                        mapping.articles[topic.slug] = created.id;
                        result.created++;
                        result.details.push(`✅ Criado: ${topicData.title} ${topic.superadminOnly ? '🔒 (Agents Only)' : '🌐 (Público)'}`);
                    }
                } catch (err: any) {
                    result.errors.push(`Artigo ${topic.slug}: ${err.message}`);
                }
            }

        } catch (err: any) {
            result.errors.push(`Categoria ${category.id}: ${err.message}`);
            result.success = false;
        }
    }

    // Salvar mapeamento atualizado
    try {
        await saveMapping(mapping);
    } catch (err: any) {
        result.errors.push(`Erro ao salvar mapeamento: ${err.message}`);
    }

    if (result.errors.length > 0) {
        result.success = false;
    }

    return result;
}

/**
 * Retorna info do último sync para exibição no admin.
 * Mostra: data do último sync, número de artigos e categorias mapeadas.
 */
export async function getSyncStatus(): Promise<{
    lastSync: string | null;
    articleCount: number;
    categoryCount: number;
}> {
    const mapping = await loadMapping();
    return {
        lastSync: mapping.lastSync || null,
        articleCount: Object.keys(mapping.articles).length,
        categoryCount: Object.keys(mapping.categories).length,
    };
}
