'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';
import { VersionHistory } from '@/components/admin/VersionHistory';
import {
    ArrowLeft, Save, Loader2, RotateCcw,
    PenLine, Eye, BookOpen, Lock, Clock, Undo2, Redo2,
} from 'lucide-react';
import { HELP_CATEGORIES } from '@/lib/help-topics';
import { MarkdownRenderer } from '@/components/help/MarkdownRenderer';

// Labels legíveis para a sidebar do editor (sem depender de i18n)
const CATEGORY_LABELS: Record<string, string> = {
    business: 'Negócios',
    technical: 'Técnico',
};

const TOPIC_LABELS: Record<string, string> = {
    'plans-limits': 'Planos e Limites',
    'payment-security': 'Segurança de Pagamento',
    'subscription-flow': 'Fluxo de Assinatura',
    'admin-subscriptions': 'Gestão de Assinaturas',
    'admin-settings-guide': 'Guia de Configurações',
    'freshdesk-sync': 'Sync Freshdesk',
    'freshdesk-kb': 'Knowledge Base',
    'tech-docs': 'Documentação Técnica',
    'dev-setup': 'Setup Dev',
    'dev-database': 'Banco de Dados',
    'dev-api': 'Referência API',
    'dev-deploy': 'Deploy',
    'auto-translation': 'Tradução Automática',
};

interface TopicOverride {
    markdown: string;
    updatedAt?: string;
    updatedBy?: string;
}

export default function HelpEditorPage() {
    const [overrides, setOverrides] = useState<Record<string, TopicOverride>>({});
    const [loading, setLoading] = useState(true);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [editMarkdown, setEditMarkdown] = useState('');
    const [baseMarkdown, setBaseMarkdown] = useState('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'history'>('edit');
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);

    // ── Auth guard: verifica role do usuário ──
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                const role = data.user?.role || 'VIEWER';
                setUserRole(role);
                if (role === 'SUPERADMIN' || role === 'ADMIN') {
                    // Só carrega overrides se tem permissão
                    return fetch('/api/admin/help-topics')
                        .then(r => r.json())
                        .then(d => { setOverrides(d.overrides || {}); setLoading(false); });
                }
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, []);

    const handleSelectTopic = async (slug: string) => {
        setSelectedSlug(slug);
        setPreviewMode('edit');
        setBaseMarkdown('');
        setUndoStack([]);
        setRedoStack([]);

        // Se tem override, usar o markdown do override
        if (overrides[slug]?.markdown) {
            setEditMarkdown(overrides[slug].markdown);
            return;
        }

        // Sem override → carregar conteúdo base (JSON→Markdown) da API
        setLoadingContent(true);
        setEditMarkdown('');
        try {
            const res = await fetch(`/api/admin/help-topics?base=${slug}`);
            const data = await res.json();
            if (data.markdown) {
                setEditMarkdown(data.markdown);
                setBaseMarkdown(data.markdown);
            }
        } catch { /* fallback: editor vazio */ }
        setLoadingContent(false);
    };

    /** Atualizar markdown com undo stack */
    const updateMarkdown = (newValue: string) => {
        setUndoStack(prev => [...prev.slice(-49), editMarkdown]);
        setRedoStack([]);
        setEditMarkdown(newValue);
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        setRedoStack(r => [...r, editMarkdown]);
        setUndoStack(u => u.slice(0, -1));
        setEditMarkdown(prev);
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setUndoStack(u => [...u, editMarkdown]);
        setRedoStack(r => r.slice(0, -1));
        setEditMarkdown(next);
    };

    const handleSave = async () => {
        if (!selectedSlug) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/help-topics', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: selectedSlug, markdown: editMarkdown }),
            });
            const data = await res.json();
            if (data.success) {
                setOverrides(prev => ({
                    ...prev,
                    [selectedSlug]: { markdown: editMarkdown, updatedAt: new Date().toISOString() },
                }));
                toast.success('Salvo com sucesso!');
            } else {
                toast.error(data.error || 'Erro ao salvar');
            }
        } catch {
            toast.error('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!selectedSlug || !confirm('Restaurar ao conteúdo padrão? O Markdown personalizado será removido.')) return;
        try {
            const res = await fetch('/api/admin/help-topics', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: selectedSlug }),
            });
            const data = await res.json();
            if (data.success) {
                setOverrides(prev => {
                    const next = { ...prev };
                    delete next[selectedSlug];
                    return next;
                });
                // Recarregar conteúdo base do JSON
                try {
                    const baseRes = await fetch(`/api/admin/help-topics?base=${selectedSlug}`);
                    const baseData = await baseRes.json();
                    if (baseData.markdown) {
                        setEditMarkdown(baseData.markdown);
                        setBaseMarkdown(baseData.markdown);
                    } else {
                        setEditMarkdown('');
                        setBaseMarkdown('');
                    }
                } catch {
                    setEditMarkdown('');
                    setBaseMarkdown('');
                }
                setUndoStack([]);
                setRedoStack([]);
                toast.success('Restaurado ao padrão');
            }
        } catch {
            toast.error('Erro ao restaurar');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            </div>
        );
    }

    // ── Acesso negado para roles sem permissão ──
    if (userRole !== 'SUPERADMIN' && userRole !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="text-center space-y-3">
                    <Lock className="w-10 h-10 mx-auto text-amber-500/60" />
                    <h1 className="text-lg font-bold">Acesso Negado</h1>
                    <p className="text-sm text-gray-500">Apenas SUPERADMIN e ADMIN podem editar o help.</p>
                    <Link href="/admin/settings" className="text-xs text-teal-400 hover:underline">
                        ← Voltar às configurações
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
                <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/settings" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <BookOpen className="w-5 h-5 text-teal-400" />
                        <h1 className="text-lg font-bold">Editor de Help</h1>
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">Markdown</span>
                    </div>
                </div>
            </header>

            <div className="max-w-[1800px] mx-auto px-6 py-6 flex gap-6" style={{ minHeight: 'calc(100vh - 56px)' }}>
                {/* Sidebar — Lista de tópicos */}
                <div className="w-72 shrink-0 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 104px)' }}>
                    {HELP_CATEGORIES.map(cat => (
                        <div key={cat.id}>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {cat.emoji} {CATEGORY_LABELS[cat.translationKey] || cat.translationKey}
                            </h3>
                            <div className="space-y-1">
                                {cat.topics.map(topic => {
                                    const hasOverride = !!overrides[topic.slug];
                                    const isSelected = selectedSlug === topic.slug;
                                    const Icon = topic.icon;
                                    return (
                                        <button
                                            key={topic.slug}
                                            onClick={() => handleSelectTopic(topic.slug)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${isSelected
                                                ? 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/30'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                }`}
                                        >
                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{TOPIC_LABELS[topic.slug] || topic.slug}</span>
                                            {topic.superadminOnly && <Lock className="w-3 h-3 text-amber-500/60 shrink-0" />}
                                            {hasOverride && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" title="Editado" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor */}
                <div className="flex-1 space-y-4">
                    {!selectedSlug ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center space-y-2">
                                <PenLine className="w-8 h-8 mx-auto opacity-40" />
                                <p className="text-sm">Selecione um tópico para editar</p>
                                <p className="text-xs text-gray-600">Escreva todo o conteúdo em Markdown</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Toggle Editor / Preview / Histórico */}
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <button
                                    onClick={() => setPreviewMode('edit')}
                                    className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold transition-colors ${previewMode === 'edit' ? 'bg-teal-500/15 text-teal-300' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <PenLine className="w-3.5 h-3.5 inline mr-1" /> Editar
                                </button>
                                <button
                                    onClick={() => setPreviewMode('preview')}
                                    className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold transition-colors ${previewMode === 'preview' ? 'bg-teal-500/15 text-teal-300' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
                                </button>
                                <button
                                    onClick={() => setPreviewMode('history')}
                                    className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold transition-colors ${previewMode === 'history' ? 'bg-amber-500/15 text-amber-300' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <Clock className="w-3.5 h-3.5 inline mr-1" /> Histórico
                                </button>

                                {overrides[selectedSlug] && (
                                    <span className="ml-auto text-[10px] text-gray-600">
                                        Editado por {overrides[selectedSlug].updatedBy} em{' '}
                                        {overrides[selectedSlug].updatedAt
                                            ? new Date(overrides[selectedSlug].updatedAt!).toLocaleDateString('pt-BR')
                                            : '—'}
                                    </span>
                                )}

                                {/* Indicador de fonte */}
                                {!overrides[selectedSlug] && baseMarkdown && (
                                    <span className="ml-auto text-[10px] text-amber-400/60 bg-amber-500/10 px-2 py-0.5 rounded">
                                        📄 Conteúdo base (JSON)
                                    </span>
                                )}
                            </div>

                            {/* Textarea / Preview / Histórico */}
                            {previewMode === 'history' ? (
                                <VersionHistory
                                    slug={selectedSlug}
                                    onRollback={(markdown) => {
                                        setEditMarkdown(markdown);
                                        setPreviewMode('edit');
                                    }}
                                />
                            ) : loadingContent ? (
                                <div className="flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-lg" style={{ minHeight: 500 }}>
                                    <div className="text-center space-y-2 text-gray-500">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        <p className="text-xs">Carregando conteúdo...</p>
                                    </div>
                                </div>
                            ) : previewMode === 'edit' ? (
                                <textarea
                                    value={editMarkdown}
                                    onChange={e => updateMarkdown(e.target.value)}
                                    onKeyDown={e => {
                                        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                                            e.preventDefault();
                                            if (e.shiftKey) handleRedo(); else handleUndo();
                                        }
                                        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                                            e.preventDefault();
                                            handleRedo();
                                        }
                                    }}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 font-mono leading-relaxed placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-y"
                                    style={{ minHeight: 500 }}
                                    placeholder={'# Título do artigo\n\nTexto introdutório aqui...\n\n## Seção\n\nConteúdo da seção...\n\n- Item 1\n- Item 2\n\n> 💡 Dica: escreva todo o conteúdo em Markdown!'}
                                />
                            ) : editMarkdown.trim() ? (
                                <div
                                    className="bg-white/[0.03] border border-white/10 rounded-lg px-6 py-4"
                                    style={{ minHeight: 500 }}
                                >
                                    <MarkdownRenderer content={editMarkdown} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-lg" style={{ minHeight: 500 }}>
                                    <div className="text-center space-y-2 text-gray-500">
                                        <Eye className="w-6 h-6 mx-auto opacity-40" />
                                        <p className="text-sm">Nenhum conteúdo para pré-visualizar</p>
                                        <p className="text-xs">Escreva algo na aba Editar primeiro</p>
                                    </div>
                                </div>
                            )}

                            {/* Ações */}
                            {(() => {
                                const originalMarkdown = overrides[selectedSlug]?.markdown || baseMarkdown;
                                const hasChanges = editMarkdown !== originalMarkdown;
                                const hasOverride = !!overrides[selectedSlug];
                                return (
                                    <div className="flex items-center gap-3 pt-2">
                                        {/* Undo / Redo */}
                                        <div className="flex items-center gap-1 mr-1">
                                            <button
                                                type="button"
                                                onClick={handleUndo}
                                                disabled={undoStack.length === 0}
                                                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                                title="Desfazer (Ctrl+Z)"
                                            >
                                                <Undo2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRedo}
                                                disabled={redoStack.length === 0}
                                                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                                title="Refazer (Ctrl+Shift+Z)"
                                            >
                                                <Redo2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <Button
                                            onClick={handleSave}
                                            disabled={saving || !editMarkdown.trim() || !hasChanges}
                                            className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-sm font-semibold px-6 py-2.5 disabled:opacity-40"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {saving ? 'Salvando...' : 'Salvar'}
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            disabled={!hasOverride}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> Restaurar padrão
                                        </button>
                                        <span className="text-[10px] text-gray-600 ml-auto">
                                            {hasChanges
                                                ? `✏️ ${editMarkdown.length} caracteres (modificado)`
                                                : editMarkdown.length > 0
                                                    ? `${editMarkdown.length} caracteres`
                                                    : 'Vazio — usará conteúdo padrão'}
                                        </span>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
