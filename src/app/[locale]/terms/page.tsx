import { getTranslations } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';

export const metadata = { title: 'Termos de Uso | Soluções RKM' };

export default async function TermsPage() {
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
                    <h1>Termos de Uso</h1>
                    <p><em>Última atualização: 06 de março de 2026 — Versão v1.0</em></p>

                    <h2>1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar e usar a plataforma Tracka (&ldquo;Serviço&rdquo;), operada por Soluções RKM (&ldquo;Empresa&rdquo;),
                        você concorda com estes Termos de Uso. Se não concordar, não utilize o Serviço.
                    </p>

                    <h2>2. Descrição do Serviço</h2>
                    <p>
                        O Tracka é uma plataforma de gestão de inventário pessoal e empresarial que permite
                        catalogar, organizar e localizar seus pertences com auxílio de inteligência artificial.
                    </p>

                    <h2>3. Planos e Assinaturas</h2>
                    <h3>3.1. Planos Disponíveis</h3>
                    <p>
                        O Serviço está disponível nos planos Free, Plus e Pro, cada um com limites e funcionalidades
                        específicos definidos no momento da contratação.
                    </p>

                    <h3>3.2. Snapshot de Limites</h3>
                    <p>
                        Ao contratar um plano pago, os limites e funcionalidades são <strong>congelados</strong> no
                        momento da assinatura (&ldquo;Snapshot&rdquo;). Mudanças posteriores nas configurações dos planos
                        <strong> não afetam</strong> assinantes existentes, que mantêm os termos originais de contratação.
                    </p>

                    <h3>3.3. Cancelamento e Irreversibilidade</h3>
                    <p>
                        Ao cancelar a assinatura, o plano contratado será <strong>encerrado permanentemente</strong>.
                        Os limites e benefícios associados deixarão de vigorar imediatamente ao término do período pago.
                        Em caso de recontratação, o usuário estará sujeito aos planos e condições vigentes na data da
                        nova contratação. <strong>Não há possibilidade de recuperação do plano anterior</strong>, mesmo
                        que o cancelamento tenha ocorrido por engano.
                    </p>

                    <h3>3.4. Trial</h3>
                    <p>
                        O Serviço oferece um período de teste (Trial) de 15 dias com acesso a todas as funcionalidades.
                        Após o período, o usuário é automaticamente migrado para o plano Free.
                    </p>

                    <h2>4. Pagamentos</h2>
                    <p>
                        Os pagamentos são processados pelo Stripe. Ao fornecer dados de pagamento, você concorda com
                        os <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Termos de Serviço do Stripe</a>.
                        As cobranças são recorrentes e mensais, salvo cancelamento prévio.
                    </p>

                    <h2>5. Uso Aceitável</h2>
                    <p>Você concorda em:</p>
                    <ul>
                        <li>Fornecer informações verdadeiras e atualizadas;</li>
                        <li>Não compartilhar suas credenciais de acesso;</li>
                        <li>Não utilizar o Serviço para fins ilegais;</li>
                        <li>Não tentar burlar os limites do seu plano;</li>
                        <li>Manter o conteúdo armazenado dentro da legalidade.</li>
                    </ul>

                    <h2>6. Propriedade Intelectual</h2>
                    <p>
                        O Tracka, incluindo código-fonte, design, marcas e conteúdo original, é propriedade exclusiva
                        da Soluções RKM. Os dados inseridos pelo usuário permanecem de propriedade do usuário.
                    </p>

                    <h2>7. Limitação de Responsabilidade</h2>
                    <p>
                        O Serviço é fornecido &ldquo;como está&rdquo;. A Empresa não se responsabiliza por:
                    </p>
                    <ul>
                        <li>Perdas de dados causadas por uso indevido ou circunstâncias fora de nosso controle;</li>
                        <li>Decisões tomadas com base nas análises de IA;</li>
                        <li>Indisponibilidade temporária do serviço.</li>
                    </ul>

                    <h2>8. Proteção de Dados</h2>
                    <p>
                        A coleta e o tratamento de dados pessoais estão descritos em nossa{' '}
                        <a href="/privacy">Política de Privacidade</a>, em conformidade com a
                        Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                    </p>

                    <h2>9. Direito de Arrependimento</h2>
                    <p>
                        Conforme o Art. 49 do Código de Defesa do Consumidor, o usuário pode desistir da
                        contratação no prazo de 7 (sete) dias corridos a contar da data da assinatura,
                        mediante solicitação por email.
                    </p>

                    <h2>10. Alterações nos Termos</h2>
                    <p>
                        Reservamo-nos o direito de alterar estes Termos. As alterações serão comunicadas via
                        email e/ou notificação na plataforma. O uso continuado após as alterações implica aceitação.
                    </p>

                    <h2>11. Contato</h2>
                    <p>
                        Para dúvidas sobre estes termos, entre em contato:<br />
                        <strong>Email:</strong> suporte@solucoesrkm.com
                    </p>

                    <hr />
                    <p><em>
                        Estes termos são regidos pelas leis da República Federativa do Brasil.
                        Foro da comarca de domicílio do consumidor.
                    </em></p>
                </div>
            </div>
        </div>
    );
}
