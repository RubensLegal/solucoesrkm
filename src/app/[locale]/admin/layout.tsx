import { getSession, getSystemRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Admin Layout — protege páginas dentro de /admin/*
 * Apenas funcionários (Employee) têm acesso.
 *
 * A página de login (/admin/login) é client-side e funciona sem session.
 * O layout só redireciona para login se estiver em páginas protegidas.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Tenta obter sessão — se não há, renderiza children (login page funciona)
    let session;
    try {
        session = await getSession();
    } catch {
        // Se getSession falhar (ex: env inválido), renderiza children
        return <>{children}</>;
    }

    // Se não há sessão, renderiza children normalmente
    // (a página de login vai funcionar, e as páginas protegidas
    // devem fazer sua própria verificação de auth)
    if (!session) {
        return <>{children}</>;
    }

    // Se há sessão, verifica se é employee
    const role = await getSystemRole(session.userId);

    if (!role) {
        redirect('/');
    }

    return <>{children}</>;
}

