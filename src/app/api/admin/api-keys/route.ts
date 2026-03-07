/**
 * @file /api/admin/api-keys/route.ts
 * @description API para gerenciar chaves de API externas.
 * GET: retorna chaves atuais. PUT: atualiza chaves.
 * Protegida: requer Employee com permissão de edição.
 */

import { NextResponse } from 'next/server';
import { getSession, getSystemRole, canEdit } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/actions/site-settings.actions';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getSystemRole(session.userId);
    if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await getSiteSettings('api_keys');
    return NextResponse.json(data || {});
}

export async function PUT(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getSystemRole(session.userId);
    if (!canEdit(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const result = await updateSiteSettings('api_keys', body);
    return NextResponse.json(result);
}
