/**
 * @file loading.tsx
 * @description Loading state global para rotas /[locale]/.
 *
 * Exibido automaticamente pelo Next.js durante transições de rota
 * e carregamento de Server Components.
 */

export default function Loading() {
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 50%, #0a0a1a 100%)',
            }}
        >
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div
                    className="w-10 h-10 rounded-full animate-spin"
                    style={{
                        border: '3px solid rgba(124, 58, 237, 0.2)',
                        borderTopColor: '#7c3aed',
                    }}
                />
                <p className="text-sm text-gray-500 font-medium">
                    Carregando...
                </p>
            </div>
        </div>
    );
}
