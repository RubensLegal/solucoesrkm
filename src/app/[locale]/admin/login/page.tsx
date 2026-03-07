/**
 * @file admin/login/page.tsx
 * @description Página de login para employees acessarem o admin SaaS.
 *
 * Sem cadastro público — apenas employees com conta existente.
 * Após login, redireciona para /admin/settings.
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
        <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Soluções RKM
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Painel Administrativo — Acesso Restrito</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@solucoesrkm.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium">Senha</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <p className="text-center text-xs text-gray-600">
                    Acesso restrito a employees Soluções RKM.
                </p>
            </div>
        </div>
    );
}
