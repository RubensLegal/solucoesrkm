import { getTranslations } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';

export const metadata = { title: 'Perguntas Frequentes | Soluções RKM' };

export default async function FAQPage() {
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
                    <h1>Perguntas Frequentes</h1>

                    <h2>Sobre a Empresa</h2>

                    <h3>O que é a Soluções RKM?</h3>
                    <p>A Soluções RKM é uma empresa de tecnologia que desenvolve aplicativos inteligentes para organizar, gerenciar e simplificar o dia a dia de pessoas e empresas.</p>

                    <h3>Quais produtos a Soluções RKM oferece?</h3>
                    <p>Atualmente oferecemos o <strong>Tracka</strong> — uma plataforma de gestão de inventário pessoal e empresarial com inteligência artificial. Novos produtos estão em desenvolvimento.</p>

                    <h2>Sobre o Tracka</h2>

                    <h3>O que é o Tracka?</h3>
                    <p>O Tracka permite catalogar, organizar e localizar seus pertences com auxílio de inteligência artificial. Disponível como app web e PWA.</p>

                    <h3>O Tracka é gratuito?</h3>
                    <p>Sim! O plano Free é gratuito para sempre, com limites de itens e funcionalidades. Para recursos adicionais, existem os planos Plus e Pro.</p>

                    <h3>Posso cancelar minha assinatura a qualquer momento?</h3>
                    <p>Sim, você pode cancelar a qualquer momento. O acesso ao plano pago continua até o fim do período já pago.</p>

                    <h3>Meus dados estão seguros?</h3>
                    <p>Sim. Utilizamos criptografia HTTPS/TLS, senhas com hash bcrypt, e seguimos a LGPD.</p>

                    <h3>Como funciona o reconhecimento de fotos?</h3>
                    <p>O Tracka utiliza Google Cloud Vision AI para analisar fotos e sugerir nomes de itens automaticamente.</p>

                    <h3>Como entro em contato com o suporte?</h3>
                    <p>Através do widget de suporte, pelo email <strong>suporte@solucoesrkm.com</strong>, ou abrindo um ticket no portal de suporte.</p>

                    <hr />
                    <p><em>Soluções RKM © {new Date().getFullYear()}</em></p>
                </div>
            </div>
        </div>
    );
}
