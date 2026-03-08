/**
 * @file LanguageSwitcher.tsx
 * @description Seletor de idioma pt/en com dropdown.
 * Troca a locale via next-intl router.
 * O botão Globe mantém text-white para o header escuro.
 * O dropdown usa cores sólidas do tema para funcionar em qualquer fundo.
 */

'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const LANGUAGES = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const switchLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
        setIsOpen(false);
    };

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 w-9 text-white hover:text-purple-400 hover:bg-white/10"
                aria-label="Select language"
            >
                <Globe size={18} />
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[200px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-2 px-2 z-50">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between gap-3 rounded-xl transition-colors ${locale === lang.code
                                ? 'text-gray-900 dark:text-white font-semibold bg-purple-50 dark:bg-purple-900/30'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="flex items-center gap-2.5 whitespace-nowrap">
                                <span className="text-lg leading-none">{lang.flag}</span>
                                <span>{lang.label}</span>
                            </span>
                            {locale === lang.code && <Check size={14} className="shrink-0 text-purple-600 dark:text-purple-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
