/**
 * @file freshdesk-sync/route.ts
 * @description API para sincronizar tópicos do help com o Freshdesk Knowledge Base.
 *
 * POST /api/admin/freshdesk-sync
 *   - Apenas SUPERADMIN pode executar
 *   - Aceita { locale?: 'pt' | 'en' } no body (default: 'pt')
 *   - Retorna SyncResult com contadores e detalhes
 *
 * GET /api/admin/freshdesk-sync
 *   - ADMIN ou SUPERADMIN
 *   - Retorna status do último sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';
import { syncHelpToFreshdesk, getSyncStatus } from '@/services/freshdesk-sync.service';

/**
 * GET — Retorna status do último sync (data, contagem de artigos/categorias).
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const status = await getSyncStatus();
        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST — Executa sincronização completa Help → Freshdesk KB.
 * Cria categorias, pastas e artigos no Freshdesk.
 * Requer FRESHDESK_API_KEY no .env.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getSystemRole(session.userId as string);
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Forbidden — SUPERADMIN only' }, { status: 403 });
        }

        // Locale opcional (default: pt)
        let locale = 'pt';
        try {
            const body = await req.json();
            if (body.locale && ['pt', 'en'].includes(body.locale)) {
                locale = body.locale;
            }
        } catch {
            // Body vazio é ok, usa default
        }

        const result = await syncHelpToFreshdesk(locale);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[freshdesk-sync]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
