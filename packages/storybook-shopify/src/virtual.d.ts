declare module 'virtual:storybook-shopify-options' {
  export const shopifyOptions: {
    renderDocTags: boolean;
  };
}

declare module 'virtual:storybook-shopify-snippets' {
  export const snippets: Record<string, string>;
}
