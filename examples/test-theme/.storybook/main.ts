import type { StorybookConfig } from "storybook-shopify"

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|ts)"],
  addons: [],
  framework: {
    name: "storybook-shopify",
    options: {
      viteEntries: ["theme.ts", "theme.css", "jazz.css"],
    },
  },
}

export default config
