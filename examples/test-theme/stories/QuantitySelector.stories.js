import template from "../snippets/quantity-selector.liquid"

/** @type {import('storybook-shopify').ShopifyRenderer} */
export default {
  title: "Snippets/Quantity Selector",
  component: template,
  // argTypes are generated from {% doc %} in QuantitySelector.liquid via renderDocTags: true
}

export const Primary = {}
