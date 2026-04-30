# GitHub Release Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions workflow that automatically builds and deploys `packages/storybook-shopify` to a `release` branch (with a version tag) whenever the package version is bumped on `main`.

**Architecture:** A single workflow file detects version changes by comparing `packages/storybook-shopify/package.json` between `HEAD` and `HEAD~1`. On change it builds the package, copies only the package contents into an orphan git staging area, force-pushes that as a new commit to the `release` branch, and creates a version tag. The `release` branch is never developed on — it is purely a workflow artifact that consumers install from.

**Tech Stack:** GitHub Actions, pnpm, TypeScript (tsc)

---

### Task 1: Create the release workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/release.yml` with the following content:

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect version change
        id: version
        run: |
          PREV=$(git show HEAD~1:packages/storybook-shopify/package.json 2>/dev/null | jq -r '.version // empty')
          CURR=$(jq -r .version packages/storybook-shopify/package.json)
          echo "curr=$CURR" >> $GITHUB_OUTPUT
          if [ "$PREV" = "$CURR" ]; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - uses: pnpm/action-setup@v4
        if: steps.version.outputs.changed == 'true'
        with:
          version: 9

      - uses: actions/setup-node@v4
        if: steps.version.outputs.changed == 'true'
        with:
          node-version: 20
          cache: pnpm

      - name: Install & build
        if: steps.version.outputs.changed == 'true'
        run: |
          pnpm install
          pnpm --filter storybook-shopify build

      - name: Deploy release branch & tag
        if: steps.version.outputs.changed == 'true'
        env:
          VERSION: ${{ steps.version.outputs.curr }}
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

          # Stage the package contents in a temp directory
          STAGING=$(mktemp -d)
          cp packages/storybook-shopify/package.json "$STAGING/"
          cp packages/storybook-shopify/tsconfig.json "$STAGING/"
          cp -r packages/storybook-shopify/dist "$STAGING/"
          cp -r packages/storybook-shopify/src "$STAGING/"

          # Create an orphan staging branch, clear it, copy staged contents
          git checkout --orphan _release_staging
          git rm -rf . --quiet
          cp -r "$STAGING/." .

          git add .
          git commit -m "release v$VERSION"

          # Force-push to release branch (each release is a clean commit)
          git push origin HEAD:refs/heads/release --force

          # Create and push version tag
          git tag "v$VERSION"
          git push origin "v$VERSION"
```

- [ ] **Step 2: Validate YAML syntax**

```bash
npx js-yaml .github/workflows/release.yml > /dev/null && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 3: Commit the workflow file**

```bash
git add .github/workflows/release.yml
git commit -m "add automated release workflow"
```

---

### Task 2: Trigger and verify the first release

- [ ] **Step 1: Push the workflow to main**

```bash
git push origin main
```

Open `https://github.com/erikthalen/storybook-shopify/actions` and confirm the workflow ran. Since the version in `packages/storybook-shopify/package.json` did not change between the two most recent commits, the `Detect version change` step should output `changed=false` and all subsequent steps should be skipped. The job should complete green with no release created.

- [ ] **Step 2: Trigger a real release — bump the version**

In `packages/storybook-shopify/package.json`, increment the version (e.g. `0.1.0-beta.1` → `0.1.0-beta.2`):

```json
{
  "version": "0.1.0-beta.2"
}
```

- [ ] **Step 3: Commit and push the version bump**

```bash
git add packages/storybook-shopify/package.json
git commit -m "bump storybook-shopify to 0.1.0-beta.2"
git push origin main
```

- [ ] **Step 4: Verify the release on GitHub**

1. Open `https://github.com/erikthalen/storybook-shopify/actions` — the workflow should run all steps including `Deploy release branch & tag`.
2. Open `https://github.com/erikthalen/storybook-shopify/tree/release` — the root should contain `package.json`, `dist/`, `src/`, `tsconfig.json` and nothing else from the monorepo.
3. Open `https://github.com/erikthalen/storybook-shopify/tags` — the tag `v0.1.0-beta.2` should be listed.

- [ ] **Step 5: Verify the install works**

In a separate test project:

```bash
pnpm add github:erikthalen/storybook-shopify#v0.1.0-beta.2
```

Expected: pnpm resolves the package, installs `dist/index.js` as the entry point, and `node_modules/storybook-shopify/package.json` shows `"version": "0.1.0-beta.2"`.
