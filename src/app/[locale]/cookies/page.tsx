import { getTranslations } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';

export const metadata = { title: 'Preferências de Cookies | Soluções RKM' };

export default async function CookiesPage() {
    const t = await getTranslations('corporate');
    const tt = await getTranslations('tracka');

    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 20%, #0a0a1a 40%, #080816 100%)',
        }}>
            <LandingHeader
                logoText="Tracka"
                navHome={t('nav.home')}
                navFeatures={tt('features.title')}
                navPricing={tt('pricing.title')}
                navAbout={t('brand')}
                loginText={t('login')}
            />
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
        </div>
    );
}
