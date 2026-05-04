# storybook-shopify

A Storybook framework for Shopify themes. Render and develop Liquid section, snippet, and block templates directly in Storybook — with args wired up automatically from your theme's `{% schema %}` and `{% doc %}` blocks.

## Features

- **Liquid rendering** — templates are rendered server-side via LiquidJS in the Storybook preview iframe
- **Auto stories** — a story is generated for every `.liquid` file in `sections/`, `snippets/`, and `blocks/` on startup, no manual story files required
- **Schema-driven args** — setting defaults from `{% schema %}` become Storybook controls automatically
- **Doc-driven args** — `@param` tags in `{% doc %}` blocks wire up snippet args
- **Preset stories** — each `presets` entry in a section schema becomes its own story

## Installation

```bash
pnpm add -D storybook storybook-shopify
```

Create `.storybook/main.ts`:

```ts
import type { StorybookConfig } from 'storybook-shopify'

const config: StorybookConfig = {
  stories: ['../sections/**/*.stories.ts'],
  framework: {
    name: 'storybook-shopify',
    options: {},
  },
}

export default config
```

See the [documentation](https://erikthalen.github.io/storybook-shopify/) for all options.

## Monorepo structure

| Path | Description |
|------|-------------|
| `packages/storybook-shopify` | The framework package published to npm |
| `examples/basic` | Minimal example Storybook setup |
| `examples/test-theme` | Shopify theme used for integration testing |
| `docs` | VitePress documentation site |

## Development

```bash
pnpm install
pnpm dev          # build the framework in watch mode
pnpm test         # run unit tests
pnpm storybook    # start the example Storybook
pnpm docs:dev     # start the docs site
```

## License

MIT
