import {
    Package, MapPin, Ruler, Search, FileUp, Camera, History,
    Users, ShieldCheck, UserCog, Trash2, HelpCircle, Lightbulb, Monitor, Tag, Code,
    Terminal, Database, Globe, Rocket, CreditCard, FileCheck, Settings, RefreshCw, BookOpen,
    Scale, Cookie, FileText, AlertTriangle, Shield, Languages,
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
// Configuração central de tópicos
// ─────────────────────────────────────────────────────────────────────────────

export const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'organization',
        emoji: '📦',
        translationKey: 'organization',
        topics: [
            { slug: 'organizing-items', icon: Package, translationKey: 'organizingItems' },
            { slug: 'item-status', icon: Tag, translationKey: 'itemStatus' },
            { slug: 'location-items', icon: MapPin, translationKey: 'locationItems' },
            { slug: 'character-limits', icon: Ruler, translationKey: 'characterLimits' },
        ],
    },
    {
        id: 'features',
        emoji: '🔍',
        translationKey: 'features',
        topics: [
            { slug: 'search-filters', icon: Search, translationKey: 'searchFilters' },
            { slug: 'import-export', icon: FileUp, translationKey: 'importExport' },
            { slug: 'photo-recognition', icon: Camera, translationKey: 'photoRecognition' },
            { slug: 'history', icon: History, translationKey: 'history' },
        ],
    },
    {
        id: 'collaboration',
        emoji: '👥',
        translationKey: 'collaboration',
        topics: [
            { slug: 'sharing', icon: Users, translationKey: 'sharing' },
            { slug: 'access-levels', icon: ShieldCheck, translationKey: 'accessLevels' },
        ],
    },
    {
        id: 'account',
        emoji: '🔒',
        translationKey: 'account',
        topics: [
            { slug: 'manage-account', icon: UserCog, translationKey: 'manageAccount' },
            { slug: 'trash-recovery', icon: Trash2, translationKey: 'trashRecovery' },
        ],
    },
    {
        id: 'general',
        emoji: '📱',
        translationKey: 'general',
        topics: [
            { slug: 'faq', icon: HelpCircle, translationKey: 'faq' },
            { slug: 'tips-shortcuts', icon: Lightbulb, translationKey: 'tipsShortcuts' },
            { slug: 'system-requirements', icon: Monitor, translationKey: 'systemRequirements' },
        ],
    },
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
