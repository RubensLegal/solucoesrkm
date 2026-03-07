import { Header } from '@/components/Header';

export const metadata = { title: 'Termos de Uso | Soluções RKM' };

export default function TermsPage() {
    return (
        <>
            <Header />
            <div className="pt-24 pb-16 px-4">
                <div className="prose">
                    <h1>Termos de Uso</h1>
                    <p><em>Última atualização: 06 de março de 2026 — Versão v1.0</em></p>

                    <h2>1. Aceitação dos Termos</h2>
                    <p>Ao acessar e usar a plataforma Tracka (&quot;Serviço&quot;), operada por Soluções RKM (&quot;Empresa&quot;), você concorda com estes Termos de Uso.</p>

                    <h2>2. Descrição do Serviço</h2>
                    <p>O Tracka é uma plataforma de gestão de inventário pessoal e empresarial que permite catalogar, organizar e localizar seus pertences com auxílio de inteligência artificial.</p>

                    <h2>3. Planos e Assinaturas</h2>
                    <p>O Serviço está disponível nos planos Free, Plus e Pro. Ao contratar um plano pago, os limites e funcionalidades são <strong>congelados</strong> no momento da assinatura. Mudanças posteriores <strong>não afetam</strong> assinantes existentes.</p>
                    <p>Ao cancelar a assinatura, o plano contratado será <strong>encerrado permanentemente</strong>. <strong>Não há possibilidade de recuperação do plano anterior</strong>.</p>

                    <h2>4. Pagamentos</h2>
                    <p>Os pagamentos são processados pelo Stripe. Não armazenamos dados de cartão. Cobranças são recorrentes e mensais, salvo cancelamento prévio.</p>

                    <h2>5. Uso Aceitável</h2>
                    <ul>
                        <li>Fornecer informações verdadeiras e atualizadas</li>
                        <li>Não compartilhar suas credenciais de acesso</li>
                        <li>Não utilizar o Serviço para fins ilegais</li>
                        <li>Não tentar burlar os limites do seu plano</li>
                    </ul>

                    <h2>6. Propriedade Intelectual</h2>
                    <p>O Tracka, incluindo código-fonte, design, marcas e conteúdo original, é propriedade exclusiva da Soluções RKM. Os dados inseridos pelo usuário permanecem de propriedade do usuário.</p>

                    <h2>7. Limitação de Responsabilidade</h2>
                    <p>O Serviço é fornecido &quot;como está&quot;. Não nos responsabilizamos por perdas de dados causadas por uso indevido ou indisponibilidade temporária.</p>

                    <h2>8. Proteção de Dados</h2>
                    <p>O tratamento de dados pessoais está descrito em nossa Política de Privacidade, em conformidade com a LGPD (Lei 13.709/2018).</p>

                    <h2>9. Direito de Arrependimento</h2>
                    <p>Conforme o Art. 49 do CDC, o usuário pode desistir da contratação no prazo de 7 dias corridos.</p>

                    <h2>10. Contato</h2>
                    <p><strong>Email:</strong> suporte@solucoesrkm.com</p>
                    <hr />
                    <p><em>Foro: comarca de domicílio do consumidor.</em></p>
                </div>
            </div>
        </>
    );
}
