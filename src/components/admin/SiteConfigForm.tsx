'use client';

import { useTranslations, useLocale } from 'next-intl';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { updateSiteSettings } from '@/actions/site-settings.actions';
import { useState, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { LandingPageConfig } from '@/config/landing.config';
import {
    Plus, Trash2, Eye, EyeOff, Save, Shield, ExternalLink,
    Loader2, ChevronDown, ChevronUp, Image, Layout, Type,
    Megaphone, MessageSquareQuote, HelpCircle, Link2, MessageCircle,
} from 'lucide-react';
import { ChangeHistory } from '@/components/admin/ChangeHistory';
import type { SettingsHistoryEntry } from '@/actions/site-settings.actions';

/* ───────────────────── Schema ───────────────────── */

const siteConfigSchema = z.object({
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroImage: z.string().optional(),
    ctaPrimaryText: z.string().optional(),
    ctaPrimaryLink: z.string().optional(),
    featuresTitle: z.string().optional(),
    techTitle: z.string().optional(),
    footerCtaTitle: z.string().optional(),
    footerCtaSubtitle: z.string().optional(),
    footerCtaButton: z.string().optional(),
    footerContact: z.string().optional(),
    showFeatures: z.boolean().optional(),
    showTechnology: z.boolean().optional(),
    showPricing: z.boolean().optional(),
    showTestimonials: z.boolean().optional(),
    showFaq: z.boolean().optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    footerLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    testimonials: z.array(z.object({ name: z.string(), role: z.string(), content: z.string() })).optional(),
    featureTooltips: z.object({
        items: z.string().optional(),
        visionAi: z.string().optional(),
        houses: z.string().optional(),
        roomsPerHouse: z.string().optional(),
        furniturePerRoom: z.string().optional(),
        photosPerItem: z.string().optional(),
        collaboratorsPerHouse: z.string().optional(),
        history: z.string().optional(),
        ranking: z.string().optional(),
        importExcel: z.string().optional(),
        exportData: z.string().optional(),
        consolidation: z.string().optional(),
        aiAssistant: z.string().optional(),
    }).optional(),
});

type SiteConfigValues = z.infer<typeof siteConfigSchema>;

interface SiteConfigFormProps {
    initialData: LandingPageConfig;
    canEdit?: boolean;
    history?: SettingsHistoryEntry[];
    appUrl?: string;
}

/* ───────────────── Toggle Switch ────────────────── */

function ToggleSwitch({ label, checked, onChange, disabled }: {
    label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
    return (
        <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none
            ${checked
                ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5'
                : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0
                    ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm
                    ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                {checked ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />}
                {label}
            </span>
        </label>
    );
}

/* ───────────────── Field Group (Freshdesk pattern) ────────────────── */

function FieldGroup({ label, hint, children }: {
    label: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

/* ───────────────── Module Section (Freshdesk pattern) ────────────────── */

function ModuleSection({ title, description, icon, children, defaultExpanded = true }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className="border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden transition-all bg-white dark:bg-white/[0.01]">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        {icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
                        <p className="text-[11px] text-gray-500">{description}</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-white/5 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
}


/* ═══════════════════ MAIN FORM ══════════════════════ */

export function SiteConfigForm({ initialData, canEdit = true, history = [], appUrl = '' }: SiteConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationErrors, setTranslationErrors] = useState<Record<string, string>>({});
    const currentLocale = useLocale();
    const otherLocale = currentLocale === 'pt' ? 'en' : 'pt';
    const t = useTranslations('admin.landing');
    const tp = useTranslations('admin.plans');

    /** Track initial values to detect changes */
    const initialRef = useRef({
        heroTitle: initialData?.heroTitle || '',
        heroSubtitle: initialData?.heroSubtitle || '',
        ctaPrimaryText: initialData?.ctaPrimaryText || '',
        featuresTitle: initialData?.featuresTitle || '',
        techTitle: initialData?.techTitle || '',
        footerCtaTitle: initialData?.footerCtaTitle || '',
        footerCtaSubtitle: initialData?.footerCtaSubtitle || '',
        footerCtaButton: initialData?.footerCtaButton || '',
        footerContact: initialData?.footerContact || '',
        testimonials: initialData?.testimonials || [],
        faq: initialData?.faq || [],
        footerLinks: initialData?.footerLinks || [],
    });

    const TEXT_FIELDS = [
        'heroTitle', 'heroSubtitle', 'ctaPrimaryText',
        'featuresTitle', 'techTitle',
        'footerCtaTitle', 'footerCtaSubtitle', 'footerCtaButton', 'footerContact',
    ] as const;

    const form = useForm<SiteConfigValues>({
        resolver: zodResolver(siteConfigSchema),
        defaultValues: {
            heroTitle: initialData?.heroTitle || '',
            heroSubtitle: initialData?.heroSubtitle || '',
            heroImage: initialData?.heroImage || '',
            ctaPrimaryText: initialData?.ctaPrimaryText || '',
            ctaPrimaryLink: initialData?.ctaPrimaryLink || '',
            featuresTitle: initialData?.featuresTitle || '',
            techTitle: initialData?.techTitle || '',
            footerCtaTitle: initialData?.footerCtaTitle || '',
            footerCtaSubtitle: initialData?.footerCtaSubtitle || '',
            footerCtaButton: initialData?.footerCtaButton || '',
            footerContact: initialData?.footerContact || '',
            showFeatures: initialData?.showFeatures ?? true,
            showTechnology: initialData?.showTechnology ?? true,
            showPricing: initialData?.showPricing ?? false,
            showTestimonials: initialData?.showTestimonials ?? false,
            showFaq: initialData?.showFaq ?? true,
            faq: initialData?.faq || [],
            footerLinks: initialData?.footerLinks || [],
            testimonials: initialData?.testimonials || [],
            featureTooltips: {
                items: initialData?.featureTooltips?.items || '',
                visionAi: initialData?.featureTooltips?.visionAi || '',
                houses: initialData?.featureTooltips?.houses || '',
                roomsPerHouse: initialData?.featureTooltips?.roomsPerHouse || '',
                furniturePerRoom: initialData?.featureTooltips?.furniturePerRoom || '',
                photosPerItem: initialData?.featureTooltips?.photosPerItem || '',
                collaboratorsPerHouse: initialData?.featureTooltips?.collaboratorsPerHouse || '',
                history: initialData?.featureTooltips?.history || '',
                ranking: initialData?.featureTooltips?.ranking || '',
                importExcel: initialData?.featureTooltips?.importExcel || '',
                exportData: initialData?.featureTooltips?.exportData || '',
                consolidation: initialData?.featureTooltips?.consolidation || '',
                aiAssistant: initialData?.featureTooltips?.aiAssistant || '',
            },
        },
    });

    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: 'faq' });
    const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({ control: form.control, name: 'footerLinks' });
    const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({ control: form.control, name: 'testimonials' });

    /** Auto-translate changed fields to the other locale */
    async function autoTranslate(data: SiteConfigValues) {
        const changedFields: Record<string, string> = {};
        const changedArrays: Record<string, any[]> = {};

        // Detect changed text fields
        for (const field of TEXT_FIELDS) {
            const initial = (initialRef.current as any)[field] || '';
            const current = (data as any)[field] || '';
            if (current && current !== initial) {
                changedFields[field] = current;
            }
        }

        // Detect changed arrays
        if (JSON.stringify(data.testimonials) !== JSON.stringify(initialRef.current.testimonials)) {
            changedArrays.testimonials = data.testimonials || [];
        }
        if (JSON.stringify(data.faq) !== JSON.stringify(initialRef.current.faq)) {
            changedArrays.faq = data.faq || [];
        }
        if (JSON.stringify(data.footerLinks) !== JSON.stringify(initialRef.current.footerLinks)) {
            changedArrays.footerLinks = data.footerLinks || [];
        }

        const hasChanges = Object.keys(changedFields).length > 0 || Object.keys(changedArrays).length > 0;
        if (!hasChanges) return;

        try {
            setIsTranslating(true);
            const res = await fetch('/api/admin/translate-fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields: changedFields,
                    arrays: changedArrays,
                    fromLocale: currentLocale,
                    toLocale: otherLocale,
                }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                const newErrors: Record<string, string> = {};
                let errorCount = 0;

                if (result.results) {
                    for (const [key, val] of Object.entries(result.results as Record<string, any>)) {
                        if (val.error) {
                            newErrors[key] = val.error;
                            errorCount++;
                        }
                    }
                }

                if (result.arrayResults) {
                    for (const [key, val] of Object.entries(result.arrayResults as Record<string, any>)) {
                        if (val.errors?.length > 0) {
                            newErrors[key] = val.errors.join('; ');
                            errorCount++;
                        }
                    }
                }

                setTranslationErrors(newErrors);

                const totalFields = Object.keys(changedFields).length + Object.keys(changedArrays).length;
                if (errorCount === 0) {
                    toast.success(`✓ ${otherLocale.toUpperCase()}: ${totalFields} field(s) translated`);
                } else {
                    toast.warning(`⚠ ${otherLocale.toUpperCase()}: ${totalFields - errorCount} translated, ${errorCount} failed`);
                }

                // Update initial ref so next save only detects new changes
                for (const field of TEXT_FIELDS) {
                    (initialRef.current as any)[field] = (data as any)[field] || '';
                }
                initialRef.current.testimonials = data.testimonials || [];
                initialRef.current.faq = data.faq || [];
                initialRef.current.footerLinks = data.footerLinks || [];
            } else {
                toast.error(result.error || 'Translation failed');
            }
        } catch {
            toast.error('Translation service unreachable');
        } finally {
            setIsTranslating(false);
        }
    }

    function onSubmit(data: SiteConfigValues) {
        if (!canEdit) return;
        startTransition(async () => {
            try {
                const key = `landing_page_config_${currentLocale}`;
                await updateSiteSettings(key, data);
                toast.success(t('save') + ' ✓');
                autoTranslate(data);
            } catch (error) {
                toast.error('Erro ao salvar configurações.');
                console.error(error);
            }
        });
    }

    return (
        <>
            <Form {...form}>
                <fieldset disabled={!canEdit} className="group">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-6">

                            {/* ── Visibilidade das Seções ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                <ToggleSwitch
                                    label={t('toggleFeatures')}
                                    checked={form.watch('showFeatures') ?? true}
                                    onChange={(v) => form.setValue('showFeatures', v)}
                                    disabled={!canEdit}
                                />
                                <ToggleSwitch
                                    label={t('toggleTechnology')}
                                    checked={form.watch('showTechnology') ?? true}
                                    onChange={(v) => form.setValue('showTechnology', v)}
                                    disabled={!canEdit}
                                />
                                <ToggleSwitch
                                    label={t('toggleTestimonials')}
                                    checked={form.watch('showTestimonials') ?? false}
                                    onChange={(v) => form.setValue('showTestimonials', v)}
                                    disabled={!canEdit}
                                />
                                <ToggleSwitch
                                    label={t('togglePricing')}
                                    checked={form.watch('showPricing') ?? false}
                                    onChange={(v) => form.setValue('showPricing', v)}
                                    disabled={!canEdit}
                                />
                                <ToggleSwitch
                                    label={t('toggleFaq')}
                                    checked={form.watch('showFaq') ?? true}
                                    onChange={(v) => form.setValue('showFaq', v)}
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className="border-t border-gray-200 dark:border-white/5" />

                            {/* ── 1. Hero (Principal) ── */}
                            <ModuleSection
                                title={t('hero')}
                                description={t('heroDesc')}
                                icon={<Image className="w-4.5 h-4.5" />}
                            >
                                <FormField control={form.control} name="heroTitle" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('heroTitle')}>
                                            <FormControl><Input placeholder="Ex: Soluções RKM" {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('heroSubtitle')}>
                                            <FormControl><Textarea rows={3} {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="heroImage" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('heroImageUrl')} hint="Caminho relativo ou URL absoluta da imagem">
                                            <FormControl><Input placeholder="/hero-bg.png" {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="ctaPrimaryText" render={({ field }) => (
                                        <FormItem>
                                            <FieldGroup label={t('ctaPrimaryText')}>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FieldGroup>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="ctaPrimaryLink" render={({ field }) => (
                                        <FormItem>
                                            <FieldGroup label={t('ctaPrimaryLink')}>
                                                <FormControl><Input placeholder="/register" {...field} /></FormControl>
                                            </FieldGroup>
                                        </FormItem>
                                    )} />
                                </div>
                            </ModuleSection>

                            {/* ── 2. Títulos das Seções ── */}
                            <ModuleSection
                                title={t('sectionTitles')}
                                description="Títulos personalizados das seções da landing"
                                icon={<Type className="w-4.5 h-4.5" />}
                                defaultExpanded={false}
                            >
                                <FormField control={form.control} name="featuresTitle" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('features')}>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="techTitle" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('technology')}>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                            </ModuleSection>

                            {/* ── 3. CTA (Call to Action) ── */}
                            <ModuleSection
                                title={t('cta')}
                                description={t('ctaDesc')}
                                icon={<Megaphone className="w-4.5 h-4.5" />}
                                defaultExpanded={false}
                            >
                                <FormField control={form.control} name="footerCtaTitle" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('ctaTitle')}>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="footerCtaSubtitle" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('ctaSubtitle')}>
                                            <FormControl><Textarea rows={2} {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="footerCtaButton" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('ctaButton')}>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />
                            </ModuleSection>

                            {/* ── 4. Depoimentos ── */}
                            <ModuleSection
                                title={t('testimonials')}
                                description={t('testimonialsDesc')}
                                icon={<MessageSquareQuote className="w-4.5 h-4.5" />}
                                defaultExpanded={false}
                            >
                                {testimonialFields.map((item, index) => (
                                    <div key={item.id} className="border border-gray-200 dark:border-white/5 p-4 rounded-lg bg-gray-50 dark:bg-white/[0.02] space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTestimonial(index)}>
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField control={form.control} name={`testimonials.${index}.name`} render={({ field }) => (
                                                <FormItem>
                                                    <FieldGroup label={t('name')}>
                                                        <FormControl><Input {...field} /></FormControl>
                                                    </FieldGroup>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`testimonials.${index}.role`} render={({ field }) => (
                                                <FormItem>
                                                    <FieldGroup label={t('role')}>
                                                        <FormControl><Input {...field} /></FormControl>
                                                    </FieldGroup>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name={`testimonials.${index}.content`} render={({ field }) => (
                                            <FormItem>
                                                <FieldGroup label={t('comment')}>
                                                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                                                </FieldGroup>
                                            </FormItem>
                                        )} />
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="w-full border-dashed border-gray-300 dark:border-white/10" onClick={() => appendTestimonial({ name: '', role: '', content: '' })}>
                                    <Plus className="w-4 h-4 mr-2" /> {t('addTestimonial')}
                                </Button>
                            </ModuleSection>

                            {/* ── 5. FAQ ── */}
                            <ModuleSection
                                title={t('faq')}
                                description={t('faqDesc')}
                                icon={<HelpCircle className="w-4.5 h-4.5" />}
                                defaultExpanded={false}
                            >
                                {faqFields.map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-start border border-gray-200 dark:border-white/5 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                                        <div className="flex-1 space-y-2">
                                            <FormField control={form.control} name={`faq.${index}.question`} render={({ field }) => (
                                                <FormItem><FormControl><Input placeholder={t('question')} {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`faq.${index}.answer`} render={({ field }) => (
                                                <FormItem><FormControl><Textarea placeholder={t('answer')} rows={2} {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(index)}>
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="w-full border-dashed border-gray-300 dark:border-white/10" onClick={() => appendFaq({ question: '', answer: '' })}>
                                    <Plus className="w-4 h-4 mr-2" /> {t('addQuestion')}
                                </Button>
                            </ModuleSection>

                            {/* ── 6. Rodapé ── */}
                            <ModuleSection
                                title={t('footer')}
                                description={t('footerDesc')}
                                icon={<Link2 className="w-4.5 h-4.5" />}
                                defaultExpanded={false}
                            >
                                <FormField control={form.control} name="footerContact" render={({ field }) => (
                                    <FormItem>
                                        <FieldGroup label={t('footerContact')}>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FieldGroup>
                                    </FormItem>
                                )} />

                                <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('footerLinks')}</label>
                                    {linkFields.map((item, index) => (
                                        <div key={item.id} className="flex gap-3 items-center">
                                            <FormField control={form.control} name={`footerLinks.${index}.label`} render={({ field }) => (
                                                <FormItem className="flex-1"><FormControl><Input placeholder={t('linkLabel')} {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`footerLinks.${index}.href`} render={({ field }) => (
                                                <FormItem className="flex-1"><FormControl><Input placeholder={t('linkHref')} {...field} /></FormControl></FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)}>
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" className="w-full border-dashed border-gray-300 dark:border-white/10" onClick={() => appendLink({ label: '', href: '' })}>
                                        <Plus className="w-4 h-4 mr-2" /> {t('addLink')}
                                    </Button>
                                </div>
                            </ModuleSection>

                            {/* ── Tooltips dos planos ── */}
                            <ModuleSection
                                title={t('tooltips')}
                                description={t('tooltipsDesc')}
                                icon={<MessageCircle className="w-4 h-4" />}
                                defaultExpanded={false}
                            >
                                <div className="space-y-4">
                                    {([
                                        'items', 'visionAi', 'houses', 'roomsPerHouse', 'furniturePerRoom',
                                        'photosPerItem', 'collaboratorsPerHouse', 'history', 'ranking',
                                        'importExcel', 'exportData', 'consolidation', 'aiAssistant',
                                    ] as const).map((key) => (
                                        <FormField
                                            key={key}
                                            control={form.control}
                                            name={`featureTooltips.${key}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldGroup label={t(`tooltip_${key}`)}>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                disabled={!canEdit}
                                                                placeholder={t(`tooltip_${key}`)}
                                                            />
                                                        </FormControl>
                                                    </FieldGroup>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </ModuleSection>


                        </div>

                        {/* ═══ Save Button ═══ */}
                        {canEdit && (
                            <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-[#0e0e0e] via-white/95 dark:via-[#0e0e0e]/95 to-transparent pt-6 pb-4 mt-8 -mx-6 px-6">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 text-sm font-semibold px-8 py-2.5">
                                        <Save className="w-4 h-4" />
                                        {isPending ? t('saving') : t('save')}
                                    </Button>
                                    {isTranslating && (
                                        <span className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Translating to {otherLocale.toUpperCase()}...
                                        </span>
                                    )}
                                </div>
                                {Object.keys(translationErrors).length > 0 && (
                                    <div className="mt-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                                        <span className="font-semibold">⚠ Translation issues:</span>
                                        <ul className="mt-1 space-y-0.5 pl-4 list-disc">
                                            {Object.entries(translationErrors).map(([field, error]) => (
                                                <li key={field}><span className="font-medium">{field}</span>: {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </fieldset>
            </Form>

            {/* ── Histórico de Alterações ── */}
            <ChangeHistory
                entries={history}
                booleanFields={['showFeatures', 'showTechnology', 'showPricing', 'showTestimonials', 'showFaq']}
            />
        </>
    );
}
