# Getting Started

## Prerequisites

- Node.js 18 or later
- pnpm, npm, or yarn
- A Shopify theme project with Liquid templates

## Installation

Install `storybook` and `storybook-shopify` as dev dependencies in your theme project:

```json
{
  "devDependencies": {
    "storybook": "^10.0.0",
    "storybook-shopify": "github:erikthalen/storybook-shopify#v0.1.0-beta.5"
  }
}
```

`storybook-shopify` is currently only released through GitHub, hence the special version string.

## Configuration

Create `.storybook/main.ts` in your project root:

```ts
import type { StorybookConfig } from "storybook-shopify";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|ts)"],
  framework: {
    name: "storybook-shopify",
    options: {},
  },
};

export default config;
```

## Run Storybook

Add the storybook script to your `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006"
  }
}
```

Then start it:

```bash
pnpm storybook
```

Storybook starts at `http://localhost:6006`. Each story renders your Liquid template in an iframe using the args you define.

If your templates depend on compiled JS or CSS, see [viteEntries](/options/vite-entries) to load those assets in the preview.
