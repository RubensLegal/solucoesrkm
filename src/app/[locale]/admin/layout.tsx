import { getSession, getSystemRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Admin Layout — protege todas as páginas dentro de /admin/*
 * Apenas funcionários (Employee) têm acesso.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/admin/login?callbackUrl=/admin/settings');
    }

    const role = await getSystemRole(session.userId);

    if (!role) {
        // Não é funcionário → volta para o dashboard
        redirect('/dashboard');
    }

    return <>{children}</>;
}
