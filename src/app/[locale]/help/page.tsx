'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HELP_CATEGORIES } from '@/lib/help-topics';
import { ArrowLeft, HelpCircle, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function HelpIndexPage() {
    const t = useTranslations('help');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            setIsSuperAdmin(data.user?.role === 'SUPERADMIN');
        }).catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-black/10 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2 flex-1">
                        <HelpCircle className="w-5 h-5 text-teal-500" />
                        <h1 className="text-lg font-bold text-foreground">{t('title')}</h1>
                    </div>
                    <LanguageSwitcher variant="light" />
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Subtitle */}
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                <p className="text-xs text-muted-foreground/70">{t('requiresInternet')}</p>

                {/* Categories */}
                {HELP_CATEGORIES.map((category) => {
                    // Filtrar tópicos superadminOnly
                    const visibleTopics = category.topics.filter(
                        topic => !topic.superadminOnly || isSuperAdmin
                    );
                    if (visibleTopics.length === 0) return null;

                    return (
                        <section key={category.id} className="space-y-3">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <span>{category.emoji}</span>
                                {t(`categories.${category.translationKey}`)}
                            </h2>

                            <div className="grid gap-2">
                                {visibleTopics.map((topic) => {
                                    const Icon = topic.icon;
                                    return (
                                        <Link
                                            key={topic.slug}
                                            href={`/help/${topic.slug}`}
                                            className="group flex items-center gap-3 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-card hover:bg-accent/50 hover:border-teal-300/50 dark:hover:border-teal-700/50 transition-all"
                                        >
                                            <div className="p-2 rounded-lg bg-accent/50 text-muted-foreground group-hover:bg-teal-500/10 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                                    {t(`topics.${topic.translationKey}.title`)}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {t(`topics.${topic.translationKey}.subtitle`)}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-500 transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </main>
        </div>
    );
}
