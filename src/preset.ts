import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname, relative } from 'node:path';

import type { Options, PresetProperty } from 'storybook/internal/types';
import type { FrameworkOptions } from './types.js';
import type { InlineConfig } from 'vite';

import { parseSchemaDefaults, parsePresets } from './schema-parser.js';
import { buildAutoStory, buildAutoTitle, shouldSkipLiquidFile } from './auto-story-builder.js';

// core: wires together the Vite builder and our renderer preset
export const core: PresetProperty<'core'> = {
  builder: import.meta.resolve('@storybook/builder-vite'),
  renderer: import.meta.resolve('./renderer-preset.js'),
};

// stories: when generateAutomaticStories is enabled, writes a basic .stories.js
// file for every non-private .liquid file in sections/, snippets/, and blocks/,
// then adds the generated directory to Storybook's story patterns.
export const stories: PresetProperty<'stories'> = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existing: any[] = [],
  options: Options
) => {
  const frameworkOptions = await getFrameworkOptions(options);
  if ((frameworkOptions.generateAutomaticStories ?? true) === false) return existing;

  const configDir = (options as Options & { configDir: string }).configDir;
  const root = join(configDir, '..');
  const autoDir = join(configDir, '.auto');

  if (existsSync(autoDir)) rmSync(autoDir, { recursive: true, force: true });
  mkdirSync(autoDir, { recursive: true });

  const existingTitles = collectStoryTitles(root, autoDir);
  const dirs = ['sections', 'snippets', 'blocks'] as const;

  for (const dir of dirs) {
    const dirPath = join(root, dir);
    if (!existsSync(dirPath)) continue;

    for (const file of readdirSync(dirPath)) {
      if (!file.endsWith('.liquid') || shouldSkipLiquidFile(file)) continue;

      const autoTitle = buildAutoTitle(dir, file);
      if (existingTitles.has(autoTitle)) continue;

      const storyFile = `${dir}--${file.replace(/\.liquid$/, '')}.stories.js`;
      const liquidRelPath = relative(autoDir, join(dirPath, file)).replace(/\\/g, '/');
      const content = readFileSync(join(dirPath, file), 'utf-8');
      const defaults = parseSchemaDefaults(content);
      const presetsInfo = parsePresets(content);

      writeFileSync(join(autoDir, storyFile), buildAutoStory(dir, file, liquidRelPath, defaults, presetsInfo));
    }
  }

  return [...existing, join(autoDir, '*.stories.js')];
};

// Walk the project root (excluding the auto dir) and collect all `title:` values
// from story files so we can skip auto-generating stories that already exist.
function collectStoryTitles(root: string, autoDir: string): Set<string> {
  const titles = new Set<string>();
  const STORY_FILE_RE = /\.stories\.[jt]sx?$/;
  const TITLE_RE = /\btitle\s*:\s*['"`]([^'"`\n]+)['"`]/;

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (full === autoDir) continue;
        walk(full);
      } else if (STORY_FILE_RE.test(entry.name)) {
        try {
          const src = readFileSync(full, 'utf-8');
          const m = src.match(TITLE_RE);
          if (m) titles.add(m[1]);
        } catch { /* unreadable file — skip */ }
      }
    }
  }

  walk(root);
  return titles;
}


// viteFinal: adds .liquid → raw-string plugin and injects framework options
// + snippets into the preview via virtual modules
type Presets = { apply: <T>(key: string, config?: T) => Promise<T> };

async function getFrameworkOptions(options: Options): Promise<FrameworkOptions> {
  const presets = (options as unknown as { presets: Presets }).presets;
  return presets.apply<FrameworkOptions>('frameworkOptions', {} as FrameworkOptions);
}

export async function viteFinal(config: InlineConfig, options: Options): Promise<InlineConfig> {
  const frameworkOptions = await getFrameworkOptions(options);
  const renderDocTags = frameworkOptions.renderDocTags ?? true;
  const viteEntries = frameworkOptions.viteEntries ?? [];
  // configDir is the .storybook folder; the project root is one level up.
  const root = join((options as Options & { configDir: string }).configDir, '..');

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      liquidPlugin(),
      shopifyOptionsPlugin({ renderDocTags }),
      shopifySnippetsPlugin(root),
      ...(viteEntries.length > 0 ? [
        themeAssetsPlugin(root),
        themeAssetsConfigPlugin(root, viteEntries),
      ] : []),
    ],
  };
}

export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (entry: string[] = [], options: Options) => {
  const frameworkOptions = await getFrameworkOptions(options);
  if ((frameworkOptions.viteEntries ?? []).length === 0) return entry;
  return [...entry, fileURLToPath(import.meta.resolve('./theme-assets-preview.js'))];
};

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
  const result: Record<string, string> = {};
  for (const dir of ['snippets', 'blocks']) {
    const dirPath = join(root, dir);
    if (!existsSync(dirPath)) continue;
    for (const file of readdirSync(dirPath)) {
      if (!file.endsWith('.liquid')) continue;
      const name = file.replace(/\.liquid$/, '');
      result[name] = readFileSync(join(dirPath, file), 'utf-8');
    }
  }
  return result;
}

// Resolves viteEntries against the built manifest and exposes the resulting
// script/style URLs as a virtual module consumed by theme-assets-preview.ts.
function themeAssetsConfigPlugin(root: string, viteEntries: string[]) {
  const MODULE_ID = 'virtual:storybook-shopify-theme-assets-config';
  const RESOLVED_ID = '\0' + MODULE_ID;

  type Chunk = { file: string; css?: string[] };
  let manifest: Record<string, Chunk> = {};
  const manifestPath = join(root, 'assets', 'manifest.json');
  if (existsSync(manifestPath)) {
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')); } catch {}
  }

  const scripts: string[] = [];
  const styles: string[] = [];
  for (const entry of viteEntries) {
    const chunk = manifest[entry] ?? manifest['src/' + entry];
    if (!chunk) continue;
    if (chunk.file.endsWith('.css')) {
      styles.push('/assets/' + chunk.file);
    } else {
      scripts.push('/assets/' + chunk.file);
    }
    for (const css of chunk.css ?? []) styles.push('/assets/' + css);
  }

  return {
    name: 'vite-plugin-theme-assets-config',
    resolveId(id: string) {
      if (id === MODULE_ID) return RESOLVED_ID;
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return;
      return `
export const SCRIPTS = ${JSON.stringify(scripts)};
export const STYLES = ${JSON.stringify(styles)};
`;
    },
  };
}

// Serves the theme's assets/ directory at /assets/ in the Storybook dev server
// so the production asset fallback in previewHead can reach manifest.json and
// compiled JS/CSS without any extra static-dir configuration.
function themeAssetsPlugin(root: string) {
  const assetsDir = join(root, 'assets');
  const MIME: Record<string, string> = {
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  return {
    name: 'vite-plugin-theme-assets',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: { url?: string }, res: { writeHead: (s: number, h: Record<string, string>) => void; end: (msg?: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use('/assets', (req, res, next) => {
        const filePath = join(assetsDir, req.url ?? '/');
        if (!existsSync(filePath) || !statSync(filePath).isFile()) return next();
        const mime = MIME[extname(filePath)] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        createReadStream(filePath).pipe(res as unknown as import('node:stream').Writable);
      });
    },
  };
}
