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
