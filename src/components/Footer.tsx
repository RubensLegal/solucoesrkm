import { Link } from '@/i18n/navigation';

interface FooterProps {
    contact: string;
    rights: string;
    links: { label: string; href: string }[];
}

export function Footer({ contact, rights, links }: FooterProps) {
    return (
        <footer className="border-t border-white/5 mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="font-bold text-xl" style={{
                            background: 'linear-gradient(to right, rgb(129, 140, 248), rgb(168, 85, 247))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Soluções RKM
                        </div>
                        <p className="text-xs text-gray-500 max-w-xs">{contact}</p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-6">
                        {links.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600">{rights}</p>
                </div>
            </div>
        </footer>
    );
}
