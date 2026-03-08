/**
 * @file AdminTopBarClient.tsx
 * @description Client component housing LanguageSwitcher + ThemeSwitcher for admin top bar.
 */

'use client';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function AdminTopBarClient() {
    return (
        <div className="flex items-center gap-1">
            <LanguageSwitcher variant="dark" />
            <ThemeSwitcher />
        </div>
    );
}
