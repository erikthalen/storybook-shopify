import type { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import { Liquid } from 'liquidjs';

import type { ShopifyRenderer } from './types.js';

// Shopify-only block tags that must be stripped before LiquidJS parses a template.
// Applied both to top-level templates and to snippets loaded via {% render %}.

// Strip entirely — content is irrelevant in preview
const STRIP_BLOCKS_RE =
  /\{%-?\s*(?:doc|schema|javascript)\s*-?%\}[\s\S]*?\{%-?\s*end(?:doc|schema|javascript)\s*-?%\}/g;

// Block tags whose inner content should be preserved but the wrapper replaced
const STYLESHEET_BLOCK_RE =
  /\{%-?\s*stylesheet\s*-?%\}([\s\S]*?)\{%-?\s*endstylesheet\s*-?%\}/g;
const STYLE_BLOCK_RE =
  /\{%-?\s*style\s*-?%\}([\s\S]*?)\{%-?\s*endstyle\s*-?%\}/g;

// {% paginate … %} … {% endpaginate %} → keep inner content only
const PAGINATE_BLOCK_RE =
  /\{%-?\s*paginate\b[^%]*?-?%\}([\s\S]*?)\{%-?\s*endpaginate\s*-?%\}/g;

// Single-line Shopify-only tags that have no meaningful equivalent in preview
const STRIP_SINGLE_TAGS_RE =
  /\{%-?\s*(?:layout|sections?|content_for)\b[^%]*?-?%\}/g;

// Snippets are registered at preview startup by entry-preview.ts via registerSnippets().
// The map is mutated in place so the engine's FS closure always sees the current state.
const snippets: Record<string, string> = {};

export function registerSnippets(map: Record<string, string>): void {
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
    resolve(_root: string, file: string, ext: string) {
      return file.endsWith(ext) ? file : file + ext;
    },
    existsSync() {
      return true; // unknown snippets render as empty string
    },
    readFileSync(file: string) {
      const name = file.replace(/\.liquid$/, '').replace(/^\.?\//, '');
      return stripShopifyOnlyBlocks(snippets[name] ?? '');
    },
    async exists() {
      return true;
    },
    async readFile(file: string) {
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
  parse(token: { args?: string }, remainTokens: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as any;
    self.templates = [];
    self.attrs = parseFormHtmlAttrs(token.args ?? '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (self.liquid.parser as any).parseStream(remainTokens);
    stream
      .on('tag:endform', () => stream.stop())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('template', (tpl: any) => self.templates.push(tpl))
      .on('end', () => { /* unterminated form — ignore */ });
    stream.start();
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  *render(ctx: any, emitter: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as any;
    const parts: string[] = [];
    for (const { key, rawValue } of self.attrs as Array<{ key: string; rawValue: string }>) {
      try {
        const val = self.liquid.evalValueSync(rawValue, ctx);
        if (val == null) continue;
        const str = String(val);
        parts.push(str === '' ? key : `${key}="${str.replace(/"/g, '&quot;')}"`);
      } catch { /* skip unresolvable expressions */ }
    }
    emitter.write(`<form${parts.length ? ' ' + parts.join(' ') : ''}>`);
    yield self.liquid.renderer.renderTemplates(self.templates, ctx, emitter);
    emitter.write('</form>');
  },
});

// --- Shopify money filters ---

const formatMoney = (cents: number, currencyCode = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(cents / 100);

engine.registerFilter('money', (v: number) => formatMoney(v));
engine.registerFilter('money_with_currency', (v: number) => `${formatMoney(v)} USD`);
engine.registerFilter('money_without_currency', (v: number) => (v / 100).toFixed(2));
engine.registerFilter('money_without_trailing_zeros', (v: number) => {
  const amount = v / 100;
  return amount % 1 === 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
    : formatMoney(v);
});

// --- Shopify URL filters ---

engine.registerFilter('asset_url', (v: string) => `/assets/${v}`);
engine.registerFilter('global_asset_url', (v: string) => `/assets/${v}`);
engine.registerFilter('shopify_asset_url', (v: string) => `/assets/${v}`);
engine.registerFilter('img_url', (v: string, size?: string) => (size ? `${v}?width=${size}` : v));
engine.registerFilter('image_url', (v: unknown, params?: Record<string, unknown>) => {
  const src = typeof v === 'string' ? v : (v as Record<string, string>)?.src ?? '';
  const width = params?.width;
  return width ? `${src}?width=${width}` : src;
});
engine.registerFilter('file_url', (v: string) => `/files/${v}`);
engine.registerFilter('file_img_url', (v: string, size?: string) => (size ? `/files/${v}?width=${size}` : `/files/${v}`));

// --- Shopify string filters ---

engine.registerFilter('handle', (v: string) =>
  String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
);
engine.registerFilter('handleize', (v: string) =>
  String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
);

// --- Shopify HTML tag filters ---

engine.registerFilter('img_tag', (src: string, alt = '', css = '') =>
  `<img src="${src}" alt="${alt}"${css ? ` class="${css}"` : ''} />`
);
engine.registerFilter('script_tag', (src: string) =>
  `<script src="${src}"></script>`
);
engine.registerFilter('stylesheet_tag', (href: string, media = 'all') =>
  `<link rel="stylesheet" href="${href}" media="${media}" />`
);
engine.registerFilter('link_to', (label: string, url: string, title = '') =>
  `<a href="${url}"${title ? ` title="${title}"` : ''}>${label}</a>`
);

// --- Shopify misc filters ---

engine.registerFilter('weight_with_unit', (grams: number, unit = 'kg') => {
  const kg = grams / 1000;
  return `${unit === 'kg' ? kg.toFixed(2) : grams} ${unit}`;
});
engine.registerFilter('t', (key: string, ...args: unknown[]) => {
  // Stub: returns the last part of the translation key so output is readable
  const label = key.split('.').pop() ?? key;
  return args.length ? `${label} (${args.join(', ')})` : label;
});
engine.registerFilter('json', (v: unknown) => JSON.stringify(v));
engine.registerFilter('base64_encode', (v: string) => btoa(v));
engine.registerFilter('base64_decode', (v: string) => atob(v));
engine.registerFilter('md5', (v: string) => v); // stub — no crypto in browser without async
engine.registerFilter('sha1', (v: string) => v);
engine.registerFilter('sha256', (v: string) => v);
engine.registerFilter('hmac_sha1', (v: string) => v);
engine.registerFilter('hmac_sha256', (v: string) => v);

// placeholder_svg_tag stub
engine.registerFilter('placeholder_svg_tag', (type: string, css = '') =>
  `<svg class="placeholder-svg${css ? ` ${css}` : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ccc">${type}</text></svg>`
);

function stripShopifyOnlyBlocks(template: string): string {
  return template
    .replace(STRIP_BLOCKS_RE, '')
    .replace(STYLESHEET_BLOCK_RE, '<style>$1</style>')
    .replace(STYLE_BLOCK_RE, '<style>$1</style>')
    .replace(PAGINATE_BLOCK_RE, '$1')
    .replace(STRIP_SINGLE_TAGS_RE, '');
}

// Split a Liquid tag args string by top-level commas (not inside quotes)
function splitLiquidArgs(args: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let current = '';
  for (let i = 0; i < args.length; i++) {
    const ch = args[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
    if (!inSingle && !inDouble) {
      if (ch === '{' || ch === '[' || ch === '(') { depth++; current += ch; continue; }
      if (ch === '}' || ch === ']' || ch === ')') { depth--; current += ch; continue; }
      if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; continue; }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// Extract HTML-attribute key:value pairs from a Liquid form tag args string.
// Positional args (e.g. 'product', product) are skipped; only `key: value`
// pairs where the key matches a valid HTML attribute pattern are returned.
function parseFormHtmlAttrs(args: string): Array<{ key: string; rawValue: string }> {
  const result: Array<{ key: string; rawValue: string }> = [];
  for (const part of splitLiquidArgs(args)) {
    const m = part.match(/^([\w-]+)\s*:\s*(.+)$/s);
    if (!m) continue;
    result.push({ key: m[1], rawValue: m[2].trim() });
  }
  return result;
}

// Public helper: render a Liquid template string against an arbitrary context.
// Use this in story render() functions when you need to reshape args before
// passing them to Liquid (e.g. wrapping flat args into section.settings).
export function renderTemplate(
  template: string,
  context: Record<string, unknown>
): string {
  return engine.parseAndRenderSync(stripShopifyOnlyBlocks(template), context);
}

export const render: ArgsStoryFn<ShopifyRenderer> = (args, context) => {
  const { component } = context;

  if (typeof component === 'function') {
    return component(args, context);
  }

  if (typeof component === 'string') {
    return renderTemplate(component, args as Record<string, unknown>);
  }

  throw new Error(
    `storybook-shopify: component must be a Liquid template string or a function. Received: ${typeof component}`
  );
};

export function renderToCanvas(
  { storyFn, kind, name, showMain, showError }: RenderContext<ShopifyRenderer>,
  canvasElement: ShopifyRenderer['canvasElement']
) {
  try {
    const html = storyFn();
    showMain();
    canvasElement.innerHTML = html;
  } catch (err) {
    showError({
      title: `Error rendering Liquid story: "${name}" of "${kind}"`,
      description: err instanceof Error ? err.message : String(err),
    });
  }
}
