/**
 * @file proxy.ts
 * @description Next.js 16 Proxy (formerly Middleware) — i18n routing.
 *
 * Next.js 16+ uses "proxy" instead of "middleware".
 * Responsabilidades:
 * 1. Roteamento i18n via next-intl (locale detection + redirect)
 * 2. Matcher exclui: API routes, assets estáticos, _next internals
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';

export default createMiddleware(routing);

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
};
