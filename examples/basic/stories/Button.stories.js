import template from '../snippets/button.liquid';

/** @type {import('storybook-shopify').ShopifyRenderer} */
export default {
  title: 'Example/Button',
  component: template,
  // argTypes are generated from {% doc %} in Button.liquid via renderDocTags: true
  argTypes: {
    color: { control: 'color' },
  },
  args: {
    label: 'Button',
    variant: 'primary',
    color: '#2563EB',
    disabled: false,
  },
};

export const Primary = {
  args: {
    label: "Primary button",
    variant: 'primary',
    color: '#2563EB',
  },
};

export const Secondary = {
  args: {
    label: 'Secondary',
    variant: 'secondary',
    color: '#6B7280',
  },
};

export const Danger = {
  args: {
    label: 'Delete',
    variant: 'danger',
    color: '#DC2626',
  },
};

export const Disabled = {
  args: {
    label: 'Unavailable',
    variant: 'primary',
    color: '#2563EB',
    disabled: true,
  },
};
