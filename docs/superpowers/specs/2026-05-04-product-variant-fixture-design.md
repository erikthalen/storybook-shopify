# product_variant Fixture Design

## Goal

Add a `product_variant` fixture representing the Shopify [`variant`](https://shopify.dev/docs/api/liquid/objects/variant) global Liquid object, so that snippets and sections referencing `variant` or `product_variant` directly have a sensible default in Storybook previews.

## Approach

Keep the existing slim `variant`/`variant2` objects intact — they are used inside `product.variants`, `product.selected_or_first_available_variant`, etc. Create a new, richer `product_variant` export for global context use.

## New Fixture

A new exported `product_variant` const in `packages/storybook-shopify/src/fixtures.ts` with plausible demo data for all Shopify-documented fields:

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

## Wiring

**`globalContext`** — both keys point to the same object so templates using either name work:
```ts
variant: product_variant,
product_variant: product_variant,
```

**`FIXTURE_BY_LIQUID_TYPE`** — enables `@param {variant}` and `@param {product_variant}` in `{% doc %}` blocks:
```ts
variant: product_variant,
product_variant: product_variant,
```

**Public `fixtures` export** — available for story authors to spread/override:
```ts
product_variant,
```

## What stays the same

The existing slim `variant` and `variant2` objects remain unchanged. They continue to be used in:
- `product.variants`
- `product.selected_or_first_available_variant`
- `product.selected_variant`
