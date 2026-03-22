/**
 * @file CollapsibleSection.tsx
 * @description Collapsible section card for admin settings.
 * Supports defaultOpen prop — collapses with smooth animation.
 * Theme-responsive: adapts to light/dark mode.
 */

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
    defaultOpen = true,
    children,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-transparent transition-colors">
            {/* Header — clickable toggle */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            {icon}
                        </div>
                    )}
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
                            {badge}
                        </span>
                    )}
                    <ChevronDown
                        className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>
            {/* Content — collapsible with animation */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-4 pb-4 pt-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
