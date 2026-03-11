/**
 * API Response Helpers + Auth Guards — Soluções RKM
 * 
 * Formato padronizado:
 *   Sucesso: { data: T }
 *   Erro: { error: { code, message } }
 */

import { NextResponse } from 'next/server';
import { getSession, getSystemRole } from '@/lib/auth';

export function apiSuccess<T>(data: T, status = 200, headers?: Record<string, string>) {
    return NextResponse.json({ data }, { status, headers });
}

export function apiError(code: string, message: string, status = 400, details?: unknown) {
    if (status >= 500) console.error(`[API_ERROR] ${code}: ${message}`, details || '');
    return NextResponse.json(
        { error: { code, message, ...(details && process.env.NODE_ENV !== 'production' ? { details } : {}) } },
        { status },
    );
}

export const API_ERRORS = {
    unauthorized: () => apiError('UNAUTHORIZED', 'Autenticação necessária', 401),
    forbidden: (msg = 'Sem permissão') => apiError('FORBIDDEN', msg, 403),
    notFound: (r = 'Recurso') => apiError('NOT_FOUND', `${r} não encontrado`, 404),
    badRequest: (msg: string, d?: unknown) => apiError('BAD_REQUEST', msg, 400, d),
    internal: (msg = 'Erro interno', d?: unknown) => apiError('INTERNAL_ERROR', msg, 500, d),
} as const;

type SystemRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | null;

interface AuthResult { session: { userId: string; email?: string; name?: string }; role: SystemRole; }
interface AuthError { error: NextResponse; }

export async function withAuth(): Promise<(AuthResult & { error?: never }) | (AuthError & { session?: never; role?: never })> {
    const session = await getSession();
    if (!session) return { error: API_ERRORS.unauthorized() };
    const role = await getSystemRole(session.userId as string);
    return { session: session as AuthResult['session'], role };
}

export async function withRole(allowedRoles: SystemRole[]): Promise<(AuthResult & { error?: never }) | (AuthError & { session?: never; role?: never })> {
    const result = await withAuth();
    if ('error' in result) return result;
    if (!allowedRoles.includes(result.role)) return { error: API_ERRORS.forbidden(`Requer role: ${allowedRoles.join(' ou ')}`) };
    return result;
}
