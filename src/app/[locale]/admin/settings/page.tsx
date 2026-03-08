/**
 * @file admin/settings/page.tsx
 * @description Painel admin SaaS — configurações da landing page, Freshdesk e API keys.
 *
 * Acesso: employees only (via getSystemRole)
 * Seções: Landing Page, Freshdesk, API Keys, Planos (info-only)
 * Theme-responsive: supports dark/light/system via ThemeProvider
 */

import { getSession, getSystemRole, canEdit as checkCanEdit } from '@/lib/auth';
import { SiteConfigForm } from '@/components/admin/SiteConfigForm';
import { redirect } from 'next/navigation';
import { getLandingPageConfig } from '@/config/landing.config';
import { getFreshdeskConfig } from '@/config/freshdesk.config';
import { getSettingsHistory } from '@/actions/site-settings.actions';
import { FreshdeskConfigForm } from '@/components/admin/FreshdeskConfigForm';
import { ApiKeysForm } from '@/components/admin/ApiKeysForm';
import { CollapsibleSection } from '@/components/admin/CollapsibleSection';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Settings, Globe, Key, Headset, Shield, CreditCard, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AdminTopBarClient } from '@/components/admin/AdminTopBarClient';

/** Extract i18n text fields that map to landing page config */
async function getI18nLandingDefaults(locale: string) {
    const t = await getTranslations({ locale, namespace: 'tracka' });
    const tc = await getTranslations({ locale, namespace: 'corporate' });
    return {
        heroSubtitle: t('hero.subtitle'),
        ctaPrimaryText: t('hero.cta_primary'),
        featuresTitle: t('features.title'),
        techTitle: t('technology.title'),
        footerCtaTitle: t('cta.title'),
        footerCtaSubtitle: t('cta.subtitle'),
        footerCtaButton: t('cta.button'),
        footerContact: tc('footer.contact'),
    };
}

export default async function AdminSettingsPage() {
    // ── Auth: employee-only ──
    const session = await getSession();
    if (!session) {
        redirect('/admin/login?callbackUrl=/admin/settings');
    }

    const role = await getSystemRole(session.userId);
    if (!role) {
        redirect('/admin/login?callbackUrl=/admin/settings');
    }

    // ── Fetch all configs and i18n defaults in parallel ──
    const [config, freshdeskConfig, landingHistory, freshdeskHistory, apiKeysHistory, i18nPt, i18nEn] = await Promise.all([
        getLandingPageConfig(),
        getFreshdeskConfig(),
        getSettingsHistory('landing_page_history'),
        getSettingsHistory('freshdesk_history'),
        getSettingsHistory('api_keys_history'),
        getI18nLandingDefaults('pt'),
        getI18nLandingDefaults('en'),
    ]);

    const isCanEdit = checkCanEdit(role);
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0e0e0e] dark:text-white transition-colors duration-300">
            {/* ─── Top Bar ─── */}
            <div className="border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
                <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-wide leading-none text-gray-900 dark:text-white">Soluções RKM</h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Painel Admin — Corporativo</p>
                            </div>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10" />
                        <Breadcrumb items={[
                            { label: 'Home', href: '/' },
                            { label: 'Admin' },
                            { label: 'Settings' },
                        ]} />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Language + Theme switchers (client component) */}
                        <AdminTopBarClient />

                        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${role === 'SUPERADMIN' ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20' :
                            role === 'ADMIN' ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20' :
                                role === 'EDITOR' ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20' :
                                    'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/20'
                            }`}>
                            {role}
                        </span>
                        {!isCanEdit && (
                            <span className="text-[10px] text-yellow-500/70 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Leitura
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Page Header ─── */}
            <div className="max-w-[1800px] mx-auto px-6 pt-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-5 h-5 text-blue-400" />
                            <h2 className="text-2xl font-bold">Configurações</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure textos, seções, integrações e APIs do site corporativo.
                        </p>
                    </div>
                    {isCanEdit && (
                        <p className="text-xs text-emerald-500/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Modo Edição
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Content Sections ─── */}
            <div className="max-w-[1800px] mx-auto px-6 pb-12 space-y-8">
                {/* Landing Page Config */}
                <CollapsibleSection
                    title="Landing Page"
                    subtitle="Configure textos, seções, depoimentos e links da página pública do Tracka."
                    icon={<Globe className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-teal-500 to-emerald-600"
                >
                    <SiteConfigForm initialData={config} canEdit={isCanEdit} history={landingHistory} i18nDefaults={{ pt: i18nPt, en: i18nEn }} />
                </CollapsibleSection>

                {/* Plans & Pricing — Info only */}
                <CollapsibleSection
                    title="Planos e Preços"
                    subtitle="Configuração dos planos de assinatura."
                    icon={<CreditCard className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
                >
                    <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/15 transition-colors">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                    A configuração de planos e preços é feita diretamente na página de configuração do aplicativo Tracka.
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Apenas o <span className="text-amber-600 dark:text-amber-400 font-semibold">Super Admin</span> tem acesso a essa configuração.
                                    As alterações feitas lá são refletidas automaticamente tanto no app quanto na landing page.
                                </p>
                                <a
                                    href={`${APP_URL}/pt/admin/settings`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors mt-2"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Abrir Configuração no Tracka
                                </a>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* API Keys */}
                <CollapsibleSection
                    title="Integrações / API Keys"
                    subtitle="Configure chaves de API para serviços externos."
                    icon={<Key className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
                >
                    <ApiKeysForm canEdit={isCanEdit} history={apiKeysHistory} />
                </CollapsibleSection>

                {/* Freshdesk */}
                <CollapsibleSection
                    title="Freshdesk — Suporte ao Cliente"
                    subtitle="Configure os módulos de suporte do Freshworks."
                    icon={<Headset className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-indigo-500 to-purple-600"
                >
                    <FreshdeskConfigForm initialData={freshdeskConfig} canEdit={isCanEdit} history={freshdeskHistory} />
                </CollapsibleSection>
            </div>
        </div>
    );
}
