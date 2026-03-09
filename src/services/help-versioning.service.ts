/**
 * @file help-versioning.service.ts
 * @description Sistema de versionamento para tópicos do help.
 *
 * Registra quem alterou, quando, o quê, e permite rollback.
 * Mantém até 20 versões por tópico.
 * 
 * Usado por:
 *   - /api/admin/help-topics (save via help-editor)
 *   - freshdesk-sync.service.ts (pull do Freshdesk)
 */

import prisma from '@/lib/prisma';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TopicVersion {
    version: number;
    markdown: string;
    savedAt: string;
    savedBy: string;
    source: 'editor' | 'freshdesk' | 'rollback';
    /** Resumo opcional da alteração */
    summary?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const VERSIONS_KEY = 'help_topic_versions';
const MAX_VERSIONS_PER_TOPIC = 20;

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Carrega todas as versões de todos os tópicos.
 */
export async function loadAllVersions(): Promise<Record<string, TopicVersion[]>> {
    try {
        const setting = await prisma.siteSettings.findUnique({ where: { key: VERSIONS_KEY } });
        return setting ? JSON.parse(setting.value) : {};
    } catch { return {}; }
}

/**
 * Lista versões de um tópico específico (mais recente primeiro).
 */
export async function getTopicVersions(slug: string): Promise<TopicVersion[]> {
    const all = await loadAllVersions();
    return all[slug] || [];
}

/**
 * Cria uma nova versão para um tópico.
 * Chamada automaticamente ao salvar no help-editor ou ao importar do Freshdesk.
 */
export async function createTopicVersion(
    slug: string,
    markdown: string,
    savedBy: string,
    source: TopicVersion['source'] = 'editor',
    summary?: string,
): Promise<TopicVersion> {
    const allVersions = await loadAllVersions();
    const topicVersions = allVersions[slug] || [];

    // Próximo número de versão
    const nextVersion = topicVersions.length > 0
        ? Math.max(...topicVersions.map(v => v.version)) + 1
        : 1;

    const newVersion: TopicVersion = {
        version: nextVersion,
        markdown,
        savedAt: new Date().toISOString(),
        savedBy,
        source,
        summary,
    };

    // Adicionar no início (mais recente primeiro) e limitar
    topicVersions.unshift(newVersion);
    if (topicVersions.length > MAX_VERSIONS_PER_TOPIC) {
        topicVersions.splice(MAX_VERSIONS_PER_TOPIC);
    }

    allVersions[slug] = topicVersions;
    await saveAllVersions(allVersions);

    return newVersion;
}

/**
 * Busca uma versão específica de um tópico.
 */
export async function getSpecificVersion(slug: string, version: number): Promise<TopicVersion | null> {
    const topicVersions = await getTopicVersions(slug);
    return topicVersions.find(v => v.version === version) || null;
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function saveAllVersions(versions: Record<string, TopicVersion[]>) {
    await prisma.siteSettings.upsert({
        where: { key: VERSIONS_KEY },
        update: { value: JSON.stringify(versions) },
        create: { key: VERSIONS_KEY, value: JSON.stringify(versions) },
    });
}
