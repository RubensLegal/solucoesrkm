/**
 * @file /api/auth/login/route.ts
 * @description API de login para employees.
 *
 * Valida email + senha, verifica se é employee, cria session JWT.
 * Sem cadastro público — user deve existir no banco.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, setSession, type SessionPayload } from '@/lib/auth';
import { rateLimit } from '@/infrastructure/security/rate-limiter';

// 5 tentativas de login por minuto por IP (proteção contra brute force)
const loginLimiter = rateLimit({ maxRequests: 5, windowMs: 60_000, prefix: 'login' });

export async function POST(req: NextRequest) {
    const limited = loginLimiter(req);
    if (limited) return limited;
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
        }

        // ── Buscar user ──
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, name: true, passwordHash: true, role: true },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // ── Verificar senha ──
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // ── Criar session ──
        const payload: SessionPayload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        await setSession(payload);

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
