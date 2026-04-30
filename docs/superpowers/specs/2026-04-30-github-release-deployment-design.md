# GitHub Release Deployment Design

**Date:** 2026-04-30
**Status:** Approved

## Goal

Allow consumers to install `storybook-shopify` directly from GitHub using pnpm:

```
pnpm add github:erikthalen/storybook-shopify#v0.1.0-beta.1
```

## Problem

The repo is a monorepo. The root `package.json` is the private monorepo manifest (`storybook-shopify-monorepo`, `"private": true`). A GitHub install reads the root `package.json`, so consumers cannot install the sub-package at `packages/storybook-shopify/` directly from `main`.

## Solution: Release Branch

A dedicated `release` branch holds only the contents of `packages/storybook-shopify/` (flattened to root, with a built `dist/`). Nobody develops on this branch — it is only ever written by the GitHub Actions workflow.

## Workflow

File: `.github/workflows/release.yml`
Trigger: `push` to `main`

### Steps

1. **Version detection** — compare `packages/storybook-shopify/package.json` `.version` between `HEAD` and `HEAD~1`. If unchanged, exit early (no release).
2. **Install & build** — run `pnpm install` then `pnpm --filter storybook-shopify build` to produce a fresh `dist/`.
3. **Prepare release contents** — copy the following into a temp directory (nothing else from the monorepo):
   - `packages/storybook-shopify/package.json`
   - `packages/storybook-shopify/dist/`
   - `packages/storybook-shopify/src/`
   - `packages/storybook-shopify/tsconfig.json`
4. **Push to release branch** — force-push the temp directory contents as a new commit onto the `release` branch.
5. **Create version tag** — tag the new release branch commit as `v{version}` (e.g. `v0.1.0-beta.1`) and push the tag.

## Release Process (for maintainers)

1. Bump `"version"` in `packages/storybook-shopify/package.json`
2. Push to `main`
3. The workflow detects the change and handles everything else

## Consumer Install

Pin to a specific version (recommended):
```
pnpm add github:erikthalen/storybook-shopify#v0.1.0-beta.1
```

Always latest release:
```
pnpm add github:erikthalen/storybook-shopify#release
```

## What is NOT in scope

- npm registry publishing
- GitHub Packages
- Changelog generation or GitHub Releases UI
- Automated version bumping (version is always bumped manually)
