/**
 * Health Check API — Soluções RKM
 * 
 * GET /api/health
 * Retorna status do app + conectividade do DB.
 * Sem auth — monitors precisam acessar.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const startTime = Date.now();

    try {
        await prisma.$queryRawUnsafe('SELECT 1');

        return NextResponse.json(
            {
                status: 'ok',
                db: 'connected',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                responseTimeMs: Date.now() - startTime,
                environment: process.env.NODE_ENV || 'development',
            },
            { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
        );
    } catch (err: any) {
        return NextResponse.json(
            { status: 'degraded', db: 'error', error: err.message, uptime: process.uptime(), timestamp: new Date().toISOString() },
            { status: 503, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
        );
    }
}
