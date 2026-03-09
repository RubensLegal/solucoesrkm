import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
    createTopicVersion,
    getTopicVersions,
    getSpecificVersion,
} from '@/services/help-versioning.service';

const SETTINGS_KEY = 'help_topic_overrides';

// ─── GET ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/help-topics
 * Retorna overrides e/ou versões.
 * Query: ?versions=slug para listar versões de um tópico específico.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (!role || role === 'VIEWER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const url = new URL(req.url);
        const versionsSlug = url.searchParams.get('versions');

        // Se pediu versões de um tópico específico
        if (versionsSlug) {
            const topicVersions = await getTopicVersions(versionsSlug);
            return NextResponse.json({
                slug: versionsSlug,
                versions: topicVersions,
                totalVersions: topicVersions.length,
            });
        }

        // Default: retornar overrides
        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        const overrides = setting ? JSON.parse(setting.value) : {};

        return NextResponse.json({ overrides });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─── PUT ─────────────────────────────────────────────────────────────────────

/**
 * PUT /api/admin/help-topics
 * Salva o conteúdo Markdown de um tópico COM versionamento.
 * Body: { slug: string, markdown: string, summary?: string }
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden — SUPERADMIN ou ADMIN only' }, { status: 403 });
        }

        const body = await req.json();
        const { slug, markdown, summary } = body;

        if (!slug || typeof markdown !== 'string') {
            return NextResponse.json({ error: 'slug e markdown são obrigatórios' }, { status: 400 });
        }

        const userName = session.name || session.email || 'admin';

        // 1. Criar versão (backup do conteúdo anterior + novo)
        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        const overrides = setting ? JSON.parse(setting.value) : {};

        // Se já existia conteúdo, salvar versão anterior primeiro
        if (overrides[slug]?.markdown && overrides[slug].markdown !== markdown) {
            await createTopicVersion(
                slug,
                overrides[slug].markdown,
                overrides[slug].updatedBy || 'desconhecido',
                'editor',
                'Backup automático antes de edição',
            );
        }

        // 2. Salvar nova versão
        await createTopicVersion(slug, markdown, userName, 'editor', summary);

        // 3. Atualizar override atual
        overrides[slug] = {
            markdown,
            updatedAt: new Date().toISOString(),
            updatedBy: userName,
        };

        await prisma.siteSettings.upsert({
            where: { key: SETTINGS_KEY },
            update: { value: JSON.stringify(overrides) },
            create: { key: SETTINGS_KEY, value: JSON.stringify(overrides) },
        });

        return NextResponse.json({ success: true, slug });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─── PATCH (Rollback) ────────────────────────────────────────────────────────

/**
 * PATCH /api/admin/help-topics
 * Restaura um tópico para uma versão anterior.
 * Body: { slug: string, version: number }
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden — SUPERADMIN ou ADMIN only' }, { status: 403 });
        }

        const body = await req.json();
        const { slug, version } = body;

        if (!slug || typeof version !== 'number') {
            return NextResponse.json({ error: 'slug e version são obrigatórios' }, { status: 400 });
        }

        const userName = session.name || session.email || 'admin';

        // Buscar versão alvo
        const targetVersion = await getSpecificVersion(slug, version);

        if (!targetVersion) {
            return NextResponse.json({ error: `Versão ${version} não encontrada para ${slug}` }, { status: 404 });
        }

        // Criar versão de rollback (registrar que foi restaurado)
        await createTopicVersion(
            slug,
            targetVersion.markdown,
            userName,
            'rollback',
            `Rollback para versão ${version} (${new Date(targetVersion.savedAt).toLocaleString('pt-BR')})`,
        );

        // Atualizar override atual com conteúdo da versão restaurada
        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        const overrides = setting ? JSON.parse(setting.value) : {};

        overrides[slug] = {
            markdown: targetVersion.markdown,
            updatedAt: new Date().toISOString(),
            updatedBy: `${userName} (rollback v${version})`,
        };

        await prisma.siteSettings.upsert({
            where: { key: SETTINGS_KEY },
            update: { value: JSON.stringify(overrides) },
            create: { key: SETTINGS_KEY, value: JSON.stringify(overrides) },
        });

        return NextResponse.json({
            success: true,
            slug,
            restoredVersion: version,
            message: `Tópico "${slug}" restaurado para versão ${version}`,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

/**
 * DELETE /api/admin/help-topics
 * Remove o override de um tópico (volta ao padrão do JSON).
 * Mantém o histórico de versões.
 * Body: { slug: string }
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Forbidden — SUPERADMIN only' }, { status: 403 });
        }

        const body = await req.json();
        const { slug } = body;

        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        if (!setting) return NextResponse.json({ success: true });

        const overrides = JSON.parse(setting.value);

        // Salvar versão antes de apagar
        if (overrides[slug]?.markdown) {
            const userName = session.name || session.email || 'admin';
            await createTopicVersion(
                slug,
                overrides[slug].markdown,
                userName,
                'editor',
                'Backup antes de remoção do override',
            );
        }

        delete overrides[slug];

        await prisma.siteSettings.update({
            where: { key: SETTINGS_KEY },
            data: { value: JSON.stringify(overrides) },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
