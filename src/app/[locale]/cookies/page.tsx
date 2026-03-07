import { Header } from '@/components/Header';

export const metadata = { title: 'Preferências de Cookies | Soluções RKM' };

export default function CookiesPage() {
    return (
        <>
            <Header />
            <div className="pt-24 pb-16 px-4">
                <div className="prose">
                    <h1>Preferências de Cookies</h1>

                    <h2>Tipos de Cookies</h2>
                    <ul>
                        <li><strong>🔒 Essenciais:</strong> Necessários para autenticação, sessão e segurança. Não podem ser desabilitados.</li>
                        <li><strong>📊 Analíticos:</strong> Para entender como os usuários interagem com a plataforma (atualmente não utilizados).</li>
                        <li><strong>⚙️ Funcionais:</strong> Armazenam preferências como tema e idioma.</li>
                    </ul>

                    <h2>Como gerenciar</h2>
                    <p>Você pode gerenciar cookies nas configurações do seu navegador. Desabilitar cookies essenciais pode impedir o uso da plataforma.</p>

                    <blockquote>
                        <strong>💡 Dica:</strong> Não utilizamos cookies de rastreamento publicitário. Sua privacidade é prioridade!
                    </blockquote>
                </div>
            </div>
        </>
    );
}
