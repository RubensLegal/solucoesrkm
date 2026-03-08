/**
 * @file AdminTopBarClient.tsx
 * @description Client component housing LanguageSwitcher + ThemeSwitcher for admin top bar.
 * Detects current theme to pass correct variant to LanguageSwitcher.
 */

'use client';

import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function AdminTopBarClient() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const check = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        check();

        // Watch for class changes on html element
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex items-center gap-1">
            <LanguageSwitcher variant={isDark ? 'dark' : 'light'} />
            <ThemeSwitcher />
        </div>
    );
}
