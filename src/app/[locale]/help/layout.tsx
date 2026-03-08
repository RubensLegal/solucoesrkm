import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/**
 * Layout para /help — carrega o namespace 'help' sob demanda.
 * Esse namespace (54+ KB) é excluído do bundle global no root layout
 * e injetado aqui via NextIntlClientProvider aninhado, otimizando
 * o carregamento de todas as outras páginas do app.
 */
export default async function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const allMessages = await getMessages();
    const helpMessages = { help: (allMessages as Record<string, unknown>).help };

    return (
        <NextIntlClientProvider messages={helpMessages}>
            {children}
        </NextIntlClientProvider>
    );
}
