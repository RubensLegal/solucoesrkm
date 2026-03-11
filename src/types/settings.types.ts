/**
 * @file settings.types.ts
 * @description Tipos compartilhados para o sistema de configurações (SiteSettings).
 */

/** Representa uma mudança individual em uma configuração. */
export interface SettingsChange {
    /** Seção da config (Ex: "hero", "features", "plus.limits") */
    section: string;
    /** Campo alterado (Ex: "heroTitle", "items") */
    field: string;
    /** Valor anterior */
    oldValue: unknown;
    /** Novo valor */
    newValue: unknown;
}

/** Entrada no histórico de alterações de configurações. */
export interface SettingsHistoryEntry {
    timestamp: string;
    userId: string;
    userName: string;
    changes: SettingsChange[];
}

/** Configuração de visibilidade dos planos de pricing. */
export interface PricingVisibility {
    hiddenPlans: string[];
    hiddenFeatures: Record<string, string[]>;
}

/** Resultado padrão de operações de update em server actions. */
export interface ActionResult {
    success?: boolean;
    error?: string;
    changesCount?: number;
}
