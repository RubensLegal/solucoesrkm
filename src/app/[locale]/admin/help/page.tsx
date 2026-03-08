/**
 * @file admin/help/page.tsx
 * @description Admin Help — documentation for developers and administrators.
 * Includes translation tool guide and other admin features.
 */

import { getSession, getSystemRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AdminTopBarClient } from '@/components/admin/AdminTopBarClient';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import {
    BookOpen, Languages, Globe, Save, AlertTriangle,
    CheckCircle, RefreshCw, Settings, Shield, Zap
} from 'lucide-react';

export default async function AdminHelpPage() {
    const session = await getSession();
    if (!session) redirect('/admin/login?callbackUrl=/admin/help');

    const role = await getSystemRole(session.userId);
    if (!role) redirect('/admin/login?callbackUrl=/admin/help');

    const t = await getTranslations('admin.help');

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Admin', href: '/admin/settings' },
        { label: t('title') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0e0e0e] text-gray-900 dark:text-white">
            <AdminTopBarClient />

            <div className="max-w-5xl mx-auto px-6 pt-6 pb-4">
                <Breadcrumb items={crumbs} />
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-sm text-gray-500">{t('subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-12 space-y-8">

                {/* ── Translation Tool Section ── */}
                <section className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Languages className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{t('translation.title')}</h2>
                                <p className="text-sm text-gray-500">{t('translation.description')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">

                        {/* How it works */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                <Zap className="w-4 h-4 text-amber-500" />
                                {t('translation.howItWorks')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center mb-3">
                                            {step}
                                        </div>
                                        <h4 className="text-sm font-semibold mb-1">{t(`translation.step${step}Title`)}</h4>
                                        <p className="text-xs text-gray-500">{t(`translation.step${step}Desc`)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important notes */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                {t('translation.importantNotes')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                    <Globe className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('translation.note1')}</p>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <Save className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('translation.note2')}</p>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('translation.note3')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Error indicators */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                {t('translation.errorIndicators')}
                            </h3>
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-white/[0.03]">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 font-semibold">{t('translation.indicator')}</th>
                                            <th className="text-left px-4 py-2.5 font-semibold">{t('translation.meaning')}</th>
                                            <th className="text-left px-4 py-2.5 font-semibold">{t('translation.action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        <tr>
                                            <td className="px-4 py-2.5">
                                                <span className="inline-flex items-center gap-1.5 text-emerald-500">
                                                    <CheckCircle className="w-3.5 h-3.5" /> {t('translation.successLabel')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500">{t('translation.successMeaning')}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{t('translation.successAction')}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2.5">
                                                <span className="inline-flex items-center gap-1.5 text-amber-500">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> {t('translation.warningLabel')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500">{t('translation.warningMeaning')}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{t('translation.warningAction')}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2.5">
                                                <span className="inline-flex items-center gap-1.5 text-red-500">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> {t('translation.errorLabel')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500">{t('translation.errorMeaning')}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{t('translation.errorAction')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* API Endpoints for developers */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                <Shield className="w-4 h-4 text-purple-500" />
                                {t('translation.apiEndpoints')}
                            </h3>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-gray-900 dark:bg-black/40 border border-gray-700 dark:border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">POST</span>
                                        <code className="text-xs text-blue-400">/api/admin/translate-config</code>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">{t('translation.apiMigration')}</p>
                                    <pre className="text-[11px] text-gray-300 bg-black/30 p-3 rounded-lg overflow-x-auto">
                                        {`{
  "fromLocale": "pt",
  "toLocale": "en"
}`}
                                    </pre>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-900 dark:bg-black/40 border border-gray-700 dark:border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">POST</span>
                                        <code className="text-xs text-blue-400">/api/admin/translate-fields</code>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">{t('translation.apiFields')}</p>
                                    <pre className="text-[11px] text-gray-300 bg-black/30 p-3 rounded-lg overflow-x-auto">
                                        {`{
  "fields": { "heroTitle": "..." },
  "arrays": { "testimonials": [...] },
  "fromLocale": "pt",
  "toLocale": "en"
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Tech details */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                {t('translation.techDetails')}
                            </h3>
                            <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-5">
                                <li>{t('translation.tech1')}</li>
                                <li>{t('translation.tech2')}</li>
                                <li>{t('translation.tech3')}</li>
                                <li>{t('translation.tech4')}</li>
                                <li>{t('translation.tech5')}</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
