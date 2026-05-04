import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'storybook-shopify',
  description: 'Storybook framework for Shopify/Liquid templates',
  base: '/storybook-shopify/',
  cleanUrls: true,
  vite: {
    plugins: [
      {
        name: 'no-trailing-slash',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url === '/storybook-shopify') req.url = '/storybook-shopify/'
            next()
          })
        },
      },
    ],
  },
  themeConfig: {
    nav: [
      { text: 'Getting Started', link: '/' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/' },
          { text: 'Auto Stories', link: '/auto-stories' },
        ],
      },
      {
        text: 'Options',
        items: [
          { text: 'renderDocTags', link: '/options/render-doc-tags' },
          { text: 'viteEntries', link: '/options/vite-entries' },
          { text: 'generateAutomaticStories', link: '/options/generate-automatic-stories' },
        ],
      },
    ],
  },
})
