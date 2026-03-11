import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { Package, Rocket, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'corporate' });
    return {
        title: `${t('brand')} — ${t('tagline')}`,
        description: t('description'),
    };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const t = await getTranslations('corporate');
    const tt = await getTranslations('tracka');

    const footerLinks = [
        { label: t('footer.links.faq'), href: '/faq' },
        { label: t('footer.links.terms'), href: '/terms' },
        { label: t('footer.links.privacy'), href: '/privacy' },
        { label: t('footer.links.cookies'), href: '/cookies' },
        { label: t('footer.links.legal'), href: '/legal' },
    ];

    const stats = [
        { icon: Shield, label: t('stats.secure'), desc: t('stats.secure_desc') },
        { icon: Zap, label: t('stats.fast'), desc: t('stats.fast_desc') },
        { icon: Sparkles, label: t('stats.smart'), desc: t('stats.smart_desc') },
    ];

    const tags = t('products.tracka.tags').split(',');

    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 20%, #0a0a1a 40%, #080816 100%)',
        }}>
            <LandingHeader
                logoText="Tracka"
                navHome={t('nav.home')}
                navFeatures={tt('features.title')}
                navPricing={tt('pricing.title')}
                navAbout={t('brand')}
                loginText={t('login')}
            />

            {/* Hero */}
            <section className="relative min-h-[80vh] flex items-center justify-center px-4 pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-[#0a0a0a] to-[#0a0a0a]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-600/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl text-center space-y-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        {t('tagline')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                        <span style={{
                            background: 'linear-gradient(135deg, rgb(129, 140, 248), rgb(168, 85, 247), rgb(236, 72, 153))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {t('brand')}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('description')}
                    </p>

                    <div className="flex justify-center gap-8 pt-4">
                        {stats.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="text-center space-y-1">
                                <Icon className="w-5 h-5 mx-auto text-purple-400" />
                                <p className="text-sm font-semibold text-white">{label}</p>
                                <p className="text-[10px] text-gray-500">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section className="relative z-20 max-w-5xl mx-auto px-4 py-20">
                <div className="text-center space-y-3 mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold">{t('products.title')}</h2>
                    <p className="text-sm text-gray-500">{t('products.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Tracka */}
                    <Link href="/" className="group block">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-500/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{t('products.tracka.name')}</h3>
                                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{t('products.tracka.active')}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{t('products.tracka.desc')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium pt-2 group-hover:gap-3 transition-all">
                                    {t('products.learn_more')} <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Coming Soon */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-8 opacity-60">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                    <Rocket className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-400">{t('products.coming_soon')}</h3>
                                    <span className="text-[10px] font-medium text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-full">{t('products.tracka.planned')}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{t('products.coming_soon_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer
                contact={t('footer.contact')}
                rights={t('footer.rights', { year: new Date().getFullYear().toString() })}
                links={footerLinks}
            />
        </div>
    );
}
