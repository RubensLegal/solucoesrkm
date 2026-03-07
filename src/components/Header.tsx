'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Header() {
    const t = useTranslations('corporate');

    return (
        <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 md:px-12 transition-all duration-300 backdrop-blur-[2px]">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <Link href="/" className="font-bold text-2xl tracking-tighter hover:scale-105 transition-transform" style={{
                        background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(168, 85, 247))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Tracka
                    </Link>

                    <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
                        <Link href="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
                        <Link href="/about" className="hover:text-white transition-colors">{t('brand')}</Link>
                        <Link href="/faq" className="hover:text-white transition-colors">{t('nav.help')}</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <a
                        href={process.env.NEXT_PUBLIC_APP_URL + '/login'}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-purple-900/20"
                    >
                        {t('login')}
                    </a>
                </div>
            </div>
        </header>
    );
}
