# product_variant Fixture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `product_variant` fixture representing the Shopify `variant` global Liquid object, exposed in `globalContext` as both `variant` and `product_variant`, with full Shopify-documented fields and plausible demo data.

**Architecture:** A new `product_variant` const is added to `fixtures.ts` alongside the existing slim `variant`/`variant2` objects (which stay untouched). It is wired into `globalContext`, `FIXTURE_BY_LIQUID_TYPE`, and the public `fixtures` export. No other files need to change.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Write failing tests

**Files:**
- Create: `packages/storybook-shopify/src/fixtures.test.ts`

- [ ] **Step 1: Create the test file**

Create `packages/storybook-shopify/src/fixtures.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  product_variant,
  globalContext,
  FIXTURE_BY_LIQUID_TYPE,
  fixtures,
} from './fixtures.js';

describe('product_variant fixture', () => {
  it('has required Shopify variant fields', () => {
    expect(product_variant).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      price: expect.any(Number),
      available: expect.any(Boolean),
      sku: expect.any(String),
      barcode: expect.any(String),
      option1: expect.any(String),
      options: expect.any(Array),
      weight: expect.any(Number),
      weight_unit: expect.any(String),
      taxable: expect.any(Boolean),
      requires_shipping: expect.any(Boolean),
      inventory_quantity: expect.any(Number),
      inventory_management: expect.any(String),
      inventory_policy: expect.any(String),
      url: expect.any(String),
      selected: expect.any(Boolean),
    });
  });

  it('is in globalContext as both "variant" and "product_variant"', () => {
    expect(globalContext.variant).toBe(product_variant);
    expect(globalContext.product_variant).toBe(product_variant);
  });

  it('is in FIXTURE_BY_LIQUID_TYPE as both "variant" and "product_variant"', () => {
    expect(FIXTURE_BY_LIQUID_TYPE.variant).toBe(product_variant);
    expect(FIXTURE_BY_LIQUID_TYPE.product_variant).toBe(product_variant);
  });

  it('is in the public fixtures export', () => {
    expect(fixtures.product_variant).toBe(product_variant);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: test file errors with something like `product_variant is not exported from './fixtures.js'`.

---

### Task 2: Implement `product_variant` in `fixtures.ts`

**Files:**
- Modify: `packages/storybook-shopify/src/fixtures.ts`

The `image` const is defined at the top and is in scope. Insert `product_variant` after the existing `variant2` block (around line 46), before `export const product`.

- [ ] **Step 1: Add the `product_variant` export**

In `packages/storybook-shopify/src/fixtures.ts`, insert after the `variant2` block and before `export const product = {`:

```ts
export const product_variant = {
  id: 1,
  title: "Navy / Large",
  price: 2999,
  compare_at_price: 3999,
  available: true,
  sku: "NAV-LRG-001",
  barcode: "1234567890123",
  option1: "Navy",
  option2: "Large",
  option3: null,
  options: ["Navy", "Large"],
  weight: 250,
  weight_unit: "g",
  taxable: true,
  requires_shipping: true,
  inventory_quantity: 12,
  inventory_management: "shopify",
  inventory_policy: "deny",
  featured_image: image,
  image: image,
  url: "/products/example-product?variant=1",
  unit_price: null,
  unit_price_measurement: null,
  selected: true,
  metafields: {},
};
```

- [ ] **Step 2: Wire into `globalContext`**

Update the `globalContext` export to include both keys:

```ts
export const globalContext: Record<string, unknown> = {
  product,
  collection,
  collections: [collection],
  article,
  blog,
  page,
  shop,
  routes,
  cart,
  request,
  customer,
  settings,
  variant: product_variant,
  product_variant,
};
```

- [ ] **Step 3: Wire into `FIXTURE_BY_LIQUID_TYPE`**

Update `FIXTURE_BY_LIQUID_TYPE` to include both keys:

```ts
export const FIXTURE_BY_LIQUID_TYPE: Record<string, unknown> = {
  image,
  product,
  product_list: [product],
  collection,
  collection_list: [collection],
  article,
  article_list: [article],
  blog,
  page,
  video,
  object: {},
  variant: product_variant,
  product_variant,
};
```

- [ ] **Step 4: Add to the public `fixtures` export**

```ts
export const fixtures = {
  image,
  product,
  collection,
  article,
  blog,
  page,
  video,
  shop,
  routes,
  cart,
  request,
  product_variant,
};
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd packages/storybook-shopify && pnpm test
```

Expected: all tests pass, including the existing `schema-parser` suite.

---

### Task 3: Build and verify dist

**Files:**
- Verify: `packages/storybook-shopify/dist/fixtures.js`

- [ ] **Step 1: Build the package**

```bash
cd packages/storybook-shopify && pnpm build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 2: Confirm `product_variant` appears in the dist**

```bash
grep -c "product_variant" packages/storybook-shopify/dist/fixtures.js
```

Expected: count > 0.
