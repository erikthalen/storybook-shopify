# VitePress Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a VitePress documentation site as a pnpm workspace package at `docs/`, with a Getting Started page and GitHub Pages deployment.

**Architecture:** A standalone `docs/` workspace package owns all VitePress config and content. The root `package.json` exposes convenience scripts. A GitHub Actions workflow builds and deploys the site on push to `main`.

**Tech Stack:** VitePress ^1.0.0, pnpm workspaces, GitHub Actions, GitHub Pages

---

## File Map

| Path | Action | Purpose |
|------|--------|---------|
| `docs/package.json` | Create | Workspace package config, VitePress devDependency |
| `docs/.vitepress/config.ts` | Create | VitePress site config (title, nav, base path) |
| `docs/index.md` | Create | Home/landing page |
| `docs/getting-started.md` | Create | Installation steps |
| `pnpm-workspace.yaml` | Modify | Add `docs` to workspace packages |
| `package.json` (root) | Modify | Add `docs:dev` and `docs:build` scripts |
| `.github/workflows/deploy-docs.yml` | Create | GitHub Actions build + deploy to Pages |

---

### Task 1: Create the docs workspace package

**Files:**
- Create: `docs/package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json` (root)

- [ ] **Step 1: Create `docs/package.json`**

```json
{
  "name": "@storybook-shopify/docs",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.0.0"
  }
}
```

- [ ] **Step 2: Add `docs` to `pnpm-workspace.yaml`**

Replace the file content with:

```yaml
packages:
  - 'packages/*'
  - 'examples/*'
  - 'docs'
```

- [ ] **Step 3: Add convenience scripts to root `package.json`**

Add these two entries to the `"scripts"` object:

```json
"docs:dev": "pnpm --filter @storybook-shopify/docs dev",
"docs:build": "pnpm --filter @storybook-shopify/docs build"
```

- [ ] **Step 4: Install dependencies**

Run from the repo root:
```bash
pnpm install
```

Expected: pnpm resolves the new workspace package and installs VitePress under `docs/node_modules`.

- [ ] **Step 5: Commit**

```bash
git add docs/package.json pnpm-workspace.yaml package.json pnpm-lock.yaml
git commit -m "feat: add @storybook-shopify/docs workspace package with vitepress"
```

---

### Task 2: Configure VitePress

**Files:**
- Create: `docs/.vitepress/config.ts`

- [ ] **Step 1: Create `docs/.vitepress/config.ts`**

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'storybook-shopify',
  description: 'Storybook framework for Shopify/Liquid templates',
  base: '/storybook-shopify/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
    ],
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add docs/.vitepress/config.ts
git commit -m "feat: add vitepress config with GitHub Pages base path"
```

---

### Task 3: Write content pages

**Files:**
- Create: `docs/index.md`
- Create: `docs/getting-started.md`

- [ ] **Step 1: Create `docs/index.md`**

```md
---
layout: home

hero:
  name: storybook-shopify
  text: Storybook for Shopify Liquid
  tagline: Develop and preview Shopify Liquid section templates in Storybook
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
---
```

- [ ] **Step 2: Create `docs/getting-started.md`**

```md
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
```

- [ ] **Step 3: Verify local dev server starts**

Run from the repo root:
```bash
pnpm docs:dev
```

Expected: VitePress dev server starts at `http://localhost:5173`. Open it and confirm:
- Home page renders with the hero section
- "Get Started" link navigates to Getting Started
- Getting Started page shows all installation steps

- [ ] **Step 4: Commit**

```bash
git add docs/index.md docs/getting-started.md
git commit -m "docs: add home page and getting started installation guide"
```

---

### Task 4: Add GitHub Actions deployment workflow

**Files:**
- Create: `.github/workflows/deploy-docs.yml`

- [ ] **Step 1: Create `.github/workflows/deploy-docs.yml`**

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - uses: actions/configure-pages@v5

      - name: Install dependencies
        run: pnpm install

      - name: Build docs
        run: pnpm docs:build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Enable GitHub Pages in the repo settings**

In the GitHub repo → Settings → Pages:
- Source: **GitHub Actions**

This must be set before the workflow can deploy. Without it, the `deploy-pages` action will fail with a permissions error.

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/deploy-docs.yml
git commit -m "ci: add GitHub Actions workflow to deploy docs to GitHub Pages"
```

Push to `main` and verify the Actions tab shows the workflow running. After it completes, the site is live at `https://erikthalen.github.io/storybook-shopify/`.
