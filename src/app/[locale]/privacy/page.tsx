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
                    <p>
                        Esta Política de Privacidade descreve como a Soluções RKM (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo;) coleta,
                        usa, armazena e protege seus dados pessoais ao utilizar a plataforma Tracka (&ldquo;Serviço&rdquo;),
                        em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e o
                        Marco Civil da Internet (Lei 12.965/2014).
                    </p>

                    <h2>2. Dados Coletados</h2>
                    <h3>2.1. Dados fornecidos pelo usuário</h3>
                    <ul>
                        <li><strong>Cadastro:</strong> nome, email, senha (hash), telefone, endereço, CPF/documento;</li>
                        <li><strong>Inventário:</strong> nomes de itens, fotos, categorias, descrições, localizações;</li>
                        <li><strong>Pagamento:</strong> dados processados exclusivamente pelo Stripe (não armazenamos dados de cartão).</li>
                    </ul>

                    <h3>2.2. Dados coletados automaticamente</h3>
                    <ul>
                        <li><strong>Navegação:</strong> endereço IP, tipo de navegador, páginas visitadas;</li>
                        <li><strong>Aceite de termos:</strong> IP, data/hora e versão dos termos aceitos;</li>
                        <li><strong>Uso:</strong> contadores de funcionalidades (Vision AI, itens criados).</li>
                    </ul>

                    <h3>2.3. Dados de Inteligência Artificial</h3>
                    <p>
                        Ao utilizar a funcionalidade Vision AI, as imagens são temporariamente enviadas ao
                        Google Cloud Vision para análise. As imagens não são armazenadas pelo Google após o processamento.
                    </p>

                    <h2>3. Finalidades do Tratamento</h2>
                    <p>Utilizamos seus dados para:</p>
                    <ul>
                        <li>Fornecer e manter o Serviço;</li>
                        <li>Processar pagamentos e gerenciar assinaturas;</li>
                        <li>Registrar aceites de termos para conformidade jurídica;</li>
                        <li>Enviar notificações relevantes sobre o Serviço;</li>
                        <li>Melhorar a experiência do usuário;</li>
                        <li>Cumprir obrigações legais e regulatórias.</li>
                    </ul>

                    <h2>4. Base Legal</h2>
                    <p>O tratamento de dados é baseado em:</p>
                    <ul>
                        <li><strong>Consentimento:</strong> aceite explícito dos termos e política;</li>
                        <li><strong>Execução de contrato:</strong> prestação do Serviço contratado;</li>
                        <li><strong>Interesse legítimo:</strong> melhoria contínua do Serviço;</li>
                        <li><strong>Obrigação legal:</strong> cumprimento de exigências regulatórias.</li>
                    </ul>

                    <h2>5. Compartilhamento de Dados</h2>
                    <p>Seus dados podem ser compartilhados com:</p>
                    <ul>
                        <li><strong>Stripe:</strong> processamento de pagamentos;</li>
                        <li><strong>Google Cloud:</strong> análise de imagens via Vision AI;</li>
                        <li><strong>Cloudinary:</strong> armazenamento de imagens;</li>
                        <li><strong>Turso:</strong> hospedagem do banco de dados;</li>
                        <li><strong>Vercel:</strong> hospedagem da aplicação.</li>
                    </ul>
                    <p><strong>Não vendemos seus dados pessoais a terceiros.</strong></p>

                    <h2>6. Armazenamento e Segurança</h2>
                    <ul>
                        <li>Senhas armazenadas com hash bcrypt;</li>
                        <li>Comunicações criptografadas via HTTPS/TLS;</li>
                        <li>Dados de assinatura (snapshot) imutáveis após criação;</li>
                        <li>Aceites de termos registrados com IP e timestamp para auditoria;</li>
                        <li>Backups regulares e redundância geográfica.</li>
                    </ul>

                    <h2>7. Seus Direitos (LGPD)</h2>
                    <p>Como titular dos dados, você tem direito a:</p>
                    <ul>
                        <li>Confirmação da existência de tratamento;</li>
                        <li>Acesso e correção de dados;</li>
                        <li>Anonimização, bloqueio ou eliminação;</li>
                        <li>Portabilidade dos dados;</li>
                        <li>Eliminação dos dados tratados com consentimento;</li>
                        <li>Revogação do consentimento.</li>
                    </ul>
                    <p>
                        Para exercer esses direitos, entre em contato pelo email: <strong>privacidade@solucoesrkm.com</strong>
                    </p>

                    <h2>8. Retenção de Dados</h2>
                    <ul>
                        <li><strong>Dados de conta:</strong> mantidos enquanto a conta estiver ativa;</li>
                        <li><strong>Registros de aceite:</strong> mantidos permanentemente para fins de auditoria jurídica;</li>
                        <li><strong>Dados de assinatura:</strong> mantidos por 5 anos após cancelamento (obrigação fiscal);</li>
                        <li><strong>Conta excluída:</strong> dados pessoais removidos em até 30 dias, exceto os com retenção legal.</li>
                    </ul>

                    <h2>9. Cookies</h2>
                    <p>
                        Utilizamos cookies essenciais para autenticação e sessão. Não utilizamos cookies
                        para rastreamento publicitário.
                    </p>

                    <h2>10. Alterações nesta Política</h2>
                    <p>
                        Alterações serão comunicadas via email e/ou notificação na plataforma,
                        com antecedência mínima de 15 dias antes de entrarem em vigor.
                    </p>

                    <h2>11. Contato</h2>
                    <p>
                        <strong>Encarregado de Proteção de Dados (DPO):</strong><br />
                        Email: privacidade@solucoesrkm.com
                    </p>

                    <hr />
                    <p><em>
                        Esta política é regida pelas leis da República Federativa do Brasil, especialmente
                        a Lei Geral de Proteção de Dados (Lei 13.709/2018).
                    </em></p>
                </div>
            </div>
        </div>
    );
}
