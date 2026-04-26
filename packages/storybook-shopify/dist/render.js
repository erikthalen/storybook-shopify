import { Liquid } from 'liquidjs';
// Shopify-only block tags that must be stripped before LiquidJS parses a template.
// Applied both to top-level templates and to snippets loaded via {% render %}.
const STRIP_BLOCKS_RE = /\{%-?\s*(?:doc|schema)\s*-?%\}[\s\S]*?\{%-?\s*end(?:doc|schema)\s*-?%\}/g;
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
            return (snippets[name] ?? '').replace(STRIP_BLOCKS_RE, '');
        },
        async exists() {
            return true;
        },
        async readFile(file) {
            const name = file.replace(/\.liquid$/, '').replace(/^\.?\//, '');
            return (snippets[name] ?? '').replace(STRIP_BLOCKS_RE, '');
        },
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
    return template.replace(STRIP_BLOCKS_RE, '');
}
// Public helper: render a Liquid template string against an arbitrary context.
// Use this in story render() functions when you need to reshape args before
// passing them to Liquid (e.g. wrapping flat args into section.settings).
export function renderTemplate(template, context) {
    return engine.parseAndRenderSync(stripShopifyOnlyBlocks(template), context);
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