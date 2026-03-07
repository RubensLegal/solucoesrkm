/**
 * @file TestimonialsSection.tsx
 * @description Seção de depoimentos de usuários.
 */

'use client';

import { TestimonialItem } from '@/config/landing.config';
import { Quote } from 'lucide-react';

interface TestimonialsSectionProps {
    items: TestimonialItem[];
    title?: string;
}

export function TestimonialsSection({ items, title }: TestimonialsSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <section id="testimonials" className="py-24 bg-[#141414] text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-16">{title || 'O que dizem nossos usuários'}</h2>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {items.map((item, index) => (
                        <div key={index} className="bg-[#1c1c1c] p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                            <div className="bg-indigo-500/10 p-3 rounded-full mb-6">
                                <Quote className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-lg text-gray-300 mb-8 italic">&quot;{item.content}&quot;</p>
                            <div className="mt-auto">
                                <div className="font-bold text-white">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
