'use client';

/**
 * @file VersionHistory.tsx
 * @description Painel de histórico de versões para o help-editor.
 * 
 * Mostra todas as versões de um tópico com:
 * - Data, autor, fonte (editor/freshdesk/rollback)
 * - Preview do conteúdo Markdown
 * - Botão de rollback com confirmação
 */

import { useState, useEffect } from 'react';
import {
    Clock, User, RotateCcw, Loader2, ChevronDown, ChevronUp,
    PenLine, ArrowDownCircle, Undo2, AlertTriangle, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MarkdownRenderer } from '@/components/help/MarkdownRenderer';
import { toast } from 'sonner';

interface TopicVersion {
    version: number;
    markdown: string;
    savedAt: string;
    savedBy: string;
    source: 'editor' | 'freshdesk' | 'rollback';
    summary?: string;
}

interface VersionHistoryProps {
    slug: string;
    /** Chamado quando o rollback é executado com sucesso (para atualizar o editor) */
    onRollback?: (markdown: string) => void;
}

const SOURCE_CONFIG = {
    editor: { label: 'Editor', icon: PenLine, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    freshdesk: { label: 'Freshdesk', icon: ArrowDownCircle, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    rollback: { label: 'Rollback', icon: Undo2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

export function VersionHistory({ slug, onRollback }: VersionHistoryProps) {
    const [versions, setVersions] = useState<TopicVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
    const [rollingBack, setRollingBack] = useState<number | null>(null);
    const [confirmVersion, setConfirmVersion] = useState<number | null>(null);

    // Carregar versões
    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setExpandedVersion(null);
        setConfirmVersion(null);

        fetch(`/api/admin/help-topics?versions=${slug}`)
            .then(r => r.json())
            .then(data => {
                setVersions(data.versions || []);
            })
            .catch(() => setVersions([]))
            .finally(() => setLoading(false));
    }, [slug]);

    const handleRollback = async (version: TopicVersion) => {
        setRollingBack(version.version);
        try {
            const res = await fetch('/api/admin/help-topics', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, version: version.version }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Restaurado para versão ${version.version}`);
                onRollback?.(version.markdown);
                // Recarregar versões
                const updated = await fetch(`/api/admin/help-topics?versions=${slug}`);
                const updatedData = await updated.json();
                setVersions(updatedData.versions || []);
                setConfirmVersion(null);
            } else {
                toast.error(data.error || 'Erro no rollback');
            }
        } catch {
            toast.error('Erro de conexão');
        } finally {
            setRollingBack(null);
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
            </div>
        );
    }

    if (versions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Clock className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">Nenhuma versão registrada</p>
                <p className="text-xs text-gray-600 mt-1">
                    As versões aparecerão aqui após a primeira edição
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2" style={{ minHeight: 500, maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">
                    {versions.length} {versions.length === 1 ? 'versão' : 'versões'} registradas
                </p>
            </div>

            {versions.map((v, i) => {
                const isExpanded = expandedVersion === v.version;
                const isConfirming = confirmVersion === v.version;
                const isRollingBack = rollingBack === v.version;
                const sourceConfig = SOURCE_CONFIG[v.source] || SOURCE_CONFIG.editor;
                const SourceIcon = sourceConfig.icon;
                const isLatest = i === 0;

                return (
                    <div
                        key={v.version}
                        className={`rounded-xl border transition-all ${isExpanded
                            ? 'bg-white/[0.04] border-white/15'
                            : 'bg-white/[0.02] border-white/8 hover:bg-white/[0.03]'
                            }`}
                    >
                        {/* Header */}
                        <button
                            onClick={() => setExpandedVersion(isExpanded ? null : v.version)}
                            className="w-full px-4 py-3 flex items-center gap-3 text-left"
                        >
                            {/* Version number */}
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-xs font-bold text-gray-400 shrink-0">
                                v{v.version}
                            </span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${sourceConfig.color}`}>
                                        <SourceIcon className="w-3 h-3" />
                                        {sourceConfig.label}
                                    </span>
                                    {isLatest && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/20">
                                            Atual
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {v.savedBy}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(v.savedAt)}
                                    </span>
                                </div>
                                {v.summary && (
                                    <p className="text-[11px] text-gray-600 mt-0.5 truncate">{v.summary}</p>
                                )}
                            </div>

                            {/* Expand icon */}
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                            )}
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                                {/* Preview */}
                                <div className="mt-3 bg-white/[0.02] border border-white/8 rounded-lg px-4 py-3 max-h-64 overflow-y-auto">
                                    <MarkdownRenderer content={v.markdown} />
                                </div>

                                {/* Actions */}
                                {!isLatest && (
                                    <div className="flex items-center gap-2">
                                        {!isConfirming ? (
                                            <Button
                                                onClick={() => setConfirmVersion(v.version)}
                                                variant="outline"
                                                className="gap-2 text-xs border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Restaurar esta versão
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-[11px] text-amber-400">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    Restaurar versão {v.version}?
                                                </span>
                                                <Button
                                                    onClick={() => handleRollback(v)}
                                                    disabled={isRollingBack}
                                                    className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-500 px-3 py-1.5"
                                                >
                                                    {isRollingBack ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    )}
                                                    Confirmar
                                                </Button>
                                                <Button
                                                    onClick={() => setConfirmVersion(null)}
                                                    variant="outline"
                                                    className="text-xs border-white/10 px-3 py-1.5"
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        )}

                                        <span className="text-[10px] text-gray-600 ml-auto">
                                            {v.markdown.length} caracteres
                                        </span>
                                    </div>
                                )}

                                {isLatest && (
                                    <p className="text-[10px] text-gray-600 italic">
                                        Esta é a versão atual — não é possível fazer rollback para ela mesma
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
