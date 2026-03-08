/**
 * @file CollapsibleSection.tsx
 * @description Section card for admin settings. Always expanded (non-collapsible).
 * Theme-responsive: adapts to light/dark mode.
 */

import { type ReactNode } from 'react';

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
    children,
}: CollapsibleSectionProps) {
    return (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-transparent transition-colors">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
                    </div>
                </div>
                {badge && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
            {/* Content — always visible */}
            <div className="px-4 pb-4 pt-4">
                {children}
            </div>
        </div>
    );
}
