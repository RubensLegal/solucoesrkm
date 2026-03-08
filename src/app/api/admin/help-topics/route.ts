import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { HELP_CATEGORIES } from '@/lib/help-topics';

const SETTINGS_KEY = 'help_topic_overrides';

/**
 * GET /api/admin/help-topics
 * Retorna todos os overrides de tópicos do help salvos no banco.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (!role || role === 'VIEWER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        const overrides = setting ? JSON.parse(setting.value) : {};

        return NextResponse.json({ overrides });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/admin/help-topics
 * Salva o conteúdo Markdown de um tópico.
 * Body: { slug: string, markdown: string }
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
        const { slug, markdown } = body;

        if (!slug || typeof markdown !== 'string') {
            return NextResponse.json({ error: 'slug e markdown são obrigatórios' }, { status: 400 });
        }

        // Buscar overrides existentes
        const setting = await prisma.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
        const overrides = setting ? JSON.parse(setting.value) : {};

        // Salvar conteúdo
        overrides[slug] = {
            markdown,
            updatedAt: new Date().toISOString(),
            updatedBy: session.name || session.email,
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

/**
 * DELETE /api/admin/help-topics
 * Remove o override de um tópico (volta ao padrão do JSON).
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
