/**
 * @file LanguageSwitcher.tsx
 * @description Globe icon dropdown for switching between PT/EN locales.
 * Uses direct URL manipulation for reliable locale switching.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

const languages = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
    variant?: 'dark' | 'light';
}

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
    const locale = useLocale();
    const pathname = usePathname(); // full pathname including locale prefix
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const switchLanguage = (newLocale: string) => {
        // Replace locale prefix in the URL path
        // pathname is like /pt/admin/settings → replace /pt/ with /en/
        const pathWithoutLocale = pathname.replace(/^\/(pt|en)/, '');
        const newPath = `/${newLocale}${pathWithoutLocale || '/'}`;
        window.location.href = newPath;
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDark = variant === 'dark';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${isDark
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                aria-label="Select language"
            >
                <Globe size={18} />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 min-w-[200px] rounded-2xl shadow-2xl py-2 px-2 z-50"
                    style={{
                        background: isDark ? '#1e1e2e' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    }}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={`
                                w-full text-left px-3 py-2.5 text-sm flex items-center justify-between gap-3
                                rounded-xl transition-colors
                                ${locale === lang.code
                                    ? isDark
                                        ? 'text-white font-semibold bg-purple-900/30'
                                        : 'text-gray-900 font-semibold bg-purple-50'
                                    : isDark
                                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2.5 whitespace-nowrap">
                                <span className="text-lg leading-none">{lang.flag}</span>
                                <span>{lang.label}</span>
                            </span>
                            {locale === lang.code && <Check size={14} className="shrink-0 text-purple-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
