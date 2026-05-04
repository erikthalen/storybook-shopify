declare module 'virtual:storybook-shopify-options' {
  export const shopifyOptions: {
    renderDocTags: boolean;
  };
}

declare module 'virtual:storybook-shopify-snippets' {
  export const snippets: Record<string, string>;
}

declare module 'virtual:storybook-shopify-theme-assets-config' {
  export const SCRIPTS: string[];
  export const STYLES: string[];
}
