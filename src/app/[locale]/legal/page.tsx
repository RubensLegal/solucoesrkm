import { Header } from '@/components/Header';

export const metadata = { title: 'Avisos Legais | Soluções RKM' };

export default function LegalPage() {
    return (
        <>
            <Header />
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
        </>
    );
}
