/**
 * @file SharedLandingComponents.tsx
 * @description Componentes reutilizáveis da landing page com design premium.
 *
 * FeatureRow: Seção horizontal scrollável com cards.
 * FeatureCard: Card com glassmorphism, gradient borders e glow icons.
 */

import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Seção horizontal scrollável com título animado.
 */
export function FeatureRow({ id, title, icon, children, viewAllText }: {
    id?: string;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    viewAllText: string;
}) {
    return (
        <section id={id} className="space-y-6 group/row scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100 flex items-center gap-4 pl-2 transition-colors duration-300">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg" style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                }}>
                    {icon}
                </span>
                {title}
                <span className="text-sm font-normal text-indigo-400 flex items-center opacity-0 group-hover/row:opacity-100 transition-all ml-4 pointer-events-none transform translate-x-[-10px] group-hover/row:translate-x-0 duration-300">
                    {viewAllText} <ChevronRight size={16} />
                </span>
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-8 pt-2 scrollbar-thin snap-x mandatory pr-4">
                {children}
            </div>
        </section>
    );
}

/**
 * Card individual com glassmorphism e gradient hover.
 */
export function FeatureCard({ title, description, icon, wide = false }: {
    title: string;
    description: string;
    icon: ReactNode;
    wide?: boolean;
}) {
    return (
        <div className={`
            relative flex-none rounded-2xl overflow-hidden 
            ${wide ? 'w-[85vw] sm:w-[60%] md:w-[45%]' : 'w-[85vw] sm:w-[45%] md:w-[30%] lg:w-[23%]'} 
            min-h-[220px] group cursor-pointer 
            hover:z-50 transition-all duration-500 ease-out
            snap-start
            flex flex-col
        `} style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.8), rgba(15, 15, 30, 0.9))',
                border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
            {/* Gradient border glow on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'inherit',
            }} />

            {/* Icon glow effect */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none blur-2xl" style={{
                background: 'radial-gradient(circle, currentColor, transparent)',
            }} />

            <div className="relative z-10 flex flex-col h-full p-5 text-center">
                {/* Ícone + Título */}
                <div className="flex-1 flex flex-col justify-center items-center transition-all duration-300">
                    <div className="flex flex-row items-center gap-2 
                                    lg:flex-col lg:justify-center lg:gap-2 
                                    lg:group-hover:flex-row lg:group-hover:gap-2 
                                    transition-all duration-300">
                        <div className="text-gray-300 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 flex-shrink-0 p-2.5 rounded-xl group-hover:bg-white/5">
                            {icon}
                        </div>
                        <h3 className="font-bold text-white text-lg md:text-xl group-hover:text-indigo-300 transition-colors text-left lg:text-center lg:group-hover:text-left leading-snug">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Descrição — expand on hover (desktop), always visible (mobile) */}
                <div className="lg:max-h-0 lg:opacity-0 lg:overflow-hidden group-hover:max-h-[300px] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                    <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 mt-3 leading-relaxed p-3 rounded-xl transition-colors" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
