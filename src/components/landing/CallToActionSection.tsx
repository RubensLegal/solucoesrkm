/**
 * @file CallToActionSection.tsx
 * @description Banner CTA final — convida usuário a criar conta.
 * Aponta para tracka.solucoesrkm.com/register.
 * Usa gradient indigo/purple alinhado com a marca.
 */

import { ChevronRight, Sparkles } from 'lucide-react';

interface CallToActionSectionProps {
    title: string;
    subtitle: string;
    buttonText: string;
}

export function CallToActionSection({ title, subtitle, buttonText }: CallToActionSectionProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    return (
        <section className="relative overflow-hidden w-full rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(88, 28, 135, 0.2) 50%, rgba(15, 15, 30, 0.9) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent)',
            }} />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15), transparent)',
                animationDelay: '2s',
            }} />

            <div className="space-y-6 text-center md:text-left relative z-10">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Comece agora</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{title}</h2>
                <p className="text-gray-300 text-lg max-w-lg">{subtitle}</p>
            </div>

            <a
                href={`${appUrl}/register`}
                className="group relative z-10 flex items-center gap-3 text-white text-lg font-bold px-10 py-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-105"
                style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                }}
            >
                {buttonText}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </a>
        </section>
    );
}
