import { getTranslations } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';

export const metadata = { title: 'Política de Privacidade | Soluções RKM' };

export default async function PrivacyPage() {
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
                    <h1>Política de Privacidade</h1>
                    <p><em>Última atualização: 06 de março de 2026 — Versão v1.0</em></p>

                    <h2>1. Introdução</h2>
                    <p>Esta Política descreve como a Soluções RKM coleta, usa, armazena e protege seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).</p>

                    <h2>2. Dados Coletados</h2>
                    <ul>
                        <li><strong>Cadastro:</strong> Nome, email, senha (hash), telefone</li>
                        <li><strong>Inventário:</strong> Nomes de itens, fotos, categorias</li>
                        <li><strong>Pagamento:</strong> Processados pelo Stripe (não armazenamos cartão)</li>
                        <li><strong>Navegação:</strong> IP, navegador, páginas visitadas</li>
                        <li><strong>Vision AI:</strong> Imagens temporariamente enviadas ao Google Cloud Vision</li>
                    </ul>

                    <h2>3. Finalidades</h2>
                    <ul>
                        <li>Fornecimento e manutenção do Serviço</li>
                        <li>Processamento de pagamentos</li>
                        <li>Registro de aceites para conformidade</li>
                        <li>Melhorias na experiência do usuário</li>
                        <li>Cumprimento de obrigações legais</li>
                    </ul>

                    <h2>4. Base Legal</h2>
                    <ul>
                        <li><strong>Consentimento:</strong> aceite explícito dos termos</li>
                        <li><strong>Execução de contrato:</strong> prestação do Serviço contratado</li>
                        <li><strong>Interesse legítimo:</strong> melhoria contínua</li>
                        <li><strong>Obrigação legal:</strong> exigências regulatórias</li>
                    </ul>

                    <h2>5. Compartilhamento</h2>
                    <ul>
                        <li><strong>Stripe</strong> — Processamento de pagamentos</li>
                        <li><strong>Google Cloud</strong> — Vision AI</li>
                        <li><strong>Cloudinary</strong> — Armazenamento de imagens</li>
                        <li><strong>Turso</strong> — Banco de dados</li>
                        <li><strong>Vercel</strong> — Hospedagem</li>
                    </ul>
                    <p><strong>Não vendemos seus dados pessoais a terceiros.</strong></p>

                    <h2>6. Segurança</h2>
                    <ul>
                        <li>Senhas com hash bcrypt</li>
                        <li>Comunicações via HTTPS/TLS</li>
                        <li>Backups regulares e redundância geográfica</li>
                    </ul>

                    <h2>7. Seus Direitos (LGPD)</h2>
                    <p>Acesso, correção, anonimização, portabilidade, eliminação e revogação do consentimento.</p>
                    <p><strong>Email:</strong> privacidade@solucoesrkm.com</p>

                    <h2>8. Retenção de Dados</h2>
                    <ul>
                        <li><strong>Conta ativa:</strong> mantidos enquanto ativa</li>
                        <li><strong>Aceites:</strong> permanentes para auditoria</li>
                        <li><strong>Assinatura:</strong> 5 anos após cancelamento</li>
                        <li><strong>Conta excluída:</strong> removidos em até 30 dias</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
