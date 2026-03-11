'use client';

/**
 * @file error.tsx
 * @description Error Boundary global para rotas com locale.
 *
 * Captura erros de runtime em qualquer rota /[locale]/*.
 * Oferece UX profissional com botão de retry.
 */

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[ErrorBoundary]', error);
    }, [error]);

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 50%, #0a0a1a 100%)',
            }}
        >
            <div
                className="text-center max-w-md p-8 rounded-2xl"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                {/* Icon */}
                <div
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                    Algo deu errado
                </h2>

                <p className="text-sm text-gray-400 mb-6">
                    Ocorreu um erro inesperado. Tente novamente ou volte à página inicial.
                </p>

                {/* Error digest for debugging */}
                {error.digest && (
                    <p className="text-xs text-gray-600 mb-4 font-mono">
                        Código: {error.digest}
                    </p>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: '#fff',
                        }}
                    >
                        Tentar novamente
                    </button>
                    <a
                        href="/"
                        className="px-5 py-2.5 text-sm font-medium rounded-lg text-gray-300 transition-all duration-200"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        Página inicial
                    </a>
                </div>
            </div>
        </div>
    );
}
