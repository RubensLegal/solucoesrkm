import { NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import { syncCorporateToFreshdesk, getSyncStatus } from '@/services/freshdesk-sync.service';

/**
 * GET /api/admin/freshdesk-sync
 * Retorna o status do último sync corporativo.
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

        const status = await getSyncStatus();
        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/freshdesk-sync
 * Dispara sincronização do conteúdo corporativo com o Freshdesk KB.
 */
export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden — ADMIN only' }, { status: 403 });
        }

        const result = await syncCorporateToFreshdesk();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
