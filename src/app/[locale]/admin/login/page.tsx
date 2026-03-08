/**
 * @file admin/login/page.tsx
 * @description Página de login para employees acessarem o admin SaaS.
 *
 * Design alinhado com o aplicativo Tracka — teal accent (#287D8B),
 * layout limpo e profissional, com dark mode consistente.
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/admin/settings';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(callbackUrl);
                router.refresh();
            } else {
                setError(data.error || 'Credenciais inválidas.');
            }
        } catch {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{
                background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0f172a 100%)',
            }}
        >
            {/* Subtle background pattern */}
            <div className="fixed inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, rgba(40, 125, 139, 0.4) 2px, transparent 0)`,
                    backgroundSize: '50px 50px',
                }}
            />

            <div className="relative w-full max-w-md space-y-8">
                {/* Logo + Icon */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(40, 125, 139, 0.2), rgba(40, 125, 139, 0.05))',
                            border: '1px solid rgba(40, 125, 139, 0.3)',
                        }}
                    >
                        <Shield className="w-8 h-8" style={{ color: '#287D8B' }} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Soluções RKM
                    </h1>
                    <p className="text-sm mt-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                        Painel Administrativo
                    </p>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit}
                    className="p-8 rounded-2xl space-y-5"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(40, 125, 139, 0.15)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(40, 125, 139, 0.05)',
                    }}
                >
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: 'rgba(148, 163, 184, 0.5)' }}
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@solucoesrkm.com"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none transition-all duration-200"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(40, 125, 139, 0.2)',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'rgba(40, 125, 139, 0.5)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 125, 139, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'rgba(40, 125, 139, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: 'rgba(148, 163, 184, 0.5)' }}
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none transition-all duration-200"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(40, 125, 139, 0.2)',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'rgba(40, 125, 139, 0.5)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 125, 139, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'rgba(40, 125, 139, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                            style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                            }}
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{
                            background: loading
                                ? 'rgba(40, 125, 139, 0.6)'
                                : 'linear-gradient(135deg, #287D8B, #1e6873)',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(40, 125, 139, 0.25)',
                        }}
                        onMouseEnter={e => {
                            if (!loading) {
                                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(40, 125, 139, 0.35)';
                                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={e => {
                            (e.target as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 4px 14px rgba(40, 125, 139, 0.25)';
                            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
                    Acesso restrito a employees Soluções RKM.
                </p>
            </div>
        </div>
    );
}
