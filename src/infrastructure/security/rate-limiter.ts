/**
 * ──────────────────────────────────────────────────────────────────────────
 * Rate Limiter — Proteção contra abuso de endpoints
 * ──────────────────────────────────────────────────────────────────────────
 *
 * O QUE FAZ:
 *   Limita o número de requisições por IP em uma janela de tempo.
 *   Se o limite for excedido, retorna HTTP 429 (Too Many Requests).
 *
 * COMO FUNCIONA:
 *   Usa um Map em memória (volatil — reseta ao reiniciar ou novo deploy).
 *   Para produção enterprise, considere Redis ou Vercel KV.
 *   Para a maioria dos SaaS, in-memory é suficiente no Vercel
 *   (serverless com cold start limpa naturalmente o Map).
 *
 * USO:
 *   import { rateLimit } from '@/infrastructure/security/rate-limiter';
 *
 *   const limiter = rateLimit({ maxRequests: 5, windowMs: 60_000 });
 *
 *   export async function POST(req: NextRequest) {
 *       const limited = limiter(req);
 *       if (limited) return limited; // Retorna 429 automaticamente
 *       // ... sua lógica
 *   }
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Store global — compartilhado entre chamadas na mesma instância
const store = new Map<string, RateLimitEntry>();

// Limpeza periódica para evitar memory leak (a cada 60s)
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
    }
}, 60_000);

interface RateLimitOptions {
    /** Número máximo de requisições na janela. Default: 10. */
    maxRequests?: number;
    /** Janela de tempo em ms. Default: 60_000 (1 minuto). */
    windowMs?: number;
    /** Prefixo para diferenciar limites por endpoint. Default: 'global'. */
    prefix?: string;
}

/**
 * Cria um rate limiter reutilizável.
 *
 * @returns Função que aceita NextRequest e retorna NextResponse se limitado, ou null se OK.
 */
export function rateLimit(options: RateLimitOptions = {}) {
    const {
        maxRequests = 10,
        windowMs = 60_000,
        prefix = 'global',
    } = options;

    return function check(req: NextRequest): NextResponse | null {
        // Identificar o cliente pelo IP (Vercel fornece via header)
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';

        const key = `${prefix}:${ip}`;
        const now = Date.now();
        const entry = store.get(key);

        if (!entry || entry.resetAt < now) {
            // Nova janela
            store.set(key, { count: 1, resetAt: now + windowMs });
            return null; // OK
        }

        entry.count++;

        if (entry.count > maxRequests) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            return NextResponse.json(
                {
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: `Muitas requisições. Tente novamente em ${retryAfter}s.`,
                    },
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfter),
                        'X-RateLimit-Limit': String(maxRequests),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(entry.resetAt),
                    },
                },
            );
        }

        return null; // OK
    };
}
