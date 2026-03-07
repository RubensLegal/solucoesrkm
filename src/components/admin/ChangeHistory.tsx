'use client';

import { useState } from 'react';
import { History, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { SettingsHistoryEntry } from '@/actions/site-settings.actions';

// ─────────────────────────────────────────────────────────────────────────────
// Componente colapsável de histórico de alterações — reutilizável por todas as
// seções do admin (planos, landing, freshdesk, api keys).
// ─────────────────────────────────────────────────────────────────────────────

interface ChangeHistoryProps {
    entries: SettingsHistoryEntry[];
    /** Emojis por seção. Ex: { free: '🆓', plus: '⭐' } */
    sectionEmojis?: Record<string, string>;
    /** Campos que devem ter o valor formatado como boolean */
    booleanFields?: string[];
}

export function ChangeHistory({ entries, sectionEmojis = {}, booleanFields = [] }: ChangeHistoryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const lowerFilter = filter.toLowerCase();
    const filtered = filter
        ? entries.filter((entry) =>
            entry.userName.toLowerCase().includes(lowerFilter) ||
            entry.changes.some(c =>
                c.section.toLowerCase().includes(lowerFilter) ||
                c.field.toLowerCase().includes(lowerFilter) ||
                String(c.oldValue).toLowerCase().includes(lowerFilter) ||
                String(c.newValue).toLowerCase().includes(lowerFilter)
            )
        )
        : entries;

    const toggleExpand = (idx: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatValue = (val: any, field: string): string => {
        if (val === undefined || val === null) return '—';
        if (typeof val === 'boolean' || booleanFields.includes(field)) {
            return val === true || val === 'true' ? '✅' : '❌';
        }
        const str = String(val);
        // Truncar valores muito longos
        return str.length > 60 ? str.substring(0, 57) + '...' : str;
    };

    return (
        <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
            {/* Header colapsável */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1a1a] hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold">Histórico de Alterações</span>
                    {entries.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20">
                            {entries.length}
                        </span>
                    )}
                </div>
                <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Conteúdo colapsável */}
            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-white/10">
                    {entries.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">
                            Nenhuma alteração registrada. O histórico aparecerá após a primeira atualização.
                        </p>
                    ) : (
                        <>
                            {/* Filtro */}
                            <div className="relative w-full sm:w-64 mb-3">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                <Input
                                    placeholder="Filtrar por seção, campo ou usuário..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="pl-8 h-8 text-xs"
                                />
                            </div>

                            {filtered.length === 0 && (
                                <p className="text-xs text-gray-500 text-center py-4">
                                    Nenhum resultado para o filtro.
                                </p>
                            )}

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                {filtered.map((entry, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-white/10 rounded-lg bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(idx)}
                                            className="w-full text-left px-3 py-2 flex items-center justify-between gap-2"
                                        >
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-500">{formatDate(entry.timestamp)}</span>
                                                <span className="font-medium">{entry.userName}</span>
                                                <span className="text-gray-500">
                                                    — {entry.changes.length} {entry.changes.length === 1 ? 'alteração' : 'alterações'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {expanded.has(idx) ? '▲' : '▼'}
                                            </span>
                                        </button>

                                        {expanded.has(idx) && (
                                            <div className="px-3 pb-2">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="text-gray-500 border-b border-white/10">
                                                            <th className="text-left py-1 font-medium">Seção</th>
                                                            <th className="text-left py-1 font-medium">Campo</th>
                                                            <th className="text-center py-1 font-medium">Antes</th>
                                                            <th className="text-center py-1 font-medium">Depois</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.changes.map((change, ci) => (
                                                            <tr key={ci} className="border-b border-white/5 last:border-0">
                                                                <td className="py-1">
                                                                    {sectionEmojis[change.section] || ''} {change.section}
                                                                </td>
                                                                <td className="py-1 text-gray-500">
                                                                    {change.field.replace('limits.', '')}
                                                                </td>
                                                                <td className="py-1 text-center text-red-400 max-w-[120px] truncate">
                                                                    {formatValue(change.oldValue, change.field)}
                                                                </td>
                                                                <td className="py-1 text-center text-green-400 max-w-[120px] truncate">
                                                                    {formatValue(change.newValue, change.field)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
