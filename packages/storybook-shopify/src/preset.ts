import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { Options, PresetProperty } from 'storybook/internal/types';
import type { InlineConfig } from 'vite';

import type { FrameworkOptions } from './types.js';

// core: wires together the Vite builder and our renderer preset
export const core: PresetProperty<'core'> = {
  builder: import.meta.resolve('@storybook/builder-vite'),
  renderer: import.meta.resolve('./renderer-preset.js'),
};

// viteFinal: adds .liquid → raw-string plugin and injects framework options
// + snippets into the preview via virtual modules
export async function viteFinal(config: InlineConfig, options: Options): Promise<InlineConfig> {
  const framework = (options as Options & { framework?: { options?: FrameworkOptions } }).framework;
  const frameworkOptions: FrameworkOptions = framework?.options ?? {};
  const renderDocTags = frameworkOptions.renderDocTags ?? false;
  const root = config.root ?? process.cwd();

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      liquidPlugin(),
      shopifyOptionsPlugin({ renderDocTags }),
      shopifySnippetsPlugin(root),
    ],
  };
}

// Transforms .liquid imports into raw template strings
function liquidPlugin() {
  return {
    name: 'vite-plugin-liquid',
    transform(code: string, id: string) {
      if (!id.endsWith('.liquid')) return;
      return {
        code: `export default ${JSON.stringify(code)}`,
        map: null,
      };
    },
  };
}

// Exposes framework options to the preview as a virtual module
function shopifyOptionsPlugin(opts: { renderDocTags: boolean }) {
  const MODULE_ID = 'virtual:storybook-shopify-options';
  const RESOLVED_ID = '\0' + MODULE_ID;

  return {
    name: 'vite-plugin-storybook-shopify-options',
    resolveId(id: string) {
      if (id === MODULE_ID) return RESOLVED_ID;
    },
    load(id: string) {
      if (id === RESOLVED_ID) {
        return `export const shopifyOptions = ${JSON.stringify(opts)};`;
      }
    },
  };
}

// Scans snippets/ at the project root and exposes all .liquid files as a
// virtual module so the LiquidJS engine can resolve {% render 'name' %} calls.
function shopifySnippetsPlugin(root: string) {
  const MODULE_ID = 'virtual:storybook-shopify-snippets';
  const RESOLVED_ID = '\0' + MODULE_ID;

  return {
    name: 'vite-plugin-storybook-shopify-snippets',
    resolveId(id: string) {
      if (id === MODULE_ID) return RESOLVED_ID;
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return;
      return `export const snippets = ${JSON.stringify(loadSnippets(root))};`;
    },
    // Invalidate whenever a snippet file changes so HMR picks up the edit
    handleHotUpdate({ file, server }: { file: string; server: { moduleGraph: { getModuleById: (id: string) => unknown; invalidateModule: (mod: unknown) => void } } }) {
      if (!file.endsWith('.liquid')) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
    },
  };
}

function loadSnippets(root: string): Record<string, string> {
  const snippetsDir = join(root, 'snippets');
  if (!existsSync(snippetsDir)) return {};

  const result: Record<string, string> = {};
  for (const file of readdirSync(snippetsDir)) {
    if (!file.endsWith('.liquid')) continue;
    const name = file.replace(/\.liquid$/, '');
    result[name] = readFileSync(join(snippetsDir, file), 'utf-8');
  }
  return result;
}
