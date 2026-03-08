/**
 * @file ThemeSwitcher.tsx
 * @description Dropdown for switching between dark/light/system themes.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const themes = [
    { code: 'light' as const, label: 'Claro', icon: Sun },
    { code: 'dark' as const, label: 'Escuro', icon: Moon },
    { code: 'system' as const, label: 'Sistema', icon: Monitor },
];

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const CurrentIcon = themes.find(t => t.code === theme)?.icon || Monitor;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 w-9 rounded-lg flex items-center justify-center transition-colors text-white hover:bg-white/10"
                aria-label="Select theme"
            >
                <CurrentIcon size={18} />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 min-w-[180px] rounded-2xl shadow-2xl py-2 px-2 z-50"
                    style={{
                        background: '#1e1e2e',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {themes.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.code}
                                onClick={() => { setTheme(t.code); setIsOpen(false); }}
                                className={`
                                    w-full text-left px-3 py-2.5 text-sm flex items-center justify-between gap-3
                                    rounded-xl transition-colors
                                    ${theme === t.code
                                        ? 'text-white font-semibold bg-purple-900/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2.5 whitespace-nowrap">
                                    <Icon size={16} />
                                    <span>{t.label}</span>
                                </span>
                                {theme === t.code && <Check size={14} className="shrink-0 text-purple-400" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
