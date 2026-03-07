/**
 * @file LandingFooter.tsx
 * @description Footer da landing com contato, links legais e copyright.
 */

import { Link } from '@/i18n/navigation';
import { FooterLinkItem } from '@/config/landing.config';

interface LandingFooterProps {
    contactText: string;
    copyrightText: string;
    links: FooterLinkItem[];
}

export function LandingFooter({ contactText, copyrightText, links }: LandingFooterProps) {
    return (
        <footer className="relative py-16" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 20, 0.8) 30%, rgba(5, 5, 15, 1) 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}>
            <div className="container mx-auto px-4 max-w-6xl text-center space-y-8">
                {/* Logo */}
                <div className="font-bold text-2xl tracking-tighter" style={{
                    background: 'linear-gradient(135deg, rgb(129, 140, 248), rgb(168, 85, 247))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Tracka
                </div>

                {/* Contato */}
                <div className="text-gray-400 font-medium">{contactText}</div>

                {/* Links */}
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    {links.map((link, idx) => (
                        <Link key={idx} href={link.href} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors duration-200">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Divider */}
                <div className="w-24 h-px mx-auto" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
                }} />

                {/* Copyright */}
                <div className="text-xs text-gray-600">{copyrightText}</div>
            </div>
        </footer>
    );
}
