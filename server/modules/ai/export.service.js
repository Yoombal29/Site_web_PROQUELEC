const { GoogleGenerativeAI } = require('@google/generative-ai');
const { resolveStyle } = require('./token-resolver');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function cssToTailwind(style) {
    if (!style || Object.keys(style).length === 0) return '';
    const resolved = resolveStyle(style);
    const map = {
        padding: (v) => `p-[${v}]`,
        paddingTop: (v) => `pt-[${v}]`,
        paddingBottom: (v) => `pb-[${v}]`,
        paddingLeft: (v) => `pl-[${v}]`,
        paddingRight: (v) => `pr-[${v}]`,
        margin: (v) => `m-[${v}]`,
        marginTop: (v) => `mt-[${v}]`,
        marginBottom: (v) => `mb-[${v}]`,
        backgroundColor: (v) => `bg-[${v}]`,
        color: (v) => `text-[${v}]`,
        fontSize: (v) => `text-[${v}]`,
        fontWeight: (v) => (v === '700' || v === 'bold') ? 'font-bold' : `font-[${v}]`,
        textAlign: (v) => v === 'center' ? 'text-center' : v === 'right' ? 'text-right' : '',
        borderRadius: (v) => `rounded-[${v}]`,
        maxWidth: (v) => `max-w-[${v}]`,
        minHeight: (v) => `min-h-[${v}]`,
        boxShadow: (v) => `shadow-[${v}]`,
        gap: (v) => `gap-[${v}]`,
        fontFamily: (v) => `font-['${v}']`,
        lineHeight: (v) => `leading-[${v}]`,
        letterSpacing: (v) => `tracking-[${v}]`,
    };
    const classes = [];
    for (const [key, value] of Object.entries(resolved)) {
        if (map[key]) {
            const cls = map[key](value);
            if (cls) classes.push(cls);
        }
    }
    return classes.join(' ');
}

function styleToInline(style) {
    if (!style || Object.keys(style).length === 0) return '';
    const resolved = resolveStyle(style);
    return Object.entries(resolved)
        .map(([k, v]) => {
            const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${v}`;
        })
        .join('; ');
}

function generateReactCode(blocks, indent = 2) {
    const sp = (n) => '  '.repeat(n);
    let code = `import React from 'react';\n\n`;
    code += `export default function GeneratedPage() {\n`;
    code += `  return (\n`;
    code += blocks.map(b => renderBlockReact(b, 3)).join('\n');
    code += `\n  );\n`;
    code += `}\n`;
    return code;
}

function renderBlockReact(block, depth) {
    const sp = (n) => '  '.repeat(n);
    const tw = cssToTailwind(block.style);
    const inline = styleToInline(block.style);
    const childrenHtml = block.children && block.children.length > 0
        ? '\n' + block.children.map(c => renderBlockReact(c, depth + 1)).join('\n') + '\n' + sp(depth)
        : '';

    switch (block.type) {
        case 'hero':
            return `${sp(depth)}<section className="${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${sp(depth + 1)}<div className="max-w-4xl mx-auto text-center">
${block.content?.title ? `${sp(depth + 2)}<h1 className="text-4xl md:text-6xl font-black mb-6">${escapeHtml(block.content.title)}</h1>\n` : ''}${block.content?.subtitle ? `${sp(depth + 2)}<p className="text-xl md:text-2xl opacity-90 mb-8">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${block.content?.href ? `${sp(depth + 2)}<a href="${escapeHtml(block.content.href)}" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg">${block.content?.text || 'En savoir plus'}</a>\n` : ''}${sp(depth + 1)}</div>
${sp(depth)}</section>`;

        case 'section':
            return `${sp(depth)}<section className="${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${block.content?.title ? `${sp(depth + 1)}<h2 className="text-2xl font-bold mb-4">${escapeHtml(block.content.title)}</h2>\n` : ''}${block.content?.subtitle ? `${sp(depth + 1)}<p className="text-lg mb-6">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${childrenHtml ? sp(depth + 1) + '<div className="flex flex-wrap gap-6">\n' + block.children.map(c => renderBlockReact(c, depth + 2)).join('\n') + '\n' + sp(depth + 1) + '</div>' : ''}${childrenHtml}
${sp(depth)}</section>`;

        case 'text-block':
        case 'text':
            return `${sp(depth)}<div className="${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${block.content?.title ? `${sp(depth + 1)}<h2 className="text-xl font-bold mb-2">${escapeHtml(block.content.title)}</h2>\n` : ''}${block.content?.text ? `${sp(depth + 1)}<p>${escapeHtml(block.content.text)}</p>\n` : ''}${block.content?.html ? `${sp(depth + 1)}<div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(block.content.html)} }} />\n` : ''}${sp(depth)}</div>`;

        case 'image':
            return `${sp(depth)}<figure className="${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
<img src="${escapeHtml(block.content?.src || 'https://via.placeholder.com/800x400')}" alt="${escapeHtml(block.content?.alt || 'Image')}" className="w-full h-auto object-cover"${block.style?.borderRadius ? ` style={{ borderRadius: '${block.style.borderRadius}' }}` : ''} loading="lazy" />${block.content?.caption ? `\n${sp(depth + 1)}<figcaption className="text-center text-sm text-gray-500 mt-2 italic">${escapeHtml(block.content.caption)}</figcaption>` : ''}
${sp(depth)}</figure>`;

        case 'button':
            return `${sp(depth)}<div className="flex justify-center ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
<a href="${escapeHtml(block.content?.href || '#')}" className="inline-block px-8 py-3 font-bold rounded-lg transition-all hover:scale-105 shadow-md text-center" style="background-color: ${block.style?.backgroundColor || '#2563eb'}; color: ${block.style?.color || '#ffffff'}">${escapeHtml(block.content?.title || 'Bouton')}</a>
</div>`;

        case 'divider':
            return `${sp(depth)}<hr className="${tw}"${inline ? ` style={{ ${inline} }}` : ''} />`;

        case 'spacer':
            return `${sp(depth)}<div className="${tw}"${inline ? ` style={{ ${inline} }}` : ''} />`;

        case 'columns':
            return `${sp(depth)}<div className="flex flex-wrap ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${childrenHtml}
${sp(depth)}</div>`;

        case 'card':
            return `${sp(depth)}<div className="rounded-lg overflow-hidden ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${block.content?.title ? `${sp(depth + 1)}<h3 className="text-lg font-bold mb-2">${escapeHtml(block.content.title)}</h3>\n` : ''}${block.content?.subtitle ? `${sp(depth + 1)}<p className="text-sm opacity-80 mb-2">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${block.content?.text ? `${sp(depth + 1)}<p className="text-sm">${escapeHtml(block.content.text)}</p>\n` : ''}${block.content?.items && block.content.items.length > 0 ? `${sp(depth + 1)}<ul className="mt-2 space-y-1">\n${block.content.items.map((item, i) => `${sp(depth + 2)}<li key={${i}} className="flex items-center gap-2 text-sm">${item.icon ? `<span>${item.icon}</span>` : ''}<span>${escapeHtml(item.title || item.label || item.name)}</span></li>`).join('\n')}\n${sp(depth + 1)}</ul>\n` : ''}${sp(depth)}</div>`;

        case 'stats':
            return `${sp(depth)}<div className="flex flex-wrap justify-center gap-8 ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${(block.content?.items && block.content.items.length > 0 ? block.content.items : [{ value: '100+', label: 'Projets' }, { value: '50+', label: 'Clients' }, { value: '15+', label: 'Années' }]).map((item, i) => `${sp(depth + 1)}<div key={${i}} className="text-center">${item.icon ? `\n${sp(depth + 2)}<div className="text-3xl mb-2">${item.icon}</div>` : ''}\n${sp(depth + 2)}<div className="text-3xl font-black">${escapeHtml(item.value || '0')}</div>\n${sp(depth + 2)}<div className="text-sm opacity-80">${escapeHtml(item.label || item.title)}</div>\n${sp(depth + 1)}</div>`).join('\n')}
${sp(depth)}</div>`;

        case 'grid':
            return `${sp(depth)}<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${childrenHtml}
${sp(depth)}</div>`;

        case 'list':
            return `${sp(depth)}<div className="space-y-3 ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${block.content?.title ? `${sp(depth + 1)}<h3 className="text-lg font-bold mb-3">${escapeHtml(block.content.title)}</h3>\n` : ''}${(block.content?.items || []).map((item, i) => `${sp(depth + 1)}<div key={${i}} className="flex items-start gap-3 p-3 rounded-lg bg-white/50">${item.icon ? `\n${sp(depth + 2)}<span className="text-xl mt-0.5">${item.icon}</span>` : ''}\n${sp(depth + 2)}<div>${item.title || item.label ? `\n${sp(depth + 3)}<div className="font-semibold text-sm">${escapeHtml(item.title || item.label)}</div>` : ''}${item.description || item.content ? `\n${sp(depth + 3)}<div className="text-xs opacity-70 mt-0.5">${escapeHtml(item.description || item.content)}</div>` : ''}\n${sp(depth + 2)}</div>\n${sp(depth + 1)}</div>`).join('\n')}
${sp(depth)}</div>`;

        case 'form':
            return `${sp(depth)}<div className="p-6 rounded-lg ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
${block.content?.title ? `${sp(depth + 1)}<h3 className="text-xl font-bold mb-2">${escapeHtml(block.content.title)}</h3>\n` : ''}${block.content?.subtitle ? `${sp(depth + 1)}<p className="text-sm opacity-80 mb-4">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${sp(depth + 1)}<div className="space-y-3">
${sp(depth + 2)}<input placeholder="Nom" className="w-full px-4 py-2 border rounded-lg text-sm" />
${sp(depth + 2)}<input placeholder="Email" className="w-full px-4 py-2 border rounded-lg text-sm" />
${sp(depth + 2)}<textarea placeholder="Message" className="w-full px-4 py-2 border rounded-lg text-sm" rows={3}></textarea>
${sp(depth + 2)}<button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">Envoyer</button>
${sp(depth + 1)}</div>
${sp(depth)}</div>`;

        case 'video':
            return `${sp(depth)}<div className="w-full ${tw}"${inline ? ` style={{ ${inline} }}` : ''}>
<div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
${block.content?.src ? `<iframe src="${escapeHtml(block.content.src)}" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media" allowFullScreen title="${escapeHtml(block.content?.caption || 'Video')}" />` : `<div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Video</div>`}
</div>${block.content?.caption ? `\n${sp(depth + 1)}<p className="text-center text-sm text-slate-500 mt-2 italic">${escapeHtml(block.content.caption)}</p>` : ''}
${sp(depth)}</div>`;

        case 'html':
        case 'code':
            return `${sp(depth)}<div className="${tw}"${inline ? ` style={{ ${inline} }}` : ''}${block.content?.html ? ` dangerouslySetInnerHTML={{ __html: ${JSON.stringify(block.content.html)} }}` : ''}>
${block.content?.code || block.content?.html || ''}
${sp(depth)}</div>`;

        default:
            return `${sp(depth)}<div className="${tw}"${inline ? ` style={{ ${inline} }}` : ''}>${block.content?.title || block.type}${childrenHtml}</div>`;
    }
}

function generateHTML(blocks) {
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page PROQUELEC</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
`;
    html += blocks.map(b => renderBlockHTML(b, 1)).join('\n');
    html += `\n</body>\n</html>`;
    return html;
}

function renderBlockHTML(block, depth) {
    const sp = (n) => '  '.repeat(n);
    const tw = cssToTailwind(block.style);
    const inline = styleToInline(block.style);
    const styleAttr = inline ? ` style="${inline}"` : '';
    const childrenHtml = block.children && block.children.length > 0
        ? '\n' + block.children.map(c => renderBlockHTML(c, depth + 1)).join('\n') + '\n' + sp(depth)
        : '';

    const attrs = ` class="${tw}"${styleAttr}`;

    switch (block.type) {
        case 'hero':
            return `${sp(depth)}<section${attrs}>
<div class="max-w-4xl mx-auto text-center">
${block.content?.title ? `${sp(depth + 1)}<h1 class="text-4xl md:text-6xl font-black mb-6">${escapeHtml(block.content.title)}</h1>\n` : ''}${block.content?.subtitle ? `${sp(depth + 1)}<p class="text-xl md:text-2xl opacity-90 mb-8">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${block.content?.href ? `${sp(depth + 1)}<a href="${escapeHtml(block.content.href)}" class="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg">${block.content?.text || 'En savoir plus'}</a>\n` : ''}${sp(depth)}</div>
</section>`;

        case 'section':
            return `${sp(depth)}<section${attrs}>
${block.content?.title ? `${sp(depth + 1)}<h2 class="text-2xl font-bold mb-4">${escapeHtml(block.content.title)}</h2>\n` : ''}${block.content?.subtitle ? `${sp(depth + 1)}<p class="text-lg mb-6">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${childrenHtml}
</section>`;

        case 'text-block':
        case 'text':
            return `${sp(depth)}<div${attrs}>
${block.content?.title ? `${sp(depth + 1)}<h2 class="text-xl font-bold mb-2">${escapeHtml(block.content.title)}</h2>\n` : ''}${block.content?.text ? `${sp(depth + 1)}<p>${escapeHtml(block.content.text)}</p>\n` : ''}${block.content?.html || ''}
</div>`;

        case 'image':
            return `${sp(depth)}<figure${attrs}>
<img src="${escapeHtml(block.content?.src || 'https://via.placeholder.com/800x400')}" alt="${escapeHtml(block.content?.alt || 'Image')}" class="w-full h-auto object-cover" loading="lazy" />${block.content?.caption ? `\n${sp(depth + 1)}<figcaption class="text-center text-sm text-gray-500 mt-2 italic">${escapeHtml(block.content.caption)}</figcaption>` : ''}
</figure>`;

        case 'button':
            return `${sp(depth)}<div class="flex justify-center ${tw}"${styleAttr}>
<a href="${escapeHtml(block.content?.href || '#')}" class="inline-block px-8 py-3 font-bold rounded-lg transition-all hover:scale-105 shadow-md text-center" style="background-color: ${block.style?.backgroundColor || '#2563eb'}; color: ${block.style?.color || '#ffffff'}">${escapeHtml(block.content?.title || 'Bouton')}</a>
</div>`;

        case 'divider':
            return `${sp(depth)}<hr${attrs} />`;

        case 'spacer':
            return `${sp(depth)}<div${attrs}></div>`;

        case 'columns':
            return `${sp(depth)}<div class="flex flex-wrap ${tw}"${styleAttr}>
${childrenHtml}
</div>`;

        case 'card':
            return `${sp(depth)}<div class="rounded-lg overflow-hidden ${tw}"${styleAttr}>
${block.content?.title ? `${sp(depth + 1)}<h3 class="text-lg font-bold mb-2">${escapeHtml(block.content.title)}</h3>\n` : ''}${block.content?.subtitle ? `${sp(depth + 1)}<p class="text-sm opacity-80 mb-2">${escapeHtml(block.content.subtitle)}</p>\n` : ''}${block.content?.text ? `${sp(depth + 1)}<p class="text-sm">${escapeHtml(block.content.text)}</p>\n` : ''}${block.content?.items && block.content.items.length > 0 ? `${sp(depth + 1)}<ul class="mt-2 space-y-1">\n${block.content.items.map((item, i) => `${sp(depth + 2)}<li class="flex items-center gap-2 text-sm">${item.icon ? `<span>${item.icon}</span>` : ''}<span>${escapeHtml(item.title || item.label || item.name)}</span></li>`).join('\n')}\n${sp(depth + 1)}</ul>\n` : ''}
</div>`;

        case 'stats':
            return `${sp(depth)}<div class="flex flex-wrap justify-center gap-8 ${tw}"${styleAttr}>
${(block.content?.items && block.content.items.length > 0 ? block.content.items : [{ value: '100+', label: 'Projets' }, { value: '50+', label: 'Clients' }, { value: '15+', label: 'Années' }]).map((item) => `${sp(depth + 1)}<div class="text-center">${item.icon ? `\n${sp(depth + 2)}<div class="text-3xl mb-2">${item.icon}</div>` : ''}\n${sp(depth + 2)}<div class="text-3xl font-black">${escapeHtml(item.value || '0')}</div>\n${sp(depth + 2)}<div class="text-sm opacity-80">${escapeHtml(item.label || item.title)}</div>\n${sp(depth + 1)}</div>`).join('\n')}
</div>`;

        case 'grid':
            return `${sp(depth)}<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${tw}"${styleAttr}>
${childrenHtml}
</div>`;

        default:
            return `${sp(depth)}<div${attrs}>${block.content?.title || block.type}${childrenHtml}</div>`;
    }
}

function generateMinifiedJSON(blocks) {
    return JSON.stringify(blocks);
}

async function enhanceWithAI(blocks, format) {
    if (!GEMINI_API_KEY) return null;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const blocksJSON = JSON.stringify(blocks, null, 2);
    const prompt = `Tu es un expert en développement React et Tailwind CSS.
Voici un arbre JSON de blocs d'une page PROQUELEC (entreprise d'électricité Sénégal):

${blocksJSON}

Génère un composant React ${format === 'react' ? 'TypeScript' : 'JavaScript'} complet et prêt à l'emploi.
- Utilise Tailwind CSS (v3+) pour le styling
- Le code doit être propre, responsive et accessible (aria, alt)
- Ajoute des commentaires en français si nécessaire
- Exporte le composant en default export
- Réponds UNIQUEMENT avec le code, sans explication`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```[a-zA-Z]*\n?/g, '').trim();
    return text;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function exportBlocks({ blocks, format, enhance }) {
    if (!blocks || !Array.isArray(blocks)) {
        throw new Error('Blocks invalides');
    }

    let code;
    switch (format) {
        case 'react':
            code = generateReactCode(blocks);
            if (enhance) {
                const enhanced = await enhanceWithAI(blocks, 'react');
                if (enhanced) code = enhanced;
            }
            break;
        case 'html':
            code = generateHTML(blocks);
            break;
        case 'json':
            code = generateMinifiedJSON(blocks);
            break;
        default:
            throw new Error(`Format inconnu: ${format}`);
    }

    return { code, format, blockCount: countBlocks(blocks) };
}

function countBlocks(blocks) {
    let count = 0;
    for (const b of blocks) {
        count++;
        if (b.children) count += countBlocks(b.children);
    }
    return count;
}

module.exports = { exportBlocks };
