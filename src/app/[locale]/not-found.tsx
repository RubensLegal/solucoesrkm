/**
 * @file not-found.tsx
 * @description Página 404 customizada para rotas /[locale]/.
 *
 * Exibida quando o usuário acessa uma rota inexistente.
 * Design consistente com o tema dark glassmorphism do site.
 */

import { Link } from '@/i18n/navigation';

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 50%, #0a0a1a 100%)',
            }}
        >
            <div className="text-center max-w-md">
                {/* Large 404 */}
                <div className="mb-6">
                    <span
                        className="text-8xl font-black tracking-tighter"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        404
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    Página não encontrada
                </h1>

                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    A página que você está procurando não existe, foi movida ou está temporariamente indisponível.
                </p>

                <div className="flex gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: '#fff',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Voltar ao início
                    </Link>
                    <Link
                        href="/help"
                        className="px-6 py-2.5 text-sm font-medium rounded-lg text-gray-300 transition-all duration-200"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        Central de Ajuda
                    </Link>
                </div>
            </div>
        </div>
    );
}
