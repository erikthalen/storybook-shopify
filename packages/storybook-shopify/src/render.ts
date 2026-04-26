import type { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import { Liquid } from 'liquidjs';

import type { ShopifyRenderer } from './types.js';

// Shopify-only block tags that must be stripped before LiquidJS parses a template.
// Applied both to top-level templates and to snippets loaded via {% render %}.
const STRIP_BLOCKS_RE =
  /\{%-?\s*(?:doc|schema)\s*-?%\}[\s\S]*?\{%-?\s*end(?:doc|schema)\s*-?%\}/g;

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
      return (snippets[name] ?? '').replace(STRIP_BLOCKS_RE, '');
    },
    async exists() {
      return true;
    },
    async readFile(file: string) {
      const name = file.replace(/\.liquid$/, '').replace(/^\.?\//, '');
      return (snippets[name] ?? '').replace(STRIP_BLOCKS_RE, '');
    },
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
  return template.replace(STRIP_BLOCKS_RE, '');
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
