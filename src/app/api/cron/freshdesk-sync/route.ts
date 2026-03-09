import { NextResponse } from 'next/server';
import { syncCorporateToFreshdesk, pullCorporateFromFreshdesk } from '@/services/freshdesk-sync.service';

/**
 * Cron endpoint para sync bidirecional corporativo com Freshdesk KB.
 * Protegido por CRON_SECRET (Vercel Cron) ou Authorization header.
 *
 * Fluxo: pull (Freshdesk→App) → push (App→Freshdesk)
 */
export async function GET(req: Request) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('Authorization');
    const vercelCronHeader = req.headers.get('x-vercel-cron');

    if (!cronSecret) {
        return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 });
    }

    const isVercelCron = vercelCronHeader === cronSecret;
    const isBearerAuth = authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isBearerAuth) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        // 1. Pull primeiro (Freshdesk → App)
        const pullResult = await pullCorporateFromFreshdesk('cron');

        // 2. Push depois (App → Freshdesk)
        const pushResult = await syncCorporateToFreshdesk('cron');

        return NextResponse.json({
            success: pullResult.success && pushResult.success,
            pull: {
                pulled: pullResult.pulled,
                unchanged: pullResult.unchanged,
                errors: pullResult.errors,
                details: pullResult.details,
            },
            push: {
                created: pushResult.created,
                updated: pushResult.updated,
                errors: pushResult.errors,
                details: pushResult.details,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
