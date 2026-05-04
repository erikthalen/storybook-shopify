# Preset-Driven Auto Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-generated section stories now produce one Storybook story per `presets` entry in the section schema, with block args resolved from preset + block-type defaults.

**Architecture:** Add `parsePresets()` to `schema-parser.ts` to extract preset+block data. Extract `buildAutoStory` + `buildAutoTitle` from `preset.ts` into a new `auto-story-builder.ts` (pure, no FS/Storybook deps) so it can be unit-tested. Wire `parsePresets` into `preset.ts`'s story loop and pass the result to `buildAutoStory`.

**Tech Stack:** TypeScript, vitest (new), Node built-ins, LiquidJS (not touched)

---

## File Map

| Action   | Path |
|----------|------|
| Modify   | `packages/storybook-shopify/package.json` |
| Create   | `packages/storybook-shopify/vitest.config.ts` |
| Modify   | `packages/storybook-shopify/src/schema-parser.ts` |
| Create   | `packages/storybook-shopify/src/schema-parser.test.ts` |
| Create   | `packages/storybook-shopify/src/auto-story-builder.ts` |
| Create   | `packages/storybook-shopify/src/auto-story-builder.test.ts` |
| Modify   | `packages/storybook-shopify/src/preset.ts` |

---

## Task 1: Set up vitest

**Files:**
- Modify: `packages/storybook-shopify/package.json`
- Create: `packages/storybook-shopify/vitest.config.ts`

- [ ] **Step 1: Add vitest to devDependencies and test script**

In `packages/storybook-shopify/package.json`, add `"vitest": "^2.0.0"` to `devDependencies` and `"test": "vitest run"` to `scripts`:

```json
{
  "name": "storybook-shopify",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -p tsconfig.json --watch",
    "test": "vitest run"
  },
  "devDependencies": {
    "@storybook/builder-vite": "^10.0.0",
    "@types/node": "^25.6.0",
    "storybook": "^10.0.0",
    "typescript": "^5.0.0",
    "vite": "^8.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create vitest config**

Create `packages/storybook-shopify/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Install and verify**

```bash
cd packages/storybook-shopify && pnpm install
```

- [ ] **Step 4: Write a trivial test to confirm the runner works**

Create `packages/storybook-shopify/src/schema-parser.test.ts` with just:

```typescript
import { describe, it, expect } from 'vitest';
import { parseSchemaDefaults } from './schema-parser.js';

describe('parseSchemaDefaults (smoke)', () => {
  it('returns empty object for template with no schema', () => {
    expect(parseSchemaDefaults('no schema here')).toEqual({});
  });
});
```

- [ ] **Step 5: Run to confirm green**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add packages/storybook-shopify/package.json packages/storybook-shopify/vitest.config.ts packages/storybook-shopify/src/schema-parser.test.ts packages/storybook-shopify/pnpm-lock.yaml
git commit -m "chore: add vitest to storybook-shopify package"
```

---

## Task 2: Add `parsePresets` to schema-parser.ts

**Files:**
- Modify: `packages/storybook-shopify/src/schema-parser.ts`
- Modify: `packages/storybook-shopify/src/schema-parser.test.ts`

- [ ] **Step 1: Write the failing tests**

Replace `packages/storybook-shopify/src/schema-parser.test.ts` with:

```typescript
import { describe, it, expect } from 'vitest';
import { parseSchemaDefaults, parsePresets } from './schema-parser.js';

describe('parseSchemaDefaults (smoke)', () => {
  it('returns empty object for template with no schema', () => {
    expect(parseSchemaDefaults('no schema here')).toEqual({});
  });
});

describe('parsePresets', () => {
  it('returns null when no schema block present', () => {
    expect(parsePresets('no schema here')).toBeNull();
  });

  it('returns null when schema has no presets key', () => {
    const template = `{% schema %}{"name": "Test", "settings": []}{% endschema %}`;
    expect(parsePresets(template)).toBeNull();
  });

  it('returns null when presets array is empty', () => {
    const template = `{% schema %}{"presets": []}{% endschema %}`;
    expect(parsePresets(template)).toBeNull();
  });

  it('returns preset with no blocks for a simple preset', () => {
    const template = `{% schema %}{"presets": [{"name": "Space"}]}{% endschema %}`;
    expect(parsePresets(template)).toEqual({
      hasBlocks: false,
      presets: [{ name: 'Space' }],
    });
  });

  it('returns hasBlocks true when schema defines block types', () => {
    const template = `{% schema %}{
      "blocks": [{"type": "item", "settings": []}],
      "presets": [{"name": "My Section"}]
    }{% endschema %}`;
    expect(parsePresets(template)).toEqual({
      hasBlocks: true,
      presets: [{ name: 'My Section' }],
    });
  });

  it('resolves block defaults from schema block type definitions', () => {
    const template = `{% schema %}{
      "blocks": [
        {
          "type": "item",
          "settings": [
            {"type": "text", "id": "text", "label": "Text", "default": "Announcement"},
            {"type": "url", "id": "url", "label": "Link"}
          ]
        }
      ],
      "presets": [
        {"name": "Announcement bar", "blocks": [{"type": "item"}]}
      ]
    }{% endschema %}`;
    expect(parsePresets(template)).toEqual({
      hasBlocks: true,
      presets: [
        {
          name: 'Announcement bar',
          blocks: [{ type: 'item', settings: { text: 'Announcement' } }],
        },
      ],
    });
  });

  it('preset block settings override block type defaults', () => {
    const template = `{% schema %}{
      "blocks": [
        {"type": "item", "settings": [{"type": "text", "id": "text", "default": "Default"}]}
      ],
      "presets": [
        {"name": "Custom", "blocks": [{"type": "item", "settings": {"text": "Override"}}]}
      ]
    }{% endschema %}`;
    const result = parsePresets(template);
    expect(result?.presets[0].blocks?.[0].settings).toEqual({ text: 'Override' });
  });

  it('handles blocks with no schema defaults (empty settings object)', () => {
    const template = `{% schema %}{
      "blocks": [{"type": "_cart-drawer"}],
      "presets": [{"name": "Header", "blocks": [{"type": "_cart-drawer"}]}]
    }{% endschema %}`;
    expect(parsePresets(template)).toEqual({
      hasBlocks: true,
      presets: [
        { name: 'Header', blocks: [{ type: '_cart-drawer', settings: {} }] },
      ],
    });
  });

  it('handles multiple presets', () => {
    const template = `{% schema %}{
      "presets": [{"name": "Foo"}, {"name": "Bar"}]
    }{% endschema %}`;
    const result = parsePresets(template);
    expect(result?.presets).toHaveLength(2);
    expect(result?.presets[0].name).toBe('Foo');
    expect(result?.presets[1].name).toBe('Bar');
  });
});
```

- [ ] **Step 2: Run — expect failures**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: `parsePresets is not a function` errors.

- [ ] **Step 3: Add types and implement `parsePresets` in schema-parser.ts**

Add the following at the bottom of `packages/storybook-shopify/src/schema-parser.ts` (before the closing of the file, after `resolveControl`):

```typescript
export interface ResolvedPreset {
  name: string;
  blocks?: Array<{ type: string; settings: Record<string, unknown> }>;
}

export interface PresetsInfo {
  presets: ResolvedPreset[];
  hasBlocks: boolean;
}

export function parsePresets(template: string): PresetsInfo | null {
  const match = template.match(SCHEMA_BLOCK_RE);
  if (!match) return null;

  let schema: {
    presets?: Array<{
      name: string;
      blocks?: Array<{ type: string; settings?: Record<string, unknown> }>;
    }>;
    blocks?: Array<{ type: string; settings?: ShopifySetting[] }>;
  };
  try {
    schema = JSON.parse(match[1].trim());
  } catch {
    return null;
  }

  if (!schema.presets?.length) return null;

  const hasBlocks = (schema.blocks?.length ?? 0) > 0;

  const blockDefaults: Record<string, Record<string, unknown>> = {};
  for (const blockDef of schema.blocks ?? []) {
    const defs: Record<string, unknown> = {};
    for (const setting of blockDef.settings ?? []) {
      if (setting.default !== undefined) defs[setting.id] = setting.default;
    }
    blockDefaults[blockDef.type] = defs;
  }

  const presets: ResolvedPreset[] = schema.presets.map(preset => {
    const resolved: ResolvedPreset = { name: preset.name };
    if (preset.blocks?.length) {
      resolved.blocks = preset.blocks.map(b => ({
        type: b.type,
        settings: { ...blockDefaults[b.type], ...b.settings },
      }));
    }
    return resolved;
  });

  return { presets, hasBlocks };
}
```

- [ ] **Step 4: Run — expect all tests green**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/storybook-shopify/src/schema-parser.ts packages/storybook-shopify/src/schema-parser.test.ts
git commit -m "feat: add parsePresets to schema-parser"
```

---

## Task 3: Create auto-story-builder.ts (extract + extend buildAutoStory)

**Files:**
- Create: `packages/storybook-shopify/src/auto-story-builder.ts`
- Create: `packages/storybook-shopify/src/auto-story-builder.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/storybook-shopify/src/auto-story-builder.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildAutoStory, buildAutoTitle } from './auto-story-builder.js';

describe('buildAutoTitle', () => {
  it('capitalises the dir and title-cases the filename', () => {
    expect(buildAutoTitle('sections', 'announcement-bar.liquid')).toBe('Sections/Announcement Bar');
  });

  it('handles single-word filenames', () => {
    expect(buildAutoTitle('snippets', 'banner.liquid')).toBe('Snippets/Banner');
  });
});

describe('buildAutoStory — no presets (existing behaviour)', () => {
  it('generates a Default export with section settings context', () => {
    const result = buildAutoStory('sections', 'cart.liquid', '../../sections/cart.liquid', {}, null);
    expect(result).toContain("title: 'Sections/Cart'");
    expect(result).toContain("{ section: { settings: args } }");
    expect(result).toContain('export const Default = {};');
  });

  it('includes args from defaults', () => {
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', { amount: 0 }, null);
    expect(result).toContain('"amount": 0');
    expect(result).toContain('export const Default = {};');
  });

  it('uses block context for block dir', () => {
    const result = buildAutoStory('blocks', 'my-block.liquid', '../../blocks/my-block.liquid', {}, null);
    expect(result).toContain("{ block: { settings: args } }");
  });

  it('uses bare args context for snippets dir', () => {
    const result = buildAutoStory('snippets', 'banner.liquid', '../../snippets/banner.liquid', {}, null);
    expect(result).toContain('renderTemplate(template, args)');
  });
});

describe('buildAutoStory — with presets, no blocks', () => {
  it('generates one named export per preset', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: 'Space' }] };
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', { amount: 0 }, presetsInfo);
    expect(result).toContain("title: 'Sections/Space'");
    expect(result).toContain("name: 'Space'");
    expect(result).toContain('export const Space = {');
    expect(result).not.toContain('export const Default = {}');
  });

  it('uses the plain settings render function (no block destructuring)', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: 'Space' }] };
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', {}, presetsInfo);
    expect(result).toContain('{ section: { settings: args } }');
    expect(result).not.toContain('blocks = []');
  });

  it('puts schema defaults at the default level (not per-story)', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: 'Space' }] };
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', { amount: 0 }, presetsInfo);
    expect(result).toMatch(/export default \{[\s\S]*"amount": 0[\s\S]*\};/);
  });

  it('generates multiple named exports for multiple presets', () => {
    const presetsInfo = {
      hasBlocks: false,
      presets: [{ name: 'Foo' }, { name: 'Bar Baz' }],
    };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const Foo = {');
    expect(result).toContain('export const BarBaz = {');
  });
});

describe('buildAutoStory — with presets and blocks', () => {
  it('uses block-destructuring render function', () => {
    const presetsInfo = {
      hasBlocks: true,
      presets: [{ name: 'Announcement bar', blocks: [{ type: 'item', settings: { text: 'Announcement' } }] }],
    };
    const result = buildAutoStory('sections', 'announcement-bar.liquid', '../../sections/announcement-bar.liquid', {}, presetsInfo);
    expect(result).toContain('blocks = []');
    expect(result).toContain('section: { settings, blocks }');
  });

  it('includes block args in the story export', () => {
    const presetsInfo = {
      hasBlocks: true,
      presets: [{ name: 'Announcement bar', blocks: [{ type: 'item', settings: { text: 'Announcement' } }] }],
    };
    const result = buildAutoStory('sections', 'announcement-bar.liquid', '../../sections/announcement-bar.liquid', {}, presetsInfo);
    expect(result).toContain('"type": "item"');
    expect(result).toContain('"text": "Announcement"');
  });

  it('does not include args key in story export when blocks array is empty', () => {
    const presetsInfo = {
      hasBlocks: true,
      presets: [{ name: 'Header', blocks: [] }],
    };
    const result = buildAutoStory('sections', 'header.liquid', '../../sections/header.liquid', {}, presetsInfo);
    expect(result).not.toContain('args:');
  });
});

describe('toExportName edge cases (via buildAutoStory)', () => {
  it('prefixes a leading digit with underscore', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: '3 Column Layout' }] };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const _3ColumnLayout = {');
  });

  it('strips special characters', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: "Hero & Banner!" }] };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const HeroBanner = {');
  });
});
```

- [ ] **Step 2: Run — expect failures**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: `Cannot find module './auto-story-builder.js'`.

- [ ] **Step 3: Create auto-story-builder.ts**

Create `packages/storybook-shopify/src/auto-story-builder.ts`:

```typescript
import type { PresetsInfo } from './schema-parser.js';

const DIR_CONTEXT: Record<string, string> = {
  sections: '{ section: { settings: args } }',
  blocks:   '{ block: { settings: args } }',
  snippets: 'args',
};

export function buildAutoTitle(dir: string, filename: string): string {
  const base = filename.replace(/\.liquid$/, '');
  return dir.charAt(0).toUpperCase() + dir.slice(1) + '/' +
    base.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function toExportName(name: string): string {
  const identifier = name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  return /^\d/.test(identifier) ? `_${identifier}` : identifier || 'Default';
}

export function buildAutoStory(
  dir: string,
  filename: string,
  liquidRelPath: string,
  defaults: Record<string, unknown>,
  presetsInfo: PresetsInfo | null
): string {
  const title = buildAutoTitle(dir, filename);
  const hasDefaults = Object.keys(defaults).length > 0;
  const argsBlock = hasDefaults
    ? `  args: ${JSON.stringify(defaults, null, 2).replace(/\n/g, '\n  ')},\n`
    : '';

  if (!presetsInfo) {
    const context = DIR_CONTEXT[dir] ?? 'args';
    return [
      `// Auto-generated by storybook-shopify`,
      `import { renderTemplate } from 'storybook-shopify';`,
      `import template from '${liquidRelPath}';`,
      ``,
      `export default {`,
      `  title: '${title}',`,
      `  component: template,`,
      `  render: (args) => renderTemplate(template, ${context}),`,
      argsBlock + `};`,
      ``,
      `export const Default = {};`,
      ``,
    ].join('\n');
  }

  const { presets, hasBlocks } = presetsInfo;
  const renderFn = hasBlocks
    ? `(args) => { const { blocks = [], ...settings } = args; return renderTemplate(template, { section: { settings, blocks } }); }`
    : `(args) => renderTemplate(template, { section: { settings: args } })`;

  const storyExports = presets.map(preset => {
    const exportName = toExportName(preset.name);
    const presetArgs: Record<string, unknown> = {};
    if (preset.blocks?.length) presetArgs.blocks = preset.blocks;
    const hasPresetArgs = Object.keys(presetArgs).length > 0;
    return [
      `export const ${exportName} = {`,
      `  name: '${preset.name}',`,
      ...(hasPresetArgs
        ? [`  args: ${JSON.stringify(presetArgs, null, 2).replace(/\n/g, '\n  ')},`]
        : []),
      `};`,
    ].join('\n');
  });

  return [
    `// Auto-generated by storybook-shopify`,
    `import { renderTemplate } from 'storybook-shopify';`,
    `import template from '${liquidRelPath}';`,
    ``,
    `export default {`,
    `  title: '${title}',`,
    `  component: template,`,
    `  render: ${renderFn},`,
    argsBlock + `};`,
    ``,
    storyExports.join('\n\n'),
    ``,
  ].join('\n');
}
```

- [ ] **Step 4: Run — expect all tests green**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/storybook-shopify/src/auto-story-builder.ts packages/storybook-shopify/src/auto-story-builder.test.ts
git commit -m "feat: add auto-story-builder with preset support"
```

---

## Task 4: Wire auto-story-builder + parsePresets into preset.ts

**Files:**
- Modify: `packages/storybook-shopify/src/preset.ts`

- [ ] **Step 1: Update imports in preset.ts**

At the top of `packages/storybook-shopify/src/preset.ts`, change:

```typescript
import { parseSchemaDefaults } from './schema-parser.js';
```

to:

```typescript
import { parseSchemaDefaults, parsePresets } from './schema-parser.js';
import { buildAutoStory, buildAutoTitle } from './auto-story-builder.js';
```

- [ ] **Step 2: Remove the now-redundant definitions from preset.ts**

Delete the following three items from `preset.ts`:

1. The `DIR_CONTEXT` constant:
```typescript
const DIR_CONTEXT: Record<string, string> = {
  sections: '{ section: { settings: args } }',
  blocks:   '{ block: { settings: args } }',
  snippets: 'args',
};
```

2. The `buildAutoTitle` function:
```typescript
function buildAutoTitle(dir: string, filename: string): string {
  const base = filename.replace(/\.liquid$/, '');
  return dir.charAt(0).toUpperCase() + dir.slice(1) + '/' +
    base.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
```

3. The `buildAutoStory` function (the entire function from `function buildAutoStory(` through its closing `}`).

- [ ] **Step 3: Pass presetsInfo to buildAutoStory in the stories loop**

In the `stories` export function, find this block:

```typescript
const content = readFileSync(join(dirPath, file), 'utf-8');
const defaults = parseSchemaDefaults(content);

writeFileSync(join(autoDir, storyFile), buildAutoStory(dir, file, liquidRelPath, defaults));
```

Replace it with:

```typescript
const content = readFileSync(join(dirPath, file), 'utf-8');
const defaults = parseSchemaDefaults(content);
const presetsInfo = parsePresets(content);

writeFileSync(join(autoDir, storyFile), buildAutoStory(dir, file, liquidRelPath, defaults, presetsInfo));
```

- [ ] **Step 4: Run the tests to confirm nothing regressed**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Build the package to confirm TypeScript compiles**

```bash
cd packages/storybook-shopify && pnpm build
```

Expected: no errors.

- [ ] **Step 6: Verify the generated announcement-bar story**

Delete the `.auto` directory and restart Storybook (or just inspect what would be generated by checking the content of the written file).

From the repo root:

```bash
node -e "
const { readFileSync } = require('fs');
const content = readFileSync('examples/test-theme/sections/announcement-bar.liquid', 'utf-8');

// Quick inline check of the generated output
import('./packages/storybook-shopify/dist/schema-parser.js').then(m => {
  console.log(JSON.stringify(m.parsePresets(content), null, 2));
});
"
```

Or simply start Storybook and confirm the `Sections/Announcement Bar` entry shows a story named `Announcement bar` with block args containing `text: "Announcement"`:

```bash
pnpm --filter './examples/test-theme' storybook
```

Open `http://localhost:6006` and navigate to `Sections > Announcement Bar`. Confirm:
- One story named `Announcement bar` (not `Default`)
- The Controls panel shows a `blocks` arg with `[{ type: "item", settings: { text: "Announcement" } }]`

- [ ] **Step 7: Commit**

```bash
git add packages/storybook-shopify/src/preset.ts
git commit -m "feat: generate per-preset stories with block args from schema"
```
