'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Link } from '@/i18n/navigation';
import {
    CheckCircle, Loader2, FileCheck, Eye, ChevronDown, ChevronUp,
    CheckSquare, Square, Settings, ArrowUpFromLine, ArrowLeft,
} from 'lucide-react';

interface PendingOverride {
    slug: string;
    translationKey: string;
    overrideMarkdown: string;
    baseMarkdownPt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDifferentFromBase: boolean;
}

export default function HelpValidationPage() {
    const [pending, setPending] = useState<PendingOverride[]>([]);
    const [loading, setLoading] = useState(true);
    const [promoting, setPromoting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/help-validation');
            if (!res.ok) throw new Error('Falha ao buscar overrides');
            const data = await res.json();
            setPending(data.pending || []);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const toggleSelect = (slug: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === pending.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(pending.map(p => p.slug)));
        }
    };

    const handlePromote = async (slugs: string[]) => {
        if (slugs.length === 0) return;
        const confirmed = window.confirm(
            `Promover ${slugs.length} tópico(s) para o JSON base?\n\nIsso atualiza os arquivos messages/help/*.json e remove os overrides do banco.\n\nFunciona apenas em ambiente local (dev).`
        );
        if (!confirmed) return;

        try {
            setPromoting(true);
            const res = await fetch('/api/admin/help-validation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slugs }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setSelected(new Set());
                fetchPending();
            } else {
                toast.error(data.error || 'Erro ao promover');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setPromoting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0e0e0e] dark:text-white transition-colors duration-300">
            {/* Top Bar */}
            <div className="border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-wide leading-none">Soluções RKM</h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Painel Admin</p>
                            </div>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10" />
                        <Breadcrumb items={[{ label: 'Validação de Help' }]} />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Link href="/admin/help-editor" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 text-gray-400 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <FileCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Validação de Overrides</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Revise e promova edições do Help Editor para o JSON base
                        </p>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ A promoção atualiza os arquivos <code className="text-amber-800 dark:text-amber-200">messages/help/*.json</code> —
                    funciona apenas em <strong>ambiente local</strong>. Após promover, faça commit + deploy.
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto px-6 pb-12">
                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Carregando overrides...
                    </div>
                ) : pending.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500/30" />
                        <p className="text-lg font-medium">Nenhum override pendente</p>
                        <p className="text-sm mt-1">Todos os tópicos estão sincronizados com o JSON base.</p>
                    </div>
                ) : (
                    <>
                        {/* Actions bar */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={selectAll}
                                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                {selected.size === pending.length
                                    ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                                    : <Square className="w-4 h-4" />
                                }
                                {selected.size === pending.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </button>

                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {selected.size} de {pending.length} selecionado(s)
                            </span>

                            <div className="ml-auto flex gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={selected.size === 0 || promoting}
                                    onClick={() => handlePromote(Array.from(selected))}
                                >
                                    {promoting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ArrowUpFromLine className="w-4 h-4 mr-1" />}
                                    Validar Selecionados ({selected.size})
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={promoting}
                                    onClick={() => handlePromote(pending.map(p => p.slug))}
                                >
                                    Validar Todos ({pending.length})
                                </Button>
                            </div>
                        </div>

                        {/* Override list */}
                        <div className="space-y-2">
                            {pending.map(item => {
                                const isExpanded = expandedSlug === item.slug;
                                const isSelected = selected.has(item.slug);

                                return (
                                    <div
                                        key={item.slug}
                                        className={`bg-white dark:bg-[#1a1a1a] border rounded-xl overflow-hidden transition-colors ${
                                            isSelected ? 'border-emerald-500/30' : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                                        }`}
                                    >
                                        {/* Row */}
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <button onClick={() => toggleSelect(item.slug)} className="shrink-0">
                                                {isSelected
                                                    ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                                                    : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                }
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">{item.slug}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 font-mono">
                                                        {item.translationKey}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {item.updatedBy && <span>por {item.updatedBy}</span>}
                                                    {item.updatedAt && (
                                                        <span className="ml-2">
                                                            {new Date(item.updatedAt).toLocaleString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => handlePromote([item.slug])}
                                                    disabled={promoting}
                                                    className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    Validar
                                                </button>
                                                <button
                                                    onClick={() => setExpandedSlug(isExpanded ? null : item.slug)}
                                                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    {isExpanded
                                                        ? <ChevronUp className="w-4 h-4" />
                                                        : <Eye className="w-4 h-4" />
                                                    }
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded: compare */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-200 dark:border-white/5 p-4">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                                                            Base (JSON)
                                                        </h4>
                                                        <pre className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap font-mono leading-relaxed">
                                                            {item.baseMarkdownPt || '(vazio)'}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                            Override (editado)
                                                        </h4>
                                                        <pre className="text-xs text-emerald-700 dark:text-emerald-300/80 bg-emerald-50 dark:bg-emerald-500/[0.03] p-3 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap font-mono leading-relaxed border border-emerald-200 dark:border-emerald-500/10">
                                                            {item.overrideMarkdown || '(vazio)'}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
