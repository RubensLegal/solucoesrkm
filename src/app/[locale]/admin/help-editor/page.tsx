'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';
import { VersionHistory } from '@/components/admin/VersionHistory';
import {
    ArrowLeft, Save, Loader2, RotateCcw,
    PenLine, Eye, BookOpen, Lock, Clock,
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
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'history'>('edit');
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

    const handleSelectTopic = (slug: string) => {
        setSelectedSlug(slug);
        setEditMarkdown(overrides[slug]?.markdown || '');
        setPreviewMode('edit');
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
                setEditMarkdown('');
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
                            {/* Toggle Editor / Preview */}
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
                            </div>

                            {/* Textarea / Preview */}
                            {previewMode === 'history' ? (
                                <VersionHistory
                                    slug={selectedSlug}
                                    onRollback={(markdown) => {
                                        setEditMarkdown(markdown);
                                        setPreviewMode('edit');
                                    }}
                                />
                            ) : previewMode === 'edit' ? (
                                <textarea
                                    value={editMarkdown}
                                    onChange={e => setEditMarkdown(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 font-mono leading-relaxed placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-y"
                                    style={{ minHeight: 500 }}
                                    placeholder={'# Título do artigo\n\nTexto introdutório aqui...\n\n## Seção\n\nConteúdo da seção...\n\n- Item 1\n- Item 2\n\n> 💡 Dica: escreva todo o conteúdo em Markdown!'}
                                />
                            ) : (
                                <div
                                    className="bg-white/[0.03] border border-white/10 rounded-lg px-6 py-4"
                                    style={{ minHeight: 500 }}
                                >
                                    <MarkdownRenderer content={editMarkdown} />
                                </div>
                            )}

                            {/* Ações */}
                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !editMarkdown.trim()}
                                    className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-sm font-semibold px-6 py-2.5"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="gap-2 border-white/10 text-xs"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar padrão
                                </Button>
                                <span className="text-[10px] text-gray-600 ml-auto">
                                    {editMarkdown.length > 0 ? `${editMarkdown.length} caracteres` : 'Vazio — usará conteúdo padrão'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
