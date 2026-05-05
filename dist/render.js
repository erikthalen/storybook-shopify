import { Liquid } from 'liquidjs';
import { globalContext } from './fixtures.js';
import { parseSchemaDefaults } from './schema-parser.js';
// Shopify-only block tags that must be stripped before LiquidJS parses a template.
// Applied both to top-level templates and to snippets loaded via {% render %}.
// Strip entirely — content is irrelevant in preview
const STRIP_BLOCKS_RE = /\{%-?\s*(?:doc|schema|javascript)\s*-?%\}[\s\S]*?\{%-?\s*end(?:doc|schema|javascript)\s*-?%\}/g;
// Block tags whose inner content should be preserved but the wrapper replaced
const STYLESHEET_BLOCK_RE = /\{%-?\s*stylesheet\s*-?%\}([\s\S]*?)\{%-?\s*endstylesheet\s*-?%\}/g;
const STYLE_BLOCK_RE = /\{%-?\s*style\s*-?%\}([\s\S]*?)\{%-?\s*endstyle\s*-?%\}/g;
// {% paginate … %} … {% endpaginate %} → keep inner content only
const PAGINATE_BLOCK_RE = /\{%-?\s*paginate\b[^%]*?-?%\}([\s\S]*?)\{%-?\s*endpaginate\s*-?%\}/g;
// Single-line Shopify-only tags that have no meaningful equivalent in preview
const STRIP_SINGLE_TAGS_RE = /\{%-?\s*(?:layout|sections?)\b[^%]*?-?%\}/g;
// Snippets are registered at preview startup by entry-preview.ts via registerSnippets().
// The map is mutated in place so the engine's FS closure always sees the current state.
const snippets = {};
export function registerSnippets(map) {
    Object.assign(snippets, map);
}
const engine = new Liquid({
    strictFilters: false,
    strictVariables: false,
    greedy: false,
    trimTagLeft: false,
    trimTagRight: false,
    relativeReference: false, // snippets are looked up by name, not relative path
    // Engine-level globals are visible in all scopes, including isolated {% render %} calls.
    // Story args and section context are merged on top and always win.
    globals: globalContext,
    // In-memory FS so LiquidJS's built-in {% render %} tag resolves snippets
    // from the snippets map rather than the real filesystem.
    // Scope isolation (render vs include semantics) is handled by LiquidJS.
    fs: {
        resolve(_root, file, ext) {
            return file.endsWith(ext) ? file : file + ext;
        },
        existsSync() {
            return true; // unknown snippets render as empty string
        },
        readFileSync(file) {
            const name = file.replace(/\.liquid$/, '').replace(/^\.?\//, '');
            return stripShopifyOnlyBlocks(snippets[name] ?? '');
        },
        async exists() {
            return true;
        },
        async readFile(file) {
            const name = file.replace(/\.liquid$/, '').replace(/^\.?\//, '');
            return stripShopifyOnlyBlocks(snippets[name] ?? '');
        },
    },
});
// --- Shopify custom tags ---
// {% form 'type', object, key: value, … %} → <form key="value" …>…</form>
// Keyword args (key: value) are evaluated and rendered as HTML attributes.
// Positional args are ignored (they carry Shopify server-side context).
engine.registerTag('form', {
    parse(token, remainTokens) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const self = this;
        self.templates = [];
        self.attrs = parseFormHtmlAttrs(token.args ?? '');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = self.liquid.parser.parseStream(remainTokens);
        stream
            .on('tag:endform', () => stream.stop())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .on('template', (tpl) => self.templates.push(tpl))
            .on('end', () => { });
        stream.start();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    *render(ctx, emitter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const self = this;
        const parts = [];
        for (const { key, rawValue } of self.attrs) {
            try {
                const val = self.liquid.evalValueSync(rawValue, ctx);
                if (val == null)
                    continue;
                const str = String(val);
                parts.push(str === '' ? key : `${key}="${str.replace(/"/g, '&quot;')}"`);
            }
            catch { /* skip unresolvable expressions */ }
        }
        emitter.write(`<form${parts.length ? ' ' + parts.join(' ') : ''}>`);
        yield self.liquid.renderer.renderTemplates(self.templates, ctx, emitter);
        emitter.write('</form>');
    },
});
// {% content_for 'block', type: 'block-type', id: 'block-id' %}
// Renders the matching block template from the snippets map with a block context.
// content_for 'blocks' (all blocks) renders nothing — not enough context at preview time.
engine.registerTag('content_for', {
    parse(token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const self = this;
        const attrs = parseFormHtmlAttrs(token.args ?? '');
        self.typeRaw = attrs.find((a) => a.key === 'type')?.rawValue ?? null;
        self.idRaw = attrs.find((a) => a.key === 'id')?.rawValue ?? '';
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    *render(ctx, emitter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const self = this;
        if (!self.typeRaw)
            return; // content_for 'blocks' — nothing to render
        let blockType;
        let blockId;
        try {
            blockType = String(self.liquid.evalValueSync(self.typeRaw, ctx));
            blockId = self.idRaw ? String(self.liquid.evalValueSync(self.idRaw, ctx)) : '';
        }
        catch {
            return;
        }
        const blockTemplate = snippets[blockType] ?? '';
        if (!blockTemplate)
            return;
        const blockSettings = parseSchemaDefaults(blockTemplate);
        ctx.push({ block: { id: blockId, type: blockType, settings: blockSettings } });
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tpls = self.liquid.parse(stripShopifyOnlyBlocks(blockTemplate));
            yield self.liquid.renderer.renderTemplates(tpls, ctx, emitter);
        }
        finally {
            ctx.pop();
        }
    },
});
// --- Shopify money filters ---
const formatMoney = (cents, currencyCode = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(cents / 100);
engine.registerFilter('money', (v) => formatMoney(v));
engine.registerFilter('money_with_currency', (v) => `${formatMoney(v)} USD`);
engine.registerFilter('money_without_currency', (v) => (v / 100).toFixed(2));
engine.registerFilter('money_without_trailing_zeros', (v) => {
    const amount = v / 100;
    return amount % 1 === 0
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
        : formatMoney(v);
});
// --- Shopify URL filters ---
engine.registerFilter('asset_url', (v) => `/assets/${v}`);
engine.registerFilter('global_asset_url', (v) => `/assets/${v}`);
engine.registerFilter('shopify_asset_url', (v) => `/assets/${v}`);
engine.registerFilter('img_url', (v, size) => (size ? `${v}?width=${size}` : v));
engine.registerFilter('image_url', (v, params) => {
    const src = typeof v === 'string' ? v : v?.src ?? '';
    const width = params?.width;
    return width ? `${src}?width=${width}` : src;
});
engine.registerFilter('file_url', (v) => `/files/${v}`);
engine.registerFilter('file_img_url', (v, size) => (size ? `/files/${v}?width=${size}` : `/files/${v}`));
// --- Shopify string filters ---
engine.registerFilter('handle', (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
engine.registerFilter('handleize', (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
// --- Shopify HTML tag filters ---
engine.registerFilter('img_tag', (src, alt = '', css = '') => `<img src="${src}" alt="${alt}"${css ? ` class="${css}"` : ''} />`);
engine.registerFilter('script_tag', (src) => `<script src="${src}"></script>`);
engine.registerFilter('stylesheet_tag', (href, media = 'all') => `<link rel="stylesheet" href="${href}" media="${media}" />`);
engine.registerFilter('link_to', (label, url, title = '') => `<a href="${url}"${title ? ` title="${title}"` : ''}>${label}</a>`);
// --- Shopify misc filters ---
engine.registerFilter('weight_with_unit', (grams, unit = 'kg') => {
    const kg = grams / 1000;
    return `${unit === 'kg' ? kg.toFixed(2) : grams} ${unit}`;
});
engine.registerFilter('t', (key, ...args) => {
    // Stub: returns the last part of the translation key so output is readable
    const label = key.split('.').pop() ?? key;
    return args.length ? `${label} (${args.join(', ')})` : label;
});
engine.registerFilter('json', (v) => JSON.stringify(v));
engine.registerFilter('base64_encode', (v) => btoa(v));
engine.registerFilter('base64_decode', (v) => atob(v));
engine.registerFilter('md5', (v) => v); // stub — no crypto in browser without async
engine.registerFilter('sha1', (v) => v);
engine.registerFilter('sha256', (v) => v);
engine.registerFilter('hmac_sha1', (v) => v);
engine.registerFilter('hmac_sha256', (v) => v);
// placeholder_svg_tag stub
engine.registerFilter('placeholder_svg_tag', (type, css = '') => `<svg class="placeholder-svg${css ? ` ${css}` : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ccc">${type}</text></svg>`);
function stripShopifyOnlyBlocks(template) {
    return template
        .replace(STRIP_BLOCKS_RE, '')
        .replace(STYLESHEET_BLOCK_RE, '<style>$1</style>')
        .replace(STYLE_BLOCK_RE, '<style>$1</style>')
        .replace(PAGINATE_BLOCK_RE, '$1')
        .replace(STRIP_SINGLE_TAGS_RE, '');
}
// Split a Liquid tag args string by top-level commas (not inside quotes)
function splitLiquidArgs(args) {
    const parts = [];
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let current = '';
    for (let i = 0; i < args.length; i++) {
        const ch = args[i];
        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            current += ch;
            continue;
        }
        if (ch === '"' && !inSingle) {
            inDouble = !inDouble;
            current += ch;
            continue;
        }
        if (!inSingle && !inDouble) {
            if (ch === '{' || ch === '[' || ch === '(') {
                depth++;
                current += ch;
                continue;
            }
            if (ch === '}' || ch === ']' || ch === ')') {
                depth--;
                current += ch;
                continue;
            }
            if (ch === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
                continue;
            }
        }
        current += ch;
    }
    if (current.trim())
        parts.push(current.trim());
    return parts;
}
// Extract HTML-attribute key:value pairs from a Liquid form tag args string.
// Positional args (e.g. 'product', product) are skipped; only `key: value`
// pairs where the key matches a valid HTML attribute pattern are returned.
function parseFormHtmlAttrs(args) {
    const result = [];
    for (const part of splitLiquidArgs(args)) {
        const m = part.match(/^([\w-]+)\s*:\s*(.+)$/s);
        if (!m)
            continue;
        result.push({ key: m[1], rawValue: m[2].trim() });
    }
    return result;
}
// Public helper: render a Liquid template string against an arbitrary context.
// Use this in story render() functions when you need to reshape args before
// passing them to Liquid (e.g. wrapping flat args into section.settings).
export function renderTemplate(template, context) {
    return engine.parseAndRenderSync(stripShopifyOnlyBlocks(template), context, {
        globals: { ...globalContext, ...context },
    });
}
export const render = (args, context) => {
    const { component } = context;
    if (typeof component === 'function') {
        return component(args, context);
    }
    if (typeof component === 'string') {
        return renderTemplate(component, args);
    }
    throw new Error(`storybook-shopify: component must be a Liquid template string or a function. Received: ${typeof component}`);
};
export function renderToCanvas({ storyFn, kind, name, showMain, showError }, canvasElement) {
    try {
        const html = storyFn();
        showMain();
        canvasElement.innerHTML = html;
    }
    catch (err) {
        showError({
            title: `Error rendering Liquid story: "${name}" of "${kind}"`,
            description: err instanceof Error ? err.message : String(err),
        });
    }
}
//# sourceMappingURL=render.js.map