import {
    CreditCard, Shield, FileCheck, ShieldCheck, Settings, RefreshCw, BookOpen,
    Code, Terminal, Database, Globe, Rocket, Languages, BarChart3,
    type LucideIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface HelpTopic {
    slug: string;
    icon: LucideIcon;
    /** Chave de tradução dentro de `help.topics.<slug>` */
    translationKey: string;
    /** Se true, apenas SUPERADMIN pode ver este tópico */
    superadminOnly?: boolean;
}

export interface HelpCategory {
    id: string;
    emoji: string;
    /** Chave de tradução dentro de `help.categories.<id>` */
    translationKey: string;
    topics: HelpTopic[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuração central de tópicos — APENAS CORPORATIVO
// Tópicos do Tracka ficam no workspace do Tracka.
// ─────────────────────────────────────────────────────────────────────────────

export const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'business',
        emoji: '💰',
        translationKey: 'business',
        topics: [
            { slug: 'plans-limits', icon: CreditCard, translationKey: 'plansLimits' },
            { slug: 'payment-security', icon: Shield, translationKey: 'paymentSecurity' },
            { slug: 'subscription-flow', icon: FileCheck, translationKey: 'subscriptionFlow', superadminOnly: true },
            { slug: 'admin-subscriptions', icon: ShieldCheck, translationKey: 'adminSubscriptions', superadminOnly: true },
            { slug: 'admin-settings-guide', icon: Settings, translationKey: 'adminSettingsGuide', superadminOnly: true },
            { slug: 'freshdesk-sync', icon: RefreshCw, translationKey: 'freshdeskSync', superadminOnly: true },
            { slug: 'freshdesk-kb', icon: BookOpen, translationKey: 'freshdeskKb', superadminOnly: true },
        ],
    },
    {
        id: 'technical',
        emoji: '🔧',
        translationKey: 'technical',
        topics: [
            { slug: 'tech-docs', icon: Code, translationKey: 'techDocs', superadminOnly: true },
            { slug: 'dev-setup', icon: Terminal, translationKey: 'devSetup', superadminOnly: true },
            { slug: 'dev-database', icon: Database, translationKey: 'devDatabase', superadminOnly: true },
            { slug: 'dev-api', icon: Globe, translationKey: 'devApi', superadminOnly: true },
            { slug: 'dev-deploy', icon: Rocket, translationKey: 'devDeploy', superadminOnly: true },
            { slug: 'auto-translation', icon: Languages, translationKey: 'autoTranslation', superadminOnly: true },
            { slug: 'pricing-flow', icon: BarChart3, translationKey: 'pricingFlow', superadminOnly: true },
        ],
    },
];

/** Busca um tópico pelo slug */
export function findTopicBySlug(slug: string): { topic: HelpTopic; category: HelpCategory } | null {
    for (const category of HELP_CATEGORIES) {
        const topic = category.topics.find(t => t.slug === slug);
        if (topic) return { topic, category };
    }
    return null;
}

/** Retorna todos os slugs disponíveis */
export function getAllTopicSlugs(): string[] {
    return HELP_CATEGORIES.flatMap(c => c.topics.map(t => t.slug));
}
