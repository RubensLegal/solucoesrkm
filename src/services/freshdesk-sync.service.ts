/**
 * @file freshdesk-sync.service.ts
 * @description Sincroniza conteúdo corporativo do solucoesrkm com a Knowledge Base do Freshdesk.
 *
 * Hierarquia:
 *   CORPORATE_ARTICLES → Freshdesk Category "Soluções RKM — Corporativo"
 *     └── Folder por seção (FAQ, Legal, etc.)
 *       └── Artigos individuais
 *
 * Credenciais: buscadas do banco via SiteSettings key 'api_keys'
 * Mapping: persistido em SiteSettings key 'freshdesk_corporate_mapping'
 */

import prisma from '@/lib/prisma';
import { getSiteSettings } from '@/actions/site-settings.actions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FreshdeskMapping {
    categories: Record<string, number>;
    folders: Record<string, number>;
    articles: Record<string, number>;
    lastSync?: string;
}

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
    details: string[];
}

interface CorporateArticle {
    slug: string;
    title: string;
    folder: string;
    htmlContent: string;
}

// ─── Freshdesk API helpers ───────────────────────────────────────────────────

async function getFreshdeskCredentials() {
    // Buscar API key do banco (SiteSettings → api_keys)
    const apiKeys = await getSiteSettings('api_keys');
    const apiKey = apiKeys?.freshdeskApiKey || process.env.FRESHDESK_API_KEY;
    const domain = apiKeys?.freshdeskDomain || process.env.FRESHDESK_DOMAIN || 'solucoesrkm.freshdesk.com';

    if (!apiKey) throw new Error('FRESHDESK_API_KEY não configurada (banco ou env)');
    return { apiKey, baseUrl: `https://${domain}/api/v2` };
}

async function freshdeskRequest(
    method: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    body?: Record<string, any>
) {
    const { apiKey, baseUrl } = await getFreshdeskCredentials();
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${apiKey}:X`).toString('base64')}`,
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Freshdesk ${method} ${endpoint}: ${res.status} ${text}`);
    }

    return res.json();
}

// ─── Corporate Content ───────────────────────────────────────────────────────

/**
 * Definição estática das seções corporativas.
 * O conteúdo é gerado a partir do que está nas páginas TSX.
 */
const CORPORATE_SECTIONS = [
    {
        id: 'faq',
        name: '❓ Perguntas Frequentes',
        folderName: 'Perguntas Frequentes',
    },
    {
        id: 'terms',
        name: '📋 Termos de Uso',
        folderName: 'Termos de Uso',
    },
    {
        id: 'privacy',
        name: '🔒 Política de Privacidade',
        folderName: 'Política de Privacidade',
    },
    {
        id: 'legal',
        name: '⚖️ Aviso Legal',
        folderName: 'Aviso Legal',
    },
    {
        id: 'cookies',
        name: '🍪 Política de Cookies',
        folderName: 'Política de Cookies',
    },
];

/**
 * Gera os artigos corporativos para sincronização com o Freshdesk.
 * Cada página corporativa vira um artigo HTML.
 */
function getCorporateArticles(): CorporateArticle[] {
    return [
        {
            slug: 'corporate-faq',
            title: 'Perguntas Frequentes — Soluções RKM',
            folder: 'faq',
            htmlContent: `
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
<p>Sim, você pode cancelar a qualquer momento. O acesso ao plano pago continua até o fim do período já pago. Atenção: ao cancelar, o plano anterior não pode ser recuperado.</p>

<h3>Meus dados estão seguros?</h3>
<p>Sim. Utilizamos criptografia HTTPS/TLS, senhas com hash bcrypt, e seguimos a LGPD. Seus dados de pagamento são processados exclusivamente pelo Stripe.</p>

<h3>Como funciona o reconhecimento de fotos?</h3>
<p>O Tracka utiliza Google Cloud Vision AI para analisar fotos e sugerir nomes de itens automaticamente. As imagens são processadas temporariamente e não são armazenadas pelo Google.</p>

<h3>Como entro em contato com o suporte?</h3>
<p>Através do widget de suporte (bolha flutuante), pelo email <strong>suporte@solucoesrkm.com</strong>, ou abrindo um ticket no portal de suporte.</p>
`,
        },
        {
            slug: 'corporate-terms',
            title: 'Termos de Uso — Soluções RKM',
            folder: 'terms',
            htmlContent: `
<h2>1. Aceitação dos Termos</h2>
<p>Ao utilizar nossos serviços, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços.</p>

<h2>2. Definições</h2>
<p><strong>Plataforma:</strong> Conjunto de serviços oferecidos pela Soluções RKM, incluindo o Tracka.</p>
<p><strong>Usuário:</strong> Pessoa física ou jurídica que utiliza nossos serviços.</p>
<p><strong>Conteúdo:</strong> Dados, textos, imagens e informações inseridos pelo Usuário.</p>

<h2>3. Uso da Plataforma</h2>
<p>O Usuário se compromete a: utilizar a plataforma apenas para fins lícitos; não tentar acessar áreas restritas; não utilizar bots ou ferramentas automatizadas sem autorização; manter suas credenciais de acesso em sigilo.</p>

<h2>4. Planos e Pagamentos</h2>
<h3>4.1 Snapshot de Limites</h3>
<p>Ao assinar um plano, os limites vigentes naquele momento são "congelados" na assinatura. Mudanças futuras nos planos não afetam assinaturas ativas.</p>
<h3>4.2 Cancelamento e Irreversibilidade</h3>
<p>Ao cancelar uma assinatura, o acesso pago continua até o fim do período. Após o cancelamento, não é possível reativar o mesmo plano com as condições anteriores.</p>
<h3>4.3 Trial</h3>
<p>O período de avaliação (trial) dura 15 dias. Após o trial, a conta é convertida automaticamente para o plano Free.</p>

<h2>5. Propriedade Intelectual</h2>
<p>Todo o software, design, marcas e conteúdo criado pela Soluções RKM são protegidos por direitos autorais. O Usuário mantém a propriedade de todo o conteúdo que inserir na plataforma.</p>

<h2>6. Privacidade</h2>
<p>O tratamento de dados pessoais é regido pela nossa <strong>Política de Privacidade</strong>, que complementa estes Termos.</p>

<h2>7. Limitação de Responsabilidade</h2>
<p>A Soluções RKM não se responsabiliza por: danos indiretos, lucros cessantes ou perda de dados causada por fatores fora do nosso controle.</p>

<h2>8. Modificações</h2>
<p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas com antecedência.</p>

<h2>9. Legislação Aplicável</h2>
<p>Estes termos são regidos pela legislação brasileira. Qualquer disputa será submetida ao foro da comarca de Zurich, Suíça ou jurisdição competente no Brasil.</p>

<p><em>Última atualização: Janeiro 2025</em></p>
`,
        },
        {
            slug: 'corporate-privacy',
            title: 'Política de Privacidade — Soluções RKM',
            folder: 'privacy',
            htmlContent: `
<h2>1. Introdução</h2>
<p>A Soluções RKM valoriza a privacidade dos seus usuários. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais.</p>

<h2>2. Dados Coletados</h2>
<h3>2.1 Dados fornecidos pelo usuário</h3>
<p>Nome, e-mail, senha (hash bcrypt), dados de perfil.</p>
<h3>2.2 Dados coletados automaticamente</h3>
<p>Endereço IP, tipo de navegador, páginas visitadas, timestamps de acesso.</p>
<h3>2.3 Dados de Inteligência Artificial</h3>
<p>Imagens enviadas para análise são processadas pelo Google Cloud Vision AI. As imagens são transmitidas temporariamente e não são armazenadas pelo Google após o processamento.</p>

<h2>3. Uso dos Dados</h2>
<p>Utilizamos seus dados para: fornecer e melhorar nossos serviços; personalizar sua experiência; processar pagamentos via Stripe; enviar comunicações relevantes; cumprir obrigações legais.</p>

<h2>4. Compartilhamento</h2>
<p>Não vendemos dados pessoais. Compartilhamos apenas com: Stripe (processamento de pagamentos); Google Cloud (processamento de imagens via Vision AI); Cloudinary (armazenamento de imagens); Turso (banco de dados).</p>

<h2>5. Segurança</h2>
<p>Implementamos: criptografia HTTPS/TLS em todas as comunicações; hash bcrypt para senhas; acesso restrito por roles (SUPERADMIN, ADMIN, EDITOR, VIEWER); backups regulares do banco de dados.</p>

<h2>6. Cookies</h2>
<p>Utilizamos cookies essenciais para autenticação e preferências. Consulte nossa Política de Cookies para detalhes.</p>

<h2>7. Seus Direitos (LGPD)</h2>
<p>Você tem direito a: acessar seus dados; solicitar correção; solicitar exclusão (botão "Excluir Conta" no app); revogar consentimento; portabilidade de dados (exportação CSV/JSON).</p>

<h2>8. Retenção de Dados</h2>
<p>Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão, os dados são removidos em até 30 dias, exceto quando houver obrigação legal de retenção.</p>

<h2>9. Contato</h2>
<p>Para questões sobre privacidade: <strong>privacidade@solucoesrkm.com</strong></p>

<p><em>Última atualização: Janeiro 2025</em></p>
`,
        },
        {
            slug: 'corporate-legal',
            title: 'Aviso Legal — Soluções RKM',
            folder: 'legal',
            htmlContent: `
<h2>Razão Social</h2>
<p>Soluções RKM — Tecnologia e Inovação</p>

<h2>Sede</h2>
<p>Zurique, Suíça</p>

<h2>Contato</h2>
<p>Email: <strong>contato@solucoesrkm.com</strong></p>
<p>Suporte: <strong>suporte@solucoesrkm.com</strong></p>

<h2>Propriedade Intelectual</h2>
<p>Todo o conteúdo deste site — incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados — é propriedade da Soluções RKM e está protegido por leis internacionais de direitos autorais.</p>

<h2>Marcas Registradas</h2>
<p>Soluções RKM e Tracka são marcas de propriedade da empresa. Uso não autorizado é proibido.</p>

<h2>Isenção de Responsabilidade</h2>
<p>As informações neste site são fornecidas "como estão" sem garantias de qualquer tipo. A Soluções RKM não se responsabiliza por erros ou omissões no conteúdo.</p>

<h2>LGPD / GDPR</h2>
<p>Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD) e o Regulamento Geral sobre a Proteção de Dados (GDPR) da União Europeia.</p>
`,
        },
        {
            slug: 'corporate-cookies',
            title: 'Política de Cookies — Soluções RKM',
            folder: 'cookies',
            htmlContent: `
<h2>O que são Cookies?</h2>
<p>Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site.</p>

<h2>Cookies que Utilizamos</h2>
<h3>Essenciais</h3>
<p>Necessários para o funcionamento básico do site e autenticação.</p>
<h3>Funcionais</h3>
<p>Lembram suas preferências (idioma, tema, etc.).</p>
<h3>Analíticos</h3>
<p>Ajudam a entender como os visitantes interagem com o site.</p>

<h2>Gerenciamento</h2>
<p>Você pode gerenciar suas preferências de cookies a qualquer momento através do banner de cookies ou das configurações do seu navegador.</p>

<h2>Cookies de Terceiros</h2>
<p>Stripe (pagamentos), Freshdesk (suporte), Google (analytics — quando ativado).</p>
`,
        },
    ];
}

// ─── Load/Save mapping ───────────────────────────────────────────────────────

const MAPPING_KEY = 'freshdesk_corporate_mapping';

async function loadMapping(): Promise<FreshdeskMapping> {
    const data = await getSiteSettings(MAPPING_KEY);
    if (!data) {
        return { categories: {}, folders: {}, articles: {} };
    }
    return data as unknown as FreshdeskMapping;
}

async function saveMapping(mapping: FreshdeskMapping) {
    mapping.lastSync = new Date().toISOString();
    await prisma.siteSettings.upsert({
        where: { key: MAPPING_KEY },
        update: { value: JSON.stringify(mapping) },
        create: { key: MAPPING_KEY, value: JSON.stringify(mapping) },
    });
}

// ─── Main sync ───────────────────────────────────────────────────────────────

const CATEGORY_NAME = '🏢 Soluções RKM — Corporativo';

export async function syncCorporateToFreshdesk(): Promise<SyncResult> {
    const result: SyncResult = { success: true, created: 0, updated: 0, errors: [], details: [] };
    const mapping = await loadMapping();
    const articles = getCorporateArticles();

    try {
        // ── Criar/buscar Category ──
        let categoryId = mapping.categories['corporate'];
        if (!categoryId) {
            const created = await freshdeskRequest('POST', '/solutions/categories', {
                name: CATEGORY_NAME,
                description: 'Conteúdo corporativo da Soluções RKM — FAQ, Termos, Privacidade, Legal, Cookies',
            });
            categoryId = created.id;
            mapping.categories['corporate'] = categoryId;
            result.created++;
            result.details.push(`📁 Categoria criada: ${CATEGORY_NAME}`);
        }

        // ── Criar/buscar Folders ──
        for (const section of CORPORATE_SECTIONS) {
            let folderId = mapping.folders[section.id];
            if (!folderId) {
                const created = await freshdeskRequest('POST', `/solutions/categories/${categoryId}/folders`, {
                    name: `${section.name}`,
                    description: `${section.folderName} — Soluções RKM`,
                    visibility: 1, // público
                });
                folderId = created.id;
                mapping.folders[section.id] = folderId;
                result.created++;
                result.details.push(`📂 Pasta criada: ${section.name}`);
            }
        }

        // ── Artigos ──
        for (const article of articles) {
            const folderId = mapping.folders[article.folder];
            if (!folderId) {
                result.errors.push(`Pasta não encontrada para: ${article.folder}`);
                continue;
            }

            const articlePayload = {
                title: article.title,
                description: article.htmlContent,
                status: 2, // published
                art_type: 1, // permanent
            };

            const articleId = mapping.articles[article.slug];

            try {
                if (articleId) {
                    await freshdeskRequest('PUT', `/solutions/articles/${articleId}`, articlePayload);
                    result.updated++;
                    result.details.push(`✏️ Atualizado: ${article.title}`);
                } else {
                    const created = await freshdeskRequest('POST', `/solutions/folders/${folderId}/articles`, articlePayload);
                    mapping.articles[article.slug] = created.id;
                    result.created++;
                    result.details.push(`✅ Criado: ${article.title}`);
                }
            } catch (err: any) {
                result.errors.push(`${article.title}: ${err.message}`);
            }
        }

        await saveMapping(mapping);

    } catch (err: any) {
        result.success = false;
        result.errors.push(err.message);
    }

    return result;
}

/**
 * Retorna info do último sync para exibição no admin.
 */
export async function getSyncStatus(): Promise<{
    lastSync: string | null;
    articleCount: number;
}> {
    const mapping = await loadMapping();
    return {
        lastSync: mapping.lastSync || null,
        articleCount: Object.keys(mapping.articles).length,
    };
}
