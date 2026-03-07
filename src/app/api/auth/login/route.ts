/**
 * @file /api/auth/login/route.ts
 * @description API de login para employees.
 *
 * Valida email + senha, verifica se é employee, cria session JWT.
 * Sem cadastro público — user deve existir no banco.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, setSession, type SessionPayload } from '@/lib/auth';

export async function POST(req: Request) {
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
