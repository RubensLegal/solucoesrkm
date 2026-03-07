import { getTranslations } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';

export const metadata = { title: 'Avisos Legais | Soluções RKM' };

export default async function LegalPage() {
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
                    <h1>Avisos Legais</h1>
                    <p><em>Última atualização: 07 de março de 2026 — Versão v1.0</em></p>

                    <h2>LGPD — Lei Geral de Proteção de Dados</h2>
                    <p>Lei 13.709/2018. Regula o tratamento de dados pessoais. Registramos consentimentos explícitos, oferecemos portabilidade de dados e respeitamos todos os direitos do titular.</p>

                    <h2>CDC — Código de Defesa do Consumidor</h2>
                    <p>Lei 8.078/1990. Garantimos direito de arrependimento em 7 dias (Art. 49), transparência nos preços e atendimento ao consumidor.</p>

                    <h2>Marco Civil da Internet</h2>
                    <p>Lei 12.965/2014. Garantimos neutralidade de rede, privacidade nas comunicações e transparência no tratamento de dados.</p>

                    <h2>Propriedade Intelectual</h2>
                    <p>Os produtos da Soluções RKM, incluindo código-fonte, design, marcas e conteúdo original, são propriedade exclusiva da empresa.</p>

                    <h2>Contato Jurídico</h2>
                    <p><strong>Email:</strong> juridico@solucoesrkm.com</p>
                    <p><strong>Foro competente:</strong> comarca de domicílio do consumidor.</p>

                    <hr />
                    <p><em>Todos os termos, políticas e avisos legais estão sujeitos a alterações com antecedência mínima de 15 dias.</em></p>
                </div>
            </div>
        </div>
    );
}
