/**
 * @file markdown-to-html.ts
 * @description Converte Markdown simples para HTML limpo.
 *
 * Usado em dois lugares:
 *   1. MarkdownRenderer.tsx (client-side, para exibir overrides no /help)
 *   2. freshdesk-sync.service.ts (server-side, para gerar HTML para Freshdesk)
 *
 * Suporta: headings, bold, italic, code, listas, blockquotes, parágrafos.
 */

function processInline(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

export function markdownToHtml(md: string): string {
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Headings
        if (line.startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<h3>${processInline(line.slice(4))}</h3>`;
            continue;
        }
        if (line.startsWith('## ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<h2>${processInline(line.slice(3))}</h2>`;
            continue;
        }
        if (line.startsWith('# ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<h1>${processInline(line.slice(2))}</h1>`;
            continue;
        }

        // Blockquote
        if (line.startsWith('> ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<blockquote>${processInline(line.slice(2))}</blockquote>`;
            continue;
        }

        // Unordered list
        if (line.match(/^[-*] /)) {
            if (!inList) { html += '<ul>'; inList = true; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<li>${processInline(line.replace(/^[-*] /, ''))}</li>`;
            continue;
        }

        // Ordered list
        const olMatch = line.match(/^(\d+)\. (.+)/);
        if (olMatch) {
            if (!inOl) { html += '<ol>'; inOl = true; }
            if (inList) { html += '</ul>'; inList = false; }
            html += `<li>${processInline(olMatch[2])}</li>`;
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            continue;
        }

        // Paragraph
        if (inList) { html += '</ul>'; inList = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
        html += `<p>${processInline(line)}</p>`;
    }

    if (inList) html += '</ul>';
    if (inOl) html += '</ol>';

    return html;
}

/**
 * Converte um objeto JSON de tópico de help para HTML limpo.
 * Recursivamente percorre sections, steps, tips, etc.
 */
export function helpJsonToHtml(topicData: Record<string, any>): string {
    const parts: string[] = [];
    const content = topicData.content || topicData;

    // Intro
    if (content.intro) {
        parts.push(`<p>${content.intro}</p>`);
    }

    // Percorrer todas as chaves do content
    for (const [key, value] of Object.entries(content)) {
        if (key === 'intro') continue; // já processado

        if (typeof value === 'string') {
            // tip, warning, info — strings simples
            if (key === 'tip') {
                parts.push(`<blockquote><strong>💡 Dica:</strong> ${value}</blockquote>`);
            } else if (key === 'warning') {
                parts.push(`<blockquote><strong>⚠️ Atenção:</strong> ${value}</blockquote>`);
            } else if (key === 'info') {
                parts.push(`<p><em>${value}</em></p>`);
            } else {
                // Campos genéricos como desc, etc.
                // Skip step fields handled by parent
            }
        } else if (typeof value === 'object' && value !== null) {
            // Seção com título
            parts.push(renderSection(key, value));
        }
    }

    return parts.join('\n');
}

function renderSection(key: string, section: Record<string, any>): string {
    const parts: string[] = [];

    // Se tem title, é uma seção com heading
    if (section.title) {
        parts.push(`<h2>${section.title}</h2>`);
    }

    // Se tem desc, é uma descrição da seção
    if (section.desc) {
        parts.push(`<p>${section.desc}</p>`);
    }

    // Steps (step1, step2, ...)
    const steps = Object.entries(section)
        .filter(([k]) => k.match(/^step\d+$/))
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

    if (steps.length > 0) {
        parts.push('<ol>');
        for (const [, text] of steps) {
            if (typeof text === 'string') {
                parts.push(`<li>${text}</li>`);
            }
        }
        parts.push('</ol>');
    }

    // Sub-items com name/desc (ex: cards com ícone)
    const subItems = Object.entries(section)
        .filter(([k, v]) =>
            typeof v === 'object' && v !== null && !Array.isArray(v) &&
            (v as any).name && (v as any).desc &&
            !k.match(/^step\d+$/) && k !== 'title' && k !== 'desc'
        );

    if (subItems.length > 0) {
        for (const [, item] of subItems) {
            const i = item as Record<string, string>;
            const icon = i.icon ? `${i.icon} ` : '';
            const method = i.method ? `<code>${i.method}</code> — ` : '';
            parts.push(`<p><strong>${icon}${i.name}</strong><br/>${method}${i.desc}</p>`);
        }
    }

    // Sub-sections (objects with title and no name)
    const subSections = Object.entries(section)
        .filter(([k, v]) =>
            typeof v === 'object' && v !== null && !Array.isArray(v) &&
            (v as any).title && !(v as any).name &&
            !k.match(/^step\d+$/) && k !== 'title' && k !== 'desc'
        );

    for (const [subKey, subValue] of subSections) {
        parts.push(renderSection(subKey, subValue as Record<string, any>));
    }

    // Tip/warning dentro de seção
    if (section.tip) {
        parts.push(`<blockquote><strong>💡 Dica:</strong> ${section.tip}</blockquote>`);
    }
    if (section.warning) {
        parts.push(`<blockquote><strong>⚠️ Atenção:</strong> ${section.warning}</blockquote>`);
    }

    // Simple string fields (landing, apiKeys, freshdesk, etc.)
    const simpleStrings = Object.entries(section)
        .filter(([k, v]) =>
            typeof v === 'string' &&
            !['title', 'desc', 'tip', 'warning', 'info', 'intro'].includes(k) &&
            !k.match(/^step\d+$/)
        );

    if (simpleStrings.length > 0) {
        parts.push('<ul>');
        for (const [, text] of simpleStrings) {
            parts.push(`<li>${text}</li>`);
        }
        parts.push('</ul>');
    }

    return parts.join('\n');
}
