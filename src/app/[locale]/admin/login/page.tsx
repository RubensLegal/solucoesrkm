/**
 * @file admin/login/page.tsx
 * @description Página de login para employees acessarem o admin SaaS.
 *
 * Design replicado do Tracka login — light theme, card branco/claro,
 * título com gradiente azul→roxo, botão teal (#287D8B).
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: '#f1f5f9',
        }}>
            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2.5rem 2rem 0',
                }}>
                    {/* Brand title */}
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(168, 85, 247))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0',
                        lineHeight: '1.2',
                        textAlign: 'center',
                    }}>
                        Soluções RKM
                    </h1>
                    <p style={{
                        color: '#64748b',
                        marginTop: '0.25rem',
                        fontSize: '1rem',
                        lineHeight: '1.2',
                        textAlign: 'center',
                    }}>
                        Painel Administrativo
                    </p>

                    {/* Login heading */}
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#0f172a',
                        marginTop: '2.5rem',
                    }}>
                        Entrar
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        color: '#287D8B',
                        fontSize: '0.875rem',
                        marginTop: '0.25rem',
                    }}>
                        Acesso restrito a employees
                    </p>
                </div>

                {/* Form Content */}
                <div style={{ padding: '1.5rem 2rem 2rem' }}>
                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}>
                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@solucoesrkm.com"
                                required
                                autoComplete="username"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.875rem',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = '#287D8B';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 125, 139, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="********"
                                required
                                autoComplete="current-password"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.875rem',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = '#287D8B';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 125, 139, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p style={{
                                color: '#ef4444',
                                fontSize: '0.9rem',
                                padding: '0.75rem',
                                background: '#fef2f2',
                                borderRadius: '0.5rem',
                                border: '1px solid #fecaca',
                            }}>
                                {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                background: '#287D8B',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'background 0.2s, opacity 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                            onMouseEnter={e => {
                                if (!loading) (e.target as HTMLButtonElement).style.background = '#1e6873';
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLButtonElement).style.background = '#287D8B';
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
                </div>
            </div>
        </div>
    );
}
