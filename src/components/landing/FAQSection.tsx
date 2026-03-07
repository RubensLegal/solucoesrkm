/**
 * @file FAQSection.tsx
 * @description Seção FAQ com accordion interativo e animações suaves.
 *
 * Primeiro item aberto por default.
 * Open/close com animação CSS de height/opacity.
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '@/config/landing.config';

interface FAQSectionProps {
    title: string;
    items: FAQItem[];
}

export function FAQSection({ title, items }: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!items || items.length === 0) return null;

    return (
        <section id="faq" className="py-24 text-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>{title}</h2>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="rounded-xl overflow-hidden transition-all duration-300" style={{
                            background: openIndex === index
                                ? 'linear-gradient(135deg, rgba(30, 30, 60, 0.8), rgba(20, 20, 50, 0.9))'
                                : 'rgba(20, 20, 30, 0.6)',
                            border: openIndex === index
                                ? '1px solid rgba(99, 102, 241, 0.2)'
                                : '1px solid rgba(255, 255, 255, 0.05)',
                        }}>
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="text-lg font-medium pr-8">{item.question}</span>
                                <ChevronDown className={`w-5 h-5 shrink-0 text-indigo-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div
                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    maxHeight: openIndex === index ? '200px' : '0',
                                    opacity: openIndex === index ? 1 : 0,
                                }}
                            >
                                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
