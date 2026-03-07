'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    iconBg?: string;
    badge?: string;
    badgeColor?: string;
    defaultOpen?: boolean;
    children: ReactNode;
}

export function CollapsibleSection({
    title,
    subtitle,
    icon,
    iconBg = 'bg-gradient-to-br from-teal-500 to-emerald-600',
    badge,
    badgeColor = 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/20',
    defaultOpen = false,
    children,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {badge && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
                            {badge}
                        </span>
                    )}
                    <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5" />
                    </span>
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-white/5">
                    {children}
                </div>
            )}
        </div>
    );
}
