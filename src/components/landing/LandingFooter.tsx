/**
 * @file LandingFooter.tsx
 * @description Footer da landing com contato, links legais e copyright.
 */

import { Link } from '@/i18n/navigation';
import type { FooterLinkItem } from '@/types';

interface LandingFooterProps {
    contactText: string;
    copyrightText: string;
    links: FooterLinkItem[];
}

export function LandingFooter({ contactText, copyrightText, links }: LandingFooterProps) {
    return (
        <footer className="relative py-16" style={{
            background: 'var(--landing-footer-gradient)',
            borderTop: '1px solid var(--landing-faq-border)',
        }}>
            <div className="container mx-auto px-4 max-w-6xl text-center space-y-8">
                {/* Logo */}
                <div className="font-bold text-2xl tracking-tighter landing-logo-gradient">
                    Tracka
                </div>

                {/* Contato */}
                <div className="text-gray-400 font-medium">{contactText}</div>

                {/* Links */}
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4" aria-label="Footer navigation">
                    {links.map((link, idx) => (
                        <Link key={idx} href={link.href} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors duration-200">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Divider */}
                <div className="w-24 h-px mx-auto" style={{
                    background: 'var(--landing-divider)',
                }} />

                {/* Copyright */}
                <div className="text-xs text-gray-600">{copyrightText}</div>
            </div>
        </footer>
    );
}
