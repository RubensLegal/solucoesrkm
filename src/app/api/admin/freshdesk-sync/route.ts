import { NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import { syncCorporateToFreshdesk, pullCorporateFromFreshdesk, getSyncStatus, getSyncHistory } from '@/services/freshdesk-sync.service';

/**
 * GET /api/admin/freshdesk-sync
 * Retorna status do último sync corporativo + opcionalmente histórico.
 * Query: ?history=true para incluir histórico de sync.
 */
export async function GET(req: Request) {
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
        const includeHistory = url.searchParams.get('history') === 'true';

        if (includeHistory) {
            const history = await getSyncHistory();
            return NextResponse.json({ history });
        }

        const status = await getSyncStatus();
        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/freshdesk-sync
 * Dispara sincronização com Freshdesk KB.
 * Body: { action?: 'push' | 'pull' | 'both' } (default: 'push')
 */
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden — ADMIN only' }, { status: 403 });
        }

        let body: { action?: string } = {};
        try { body = await req.json(); } catch { /* default: push */ }
        const action = body.action || 'push';

        if (action === 'pull') {
            const result = await pullCorporateFromFreshdesk('admin');
            return NextResponse.json({ action: 'pull', ...result });
        }

        if (action === 'both') {
            const pullResult = await pullCorporateFromFreshdesk('admin');
            const pushResult = await syncCorporateToFreshdesk('admin');
            return NextResponse.json({ action: 'both', pull: pullResult, push: pushResult });
        }

        // Default: push
        const result = await syncCorporateToFreshdesk('admin');
        return NextResponse.json({ action: 'push', ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
