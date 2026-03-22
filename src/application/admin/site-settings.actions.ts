/**
 * @file site-settings.actions.ts
 * @description Server Actions para CRUD de configurações do site.
 *
 * Cada config é armazenada como JSON em SiteSettings (key-value).
 * Alterações são registradas automaticamente como histórico com diff.
 */

'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession, getSystemRole, canEdit as checkCanEdit } from '@/lib/auth';
import type { SettingsChange, SettingsHistoryEntry, ActionResult } from '@/types';
import { HISTORY_KEYS, MAX_HISTORY_ENTRIES } from '@/constants';

// ═══════════════════════════════════════════════════════════════════
// Leitura — Pública (sem auth, usada pela landing page)
// ═══════════════════════════════════════════════════════════════════

/**
 * Busca config por key. Retorna o objeto parseado ou null.
 * Usada pela landing page — não requer autenticação.
 */
export async function getSiteSettings(key: string) {
    try {
        const row = await prisma.siteSettings.findUnique({ where: { key } });
        if (!row) return null;
        return JSON.parse(row.value);
    } catch (error) {
        console.error(`[SiteSettings] Failed to read key="${key}":`, error);
        return null;
    }
}

// Re-export de tipos para backward compatibility
export type { SettingsChange, SettingsHistoryEntry, ActionResult } from '@/types';

// ═══════════════════════════════════════════════════════════════════
// Diff — Calcula mudanças entre configs
// ═══════════════════════════════════════════════════════════════════

/** Diff genérico para objetos flat. */
function diffFlat(
    section: string,
    oldObj: Record<string, any>,
    newObj: Record<string, any>,
): SettingsChange[] {
    const changes: SettingsChange[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const field of allKeys) {
        const oldVal = oldObj[field];
        const newVal = newObj[field];
        const oldStr = JSON.stringify(oldVal);
        const newStr = JSON.stringify(newVal);

        if (oldStr !== newStr) {
            changes.push({ section, field, oldValue: oldVal, newValue: newVal });
        }
    }
    return changes;
}

/** Diff para landing_page_config — flat com arrays (faq, testimonials). */
function computeLandingDiff(
    oldConfig: Record<string, any>,
    newConfig: Record<string, any>,
): SettingsChange[] {
    const changes: SettingsChange[] = [];

    // Arrays: comparar como JSON
    const arrayKeys = ['faq', 'testimonials', 'footerLinks', 'features'];
    for (const key of arrayKeys) {
        const oldStr = JSON.stringify(oldConfig[key] ?? []);
        const newStr = JSON.stringify(newConfig[key] ?? []);
        if (oldStr !== newStr) {
            changes.push({ section: 'landing', field: key, oldValue: oldConfig[key], newValue: newConfig[key] });
        }
    }

    // Campos flat (excluindo arrays)
    const old = { ...oldConfig };
    const nw = { ...newConfig };
    arrayKeys.forEach(k => { delete old[k]; delete nw[k]; });
    changes.push(...diffFlat('landing', old, nw));

    return changes;
}

/** Diff para freshdesk_config — flat simples. */
function computeFreshdeskDiff(
    oldConfig: Record<string, any>,
    newConfig: Record<string, any>,
): SettingsChange[] {
    return diffFlat('freshdesk', oldConfig, newConfig);
}

/** Diff para api_keys — mascara valores sensíveis. */
function computeApiKeysDiff(
    oldConfig: Record<string, any>,
    newConfig: Record<string, any>,
): SettingsChange[] {
    const mask = (v: any) => typeof v === 'string' && v.length > 8
        ? `${v.substring(0, 4)}…${v.substring(v.length - 4)}`
        : v;

    const changes = diffFlat('api_keys', oldConfig, newConfig);
    return changes.map(c => ({
        ...c,
        oldValue: mask(c.oldValue),
        newValue: mask(c.newValue),
    }));
}

/** Seleciona função de diff correta para cada key. */
function computeDiffForKey(key: string, oldConfig: any, newConfig: any): SettingsChange[] {
    switch (key) {
        case 'landing_page_config':
        case 'landing_page_config_pt':
        case 'landing_page_config_en':
            return computeLandingDiff(oldConfig, newConfig);
        case 'freshdesk_config': return computeFreshdeskDiff(oldConfig, newConfig);
        case 'api_keys': return computeApiKeysDiff(oldConfig, newConfig);
        default: return diffFlat(key, oldConfig, newConfig);
    }
}

// ═══════════════════════════════════════════════════════════════════
// Update — Protegido (Employee ADMIN/EDITOR)
// ═══════════════════════════════════════════════════════════════════

/**
 * Atualiza config e registra histórico automaticamente.
 * Requer Employee com permissão de edição.
 */
export async function updateSiteSettings(key: string, value: any) {
    // ── Auth check ──
    const session = await getSession();
    if (!session) return { error: 'Não autenticado.' };

    const role = await getSystemRole(session.userId);
    if (!checkCanEdit(role)) return { error: 'Sem permissão para editar.' };

    try {
        // ── Buscar config atual para diff ──
        const currentRow = await prisma.siteSettings.findUnique({ where: { key } });
        const currentValue = currentRow ? JSON.parse(currentRow.value) : {};

        // ── Calcular diff ──
        const changes = computeDiffForKey(key, currentValue, value);

        // ── Salvar config ──
        await prisma.siteSettings.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { key, value: JSON.stringify(value) },
        });

        // ── Registrar histórico (se houve mudanças e key tem historyKey) ──
        const historyKey = HISTORY_KEYS[key];
        if (historyKey && changes.length > 0) {
            const entry: SettingsHistoryEntry = {
                timestamp: new Date().toISOString(),
                userId: session.userId,
                userName: session.name || session.email,
                changes,
            };

            const historyRow = await prisma.siteSettings.findUnique({
                where: { key: historyKey },
            });

            let history: SettingsHistoryEntry[] = [];
            if (historyRow) {
                history = JSON.parse(historyRow.value);
            }

            // Prepend + limit
            history = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);

            await prisma.siteSettings.upsert({
                where: { key: historyKey },
                update: { value: JSON.stringify(history) },
                create: { key: historyKey, value: JSON.stringify(history) },
            });
        }

        // Revalidar landing pages em todos os locales + admin
        revalidatePath('/');
        revalidatePath('/pt');
        revalidatePath('/en');
        revalidatePath('/admin/settings');
        revalidatePath('/pt/admin/settings');
        revalidatePath('/en/admin/settings');
        return { success: true, changesCount: changes.length };
    } catch (error) {
        console.error(`[SiteSettings] Failed to update key="${key}":`, error);
        return { error: 'Erro ao salvar configurações.' };
    }
}

// ═══════════════════════════════════════════════════════════════════
// History — Leitura
// ═══════════════════════════════════════════════════════════════════

/** Busca histórico de alterações por historyKey. */
export async function getSettingsHistory(historyKey: string): Promise<SettingsHistoryEntry[]> {
    try {
        const row = await prisma.siteSettings.findUnique({
            where: { key: historyKey },
        });
        if (!row) return [];
        return JSON.parse(row.value);
    } catch (error) {
        console.error(`[SiteSettings] Failed to read history="${historyKey}":`, error);
        return [];
    }
}
