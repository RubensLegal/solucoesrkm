/**
 * @file LandingHeader.tsx
 * @description Header da landing page com logo, navegação e login CTA.
 *
 * Fixo no topo com glassmorphism. Inclui LanguageSwitcher.
 * Login aponta para tracka.solucoesrkm.com.
 */

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ReactNode } from 'react';

interface LandingHeaderProps {
    logoText: string;
    navHome: string;
    navFeatures: string;
    navPricing: string;
    navAbout: string;
    loginText: string;
}

export function LandingHeader({ logoText, navHome, navFeatures, navPricing, navAbout, loginText }: LandingHeaderProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    return (
        <header className="fixed top-0 w-full z-50 px-4 py-3 md:px-12 transition-all duration-300" style={{
            background: 'rgba(10, 10, 20, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="font-bold text-2xl tracking-tighter cursor-pointer hover:scale-105 transition-transform" style={{
                        background: 'linear-gradient(135deg, rgb(129, 140, 248), rgb(168, 85, 247))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {logoText}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                        <NavLink href="/">{navHome}</NavLink>
                        <NavLink href="#features">{navFeatures}</NavLink>
                        <NavLink href="#pricing">{navPricing}</NavLink>
                        <NavLink href="/about">{navAbout}</NavLink>
                    </nav>
                </div>

                {/* Auth + Language */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <a
                        href={`${appUrl}/login`}
                        className="text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }}
                    >
                        {loginText}
                    </a>
                </div>
            </div>
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="hover:text-white transition-colors duration-200 relative group">
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
        </Link>
    );
}
