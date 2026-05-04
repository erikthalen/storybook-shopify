# Getting Started

## Prerequisites

- Node.js 18 or later
- pnpm, npm, or yarn
- A Shopify theme project with Liquid templates

## Installation

Install `storybook` and `storybook-shopify` as dev dependencies in your theme project:

\`\`\`bash
pnpm add -D storybook storybook-shopify
\`\`\`

## Configuration

Create `.storybook/main.ts` in your project root:

\`\`\`ts
import type { StorybookConfig } from 'storybook-shopify'

const config: StorybookConfig = {
  stories: ['../sections/**/*.stories.ts'],
  framework: {
    name: 'storybook-shopify',
    options: {},
  },
}

export default config
\`\`\`

## Run Storybook

\`\`\`bash
pnpm storybook
\`\`\`

Storybook starts at `http://localhost:6006`. Each story renders your Liquid template in an iframe using the args you define.
