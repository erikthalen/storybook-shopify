import { renderTemplate } from 'storybook-shopify';

import template from '../sections/test-section.liquid';

export default {
  title: 'Sections/Test Section',

  // Setting component lets the schema enhancer read {% schema %} and
  // generate argTypes automatically from the section's settings.
  component: template,

  // Flat args map 1:1 to section.settings.* — render() wraps them.
  render: (args) =>
    renderTemplate(template, {
      section: { settings: args },
    }),

  args: {
    text: 'This is a test section',
    color_scheme: 'scheme_1',
    image: null,
    image_mobile: null,
    video: null,
  },
};

export const Default = {};

export const WithText = {
  args: {
    text: 'Hello from Storybook',
  },
};
