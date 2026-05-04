# VitePress Documentation Setup Design

**Date:** 2026-05-04
**Status:** Approved

## Overview

Add a VitePress documentation site to the `storybook-shopify` monorepo as a dedicated workspace package. The site will be deployed to GitHub Pages and contain a minimal "Getting Started" page covering installation steps.

## Structure

```
docs/
  package.json          # name: "@storybook-shopify/docs", vitepress devDependency
  .vitepress/
    config.ts           # site title, nav, GitHub Pages base path
  index.md              # landing/home page
  getting-started.md    # installation steps
```

## Workspace Integration

- `pnpm-workspace.yaml` — add `docs` to the packages list
- Root `package.json` — add `docs:dev` (`pnpm --filter @storybook-shopify/docs dev`) and `docs:build` (`pnpm --filter @storybook-shopify/docs build`) scripts

## VitePress Config

- `title`: "storybook-shopify"
- `description`: "Storybook framework for Shopify/Liquid templates"
- `base`: set to the GitHub Pages repo subpath (e.g. `/storybook-shopify/`)
- Nav: Home, Getting Started

## GitHub Pages Deployment

A GitHub Actions workflow at `.github/workflows/deploy-docs.yml` triggers on push to `main`. It:
1. Installs dependencies with pnpm
2. Runs `docs:build`
3. Deploys the `docs/.vitepress/dist` output to GitHub Pages using `actions/deploy-pages`

## Getting Started Page Content

Installation steps covering:
1. Prerequisites (Node, pnpm, a Shopify theme)
2. Install `storybook-shopify` via pnpm/npm
3. Add a `.storybook/main.ts` config referencing the framework
4. Run Storybook

## Out of Scope

- API reference pages
- Advanced configuration guides
- Custom theming of the VitePress site
