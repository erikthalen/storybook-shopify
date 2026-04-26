import type { StorybookConfig } from 'storybook-shopify';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|ts)'],
  addons: [],
  framework: {
    name: 'storybook-shopify',
    options: {
      renderDocTags: true,
    },
  },
};

export default config;
