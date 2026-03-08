/**
 * @file [slug]/page.tsx
 * @description Renderiza tópicos individuais do help corporativo.
 *
 * Arquitetura:
 *   1. Cada tópico tem um componente React (PlansLimits, TechDocs, etc.)
 *   2. O componente recebe `t()` — função de tradução scoped ao tópico
 *   3. O mapa TOPIC_COMPONENTS liga slug → componente
 *   4. HelpContentWithOverride verifica se há markdown customizado no banco;
 *      se houver, renderiza o markdown; senão, renderiza o componente padrão.
 *
 * Para adicionar um novo tópico:
 *   1. Crie a função do componente abaixo
 *   2. Adicione ao TOPIC_COMPONENTS
 *   3. Adicione o slug em lib/help-topics.ts
 *   4. Adicione as traduções em messages/pt.json e en.json
 */
'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { findTopicBySlug } from '@/lib/help-topics';
import { ArrowLeft } from 'lucide-react';

// Componentes reutilizáveis do help (compartilhados com Tracka)
import { HelpSection } from '@/components/help/HelpSection';
import { TipBox } from '@/components/help/TipBox';
import { StepList } from '@/components/help/StepList';
import { InfoTable } from '@/components/help/InfoTable';
import { MarkdownRenderer } from '@/components/help/MarkdownRenderer';

// ─────────────────────────────────────────────────────────────────────────────
// Business topic components — visíveis para usuários e admins
// ─────────────────────────────────────────────────────────────────────────────

/** Planos e Limites — comparação Trial/Free/Plus/Pro com regras de cancelamento. */
function PlansLimits({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('types.title')}>
                <div className="flex flex-col gap-2">
                    {['trial', 'free', 'plus', 'pro'].map((plan) => (
                        <div key={plan} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-lg">{t(`types.${plan}.icon`)}</span>
                            <div>
                                <span className="text-sm font-semibold text-foreground">{t(`types.${plan}.name`)}</span>
                                <span className="text-xs text-muted-foreground ml-2">— {t(`types.${plan}.desc`)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('snapshot.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('snapshot.desc')}</p>
                <StepList steps={[t('snapshot.step1'), t('snapshot.step2'), t('snapshot.step3')]} />
            </HelpSection>
            <HelpSection title={t('cancellation.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('cancellation.desc')}</p>
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Segurança de Pagamento — Stripe PCI-DSS, Google Play, proteção de dados LGPD. */
function PaymentSecurity({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('processor.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('processor.desc')}</p>
                <div className="flex flex-col gap-2 mt-2">
                    {['pciDss', 'noStorage', 'encryption', 'sca'].map((item) => (
                        <div key={item} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-lg">{t(`processor.${item}.icon`)}</span>
                            <div>
                                <span className="text-sm font-semibold text-foreground">{t(`processor.${item}.name`)}</span>
                                <span className="text-xs text-muted-foreground ml-2">— {t(`processor.${item}.desc`)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('googlePlay.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('googlePlay.desc')}</p>
                <div className="flex flex-col gap-2 mt-2">
                    {['alternative', 'global', 'transparent'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`googlePlay.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`googlePlay.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('dataProtection.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('dataProtection.desc')}</p>
                <div className="flex flex-col gap-2 mt-2">
                    {['lgpd', 'minimal', 'noSharing'].map((item) => (
                        <div key={item} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-lg">{t(`dataProtection.${item}.icon`)}</span>
                            <div>
                                <span className="text-sm font-semibold text-foreground">{t(`dataProtection.${item}.name`)}</span>
                                <span className="text-xs text-muted-foreground ml-2">— {t(`dataProtection.${item}.desc`)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('transparency.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('transparency.desc')}</p>
                <StepList steps={[t('transparency.point1'), t('transparency.point2'), t('transparency.point3'), t('transparency.point4')]} />
            </HelpSection>
            <TipBox variant="info">{t('info')}</TipBox>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Fluxo de Assinatura — passos desde a escolha do plano até aceite dos termos. */
function SubscriptionFlow({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('flow.title')}>
                <StepList steps={[t('flow.step1'), t('flow.step2'), t('flow.step3'), t('flow.step4'), t('flow.step5'), t('flow.step6')]} />
            </HelpSection>
            <HelpSection title={t('termsAcceptance.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('termsAcceptance.desc')}</p>
                <div className="flex flex-col gap-2 mt-2">
                    {['version', 'timestamp', 'ip', 'planSnapshot'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`termsAcceptance.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`termsAcceptance.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('snapshot.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('snapshot.desc')}</p>
            </HelpSection>
            <HelpSection title={t('legal.title')}>
                <div className="flex flex-col gap-2">
                    {['lgpd', 'cdc', 'marco'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`legal.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`legal.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
        </div>
    );
}

/** Gestão de Assinaturas (SUPERADMIN) — acesso, detalhes Stripe, filtros. */
function AdminSubscriptions({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('access.title')}>
                <StepList steps={[t('access.step1'), t('access.step2'), t('access.step3')]} />
            </HelpSection>
            <HelpSection title={t('details.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('details.desc')}</p>
                <div className="flex flex-col gap-2 mt-2">
                    {['terms', 'stripe', 'history', 'snapshot'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`details.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`details.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('filters.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('filters.desc')}</p>
            </HelpSection>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Guia de Configurações Admin — seções do painel, permissões por role. */
function AdminSettingsGuide({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('adminSettings.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{t('adminSettings.desc')}</p>
                <InfoTable rows={[
                    { label: '🌐 Landing Page', value: t('adminSettings.landing') },
                    { label: '🔑 API Keys', value: t('adminSettings.apiKeys') },
                    { label: '💬 Freshdesk', value: t('adminSettings.freshdesk') },
                    { label: '👑 Planos e Limites', value: t('adminSettings.plans') },
                    { label: '👥 Equipe', value: t('adminSettings.team') },
                ]} />
            </HelpSection>
            <HelpSection title={t('permissions.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{t('permissions.desc')}</p>
                <InfoTable rows={[
                    { label: '👑 SUPERADMIN', value: t('permissions.superadmin') },
                    { label: '🔴 ADMIN', value: t('permissions.admin') },
                    { label: '🔵 EDITOR', value: t('permissions.editor') },
                    { label: '⚪ VIEWER', value: t('permissions.viewer') },
                ]} />
            </HelpSection>
            <HelpSection title={t('dashboardSettings.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{t('dashboardSettings.desc')}</p>
                <InfoTable rows={[
                    { label: '👤 Perfil', value: t('dashboardSettings.profile') },
                    { label: '🎨 Tema', value: t('dashboardSettings.theme') },
                    { label: '🌍 Idioma', value: t('dashboardSettings.language') },
                    { label: '♿ Acessibilidade', value: t('dashboardSettings.accessibility') },
                    { label: '📋 Plano Atual', value: t('dashboardSettings.plan') },
                ]} />
            </HelpSection>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Sincronização Freshdesk — como o sync Help→KB funciona, visibilidade. */
function FreshdeskSync({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('howItWorks.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('howItWorks.desc')}</p>
                <StepList steps={[t('howItWorks.step1'), t('howItWorks.step2'), t('howItWorks.step3'), t('howItWorks.step4')]} />
            </HelpSection>
            <HelpSection title={t('visibility.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('visibility.desc')}</p>
                <InfoTable rows={[
                    { label: '🌐 All Users', value: t('visibility.public') },
                    { label: '🔒 Agents Only', value: t('visibility.agents') },
                ]} />
            </HelpSection>
            <HelpSection title={t('mapping.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('mapping.desc')}</p>
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Knowledge Base Freshdesk — módulos (widget, tickets, KB, chat), config. */
function FreshdeskKb({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('modules.title')}>
                <div className="flex flex-col gap-2">
                    {['widget', 'tickets', 'kb', 'chat'].map((mod) => (
                        <div key={mod} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-lg">{t(`modules.${mod}.icon`)}</span>
                            <div>
                                <span className="text-sm font-semibold text-foreground">{t(`modules.${mod}.name`)}</span>
                                <span className="text-xs text-muted-foreground ml-2">— {t(`modules.${mod}.desc`)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('config.title')}>
                <StepList steps={[t('config.step1'), t('config.step2'), t('config.step3'), t('config.step4')]} />
            </HelpSection>
            <HelpSection title={t('auth.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('auth.desc')}</p>
            </HelpSection>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Technical topic components
// ─────────────────────────────────────────────────────────────────────────────

/** Documentação Técnica — arquitetura, segurança, roles, variáveis de ambiente. */
function TechDocs({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('architecture.title')}>
                <div className="flex flex-col gap-2">
                    {['stack', 'database', 'auth', 'storage', 'email'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`architecture.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`architecture.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('security.title')}>
                <div className="flex flex-col gap-2">
                    {['passwords', 'jwt', 'encryption', 'transport'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`security.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`security.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('roles.title')}>
                <InfoTable rows={[
                    { label: `🔑 ${t('roles.superadmin.name')}`, value: t('roles.superadmin.desc') },
                    { label: `👑 ${t('roles.admin.name')}`, value: t('roles.admin.desc') },
                    { label: `✏️ ${t('roles.editor.name')}`, value: t('roles.editor.desc') },
                    { label: `👁️ ${t('roles.viewer.name')}`, value: t('roles.viewer.desc') },
                    { label: `💼 ${t('roles.employee.name')}`, value: t('roles.employee.desc') },
                ]} />
            </HelpSection>
            <HelpSection title={t('envVars.title')}>
                <div className="flex flex-col gap-2">
                    {['database', 'auth', 'encryption', 'email', 'cloudinary', 'vision', 'stripe'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`envVars.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`envVars.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
        </div>
    );
}

/** Setup de Desenvolvimento — pré-requisitos, instalação, .env, comandos. */
function DevSetup({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('prerequisites.title')}>
                <div className="flex flex-col gap-2">
                    {['node', 'git', 'editor'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`prerequisites.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`prerequisites.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('steps.title')}>
                <StepList steps={[t('steps.step1'), t('steps.step2'), t('steps.step3'), t('steps.step4'), t('steps.step5')]} />
            </HelpSection>
            <HelpSection title={t('envVars.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{t('envVars.desc')}</p>
                <div className="flex flex-col gap-2">
                    {['database', 'auth', 'encryption', 'email', 'cloudinary', 'google', 'stripe'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground font-mono">{t(`envVars.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`envVars.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('commands.title')}>
                <div className="flex flex-col gap-2">
                    {['dev', 'build', 'lint', 'prisma'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground font-mono">{t(`commands.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`commands.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Banco de Dados — schema Prisma, Turso/SQLite, scripts de manutenção. */
function DevDatabase({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('schema.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{t('schema.desc')}</p>
                <div className="flex flex-col gap-2">
                    {['user', 'employee', 'house', 'houseMember', 'room', 'furniture', 'item', 'history', 'siteSettings'].map((model) => (
                        <div key={model} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground font-mono">{t(`schema.${model}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`schema.${model}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('turso.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('turso.desc')}</p>
                <StepList steps={[t('turso.step1'), t('turso.step2'), t('turso.step3')]} />
            </HelpSection>
            <HelpSection title={t('scripts.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{t('scripts.desc')}</p>
                <div className="flex flex-col gap-2">
                    {['promote', 'migration', 'backfill', 'stripe'].map((script) => (
                        <div key={script} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground font-mono">{t(`scripts.${script}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`scripts.${script}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
        </div>
    );
}

/** Referência da API — endpoints agrupados: auth, houses, items, admin, integrações. */
function DevApi({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            {['auth', 'houses', 'items', 'admin', 'integrations'].map((group) => (
                <HelpSection key={group} title={t(`${group}.title`)}>
                    <div className="flex flex-col gap-2">
                        {(() => {
                            const routeKeys: Record<string, string[]> = {
                                auth: ['login', 'register', 'me', 'logout', 'google', 'forgot', 'reset', 'verify', 'confirmDelete'],
                                houses: ['list', 'create', 'update', 'delete', 'rooms', 'furniture', 'members'],
                                items: ['list', 'create', 'update', 'delete', 'move', 'history'],
                                admin: ['landing', 'landingPut', 'apiKeys', 'apiKeysPut', 'users'],
                                integrations: ['stripe', 'webhook', 'vision', 'export', 'import', 'address', 'storage'],
                            };
                            return (routeKeys[group] || []).map((route) => (
                                <div key={route} className="px-4 py-2.5 rounded-xl bg-accent/50">
                                    <span className="text-sm font-semibold text-foreground font-mono">{t(`${group}.${route}.method`)}</span>
                                    <span className="text-xs text-muted-foreground ml-2">— {t(`${group}.${route}.desc`)}</span>
                                </div>
                            ));
                        })()}
                    </div>
                </HelpSection>
            ))}
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

/** Deploy em Produção — Vercel, env vars prod, Stripe webhooks, checklist. */
function DevDeploy({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('vercel.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('vercel.desc')}</p>
                <StepList steps={[t('vercel.step1'), t('vercel.step2'), t('vercel.step3'), t('vercel.step4')]} />
            </HelpSection>
            <HelpSection title={t('envProd.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{t('envProd.desc')}</p>
                <div className="flex flex-col gap-2">
                    {['database', 'auth', 'stripe', 'email', 'cloudinary', 'domain'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`envProd.${item}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`envProd.${item}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('stripe.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('stripe.desc')}</p>
                <StepList steps={[t('stripe.step1'), t('stripe.step2'), t('stripe.step3')]} />
            </HelpSection>
            <HelpSection title={t('checklist.title')}>
                <StepList steps={[t('checklist.step1'), t('checklist.step2'), t('checklist.step3'), t('checklist.step4'), t('checklist.step5')]} />
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
        </div>
    );
}

/** Tradução Automática — como funciona, endpoints, notas técnicas, erros. */
function AutoTranslation({ t }: { t: (key: string) => string }) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('intro')}</p>
            <HelpSection title={t('howItWorks.title')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('howItWorks.desc')}</p>
                <StepList steps={[t('howItWorks.step1'), t('howItWorks.step2'), t('howItWorks.step3')]} />
            </HelpSection>
            <HelpSection title={t('notes.title')}>
                <div className="flex flex-col gap-2">
                    {['locale', 'trigger', 'idempotent'].map((note) => (
                        <div key={note} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground">{t(`notes.${note}.name`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`notes.${note}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('errors.title')}>
                <InfoTable rows={[
                    { label: `✅ ${t('errors.success.name')}`, value: t('errors.success.desc') },
                    { label: `⚠️ ${t('errors.warning.name')}`, value: t('errors.warning.desc') },
                    { label: `❌ ${t('errors.error.name')}`, value: t('errors.error.desc') },
                ]} />
            </HelpSection>
            <HelpSection title={t('api.title')}>
                <div className="flex flex-col gap-2">
                    {['migrateAll', 'translateFields'].map((ep) => (
                        <div key={ep} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm font-semibold text-foreground font-mono">{t(`api.${ep}.method`)}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {t(`api.${ep}.desc`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <HelpSection title={t('technical.title')}>
                <div className="flex flex-col gap-2">
                    {['service', 'dbPt', 'dbEn', 'fields', 'concurrency'].map((item) => (
                        <div key={item} className="px-4 py-2.5 rounded-xl bg-accent/50">
                            <span className="text-sm text-muted-foreground">{t(`technical.${item}`)}</span>
                        </div>
                    ))}
                </div>
            </HelpSection>
            <TipBox variant="warning">{t('warning')}</TipBox>
            <TipBox>{t('tip')}</TipBox>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de componentes por slug — APENAS CORPORATIVO
// ─────────────────────────────────────────────────────────────────────────────

const TOPIC_COMPONENTS: Record<string, React.FC<{ t: (key: string) => string }>> = {
    'plans-limits': PlansLimits,
    'payment-security': PaymentSecurity,
    'subscription-flow': SubscriptionFlow,
    'admin-subscriptions': AdminSubscriptions,
    'admin-settings-guide': AdminSettingsGuide,
    'freshdesk-sync': FreshdeskSync,
    'freshdesk-kb': FreshdeskKb,
    'tech-docs': TechDocs,
    'dev-setup': DevSetup,
    'dev-database': DevDatabase,
    'dev-api': DevApi,
    'dev-deploy': DevDeploy,
    'auto-translation': AutoTranslation,
};

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Componente que verifica overrides no banco antes de renderizar.
 * Se o admin salvou markdown customizado via help-editor, renderiza ele.
 * Senão, renderiza o componente React padrão do tópico.
 */
function HelpContentWithOverride({ slug, TopicContent, tTopic, comingSoon }: {
    slug: string;
    TopicContent?: React.FC<{ t: (key: string) => string }>;
    tTopic: (key: string) => string;
    comingSoon: string;
}) {
    const [override, setOverride] = useState<{ markdown: string } | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        fetch('/api/admin/help-topics')
            .then(r => r.json())
            .then(data => {
                const o = data.overrides?.[slug];
                if (o?.markdown) setOverride(o);
                setChecked(true);
            })
            .catch(() => setChecked(true));
    }, [slug]);

    if (!checked) return null;

    if (override?.markdown) {
        return <MarkdownRenderer content={override.markdown} />;
    }

    if (TopicContent) {
        return <TopicContent t={tTopic} />;
    }

    return <p className="text-sm text-muted-foreground">{comingSoon}</p>;
}

export default function HelpTopicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const t = useTranslations('help');

    const result = findTopicBySlug(slug);
    if (!result) notFound();

    const { topic, category } = result;
    const Icon = topic.icon;
    const TopicContent = TOPIC_COMPONENTS[slug];

    const tTopic = (key: string) => t(`topics.${topic.translationKey}.content.${key}`);

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-black/10 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
                    <Link href="/help" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-5 h-5 text-teal-500 shrink-0" />
                        <h1 className="text-lg font-bold text-foreground truncate">
                            {t(`topics.${topic.translationKey}.title`)}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
                <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Link href="/help" className="hover:text-foreground transition-colors">{t('title')}</Link>
                    <span>›</span>
                    <span>{category.emoji} {t(`categories.${category.translationKey}`)}</span>
                    <span>›</span>
                    <span className="text-foreground font-medium truncate">{t(`topics.${topic.translationKey}.title`)}</span>
                </nav>
            </div>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
                <HelpContentWithOverride
                    slug={slug}
                    TopicContent={TopicContent}
                    tTopic={tTopic}
                    comingSoon={t('comingSoon')}
                />
            </main>
        </div>
    );
}
