import type { ArgTypesEnhancer, InputType, StrictInputType } from 'storybook/internal/types';

import { shopifyOptions } from 'virtual:storybook-shopify-options';
import { snippets } from 'virtual:storybook-shopify-snippets';

import { parseDocArgTypes } from './doc-parser.js';
import { parseSchemaArgTypes } from './schema-parser.js';
import { registerSnippets, render, renderToCanvas } from './render.js';
import type { ShopifyRenderer } from './types.js';

// Populate the engine's in-memory FS so {% render 'name' %} resolves correctly
registerSnippets(snippets);

export { render, renderToCanvas };

export const parameters = { renderer: 'shopify' };

// Builds an enhancer from any parser that maps a template string → InputType map.
// Explicit story argTypes always win; parsed types fill in the rest.
function makeArgTypesEnhancer(
  parser: (template: string) => Record<string, InputType>
): ArgTypesEnhancer<ShopifyRenderer> {
  return (context) => {
    const { component, argTypes } = context;
    if (typeof component !== 'string') return argTypes;

    const parsed = parser(component);
    if (Object.keys(parsed).length === 0) return argTypes;

    const merged: Record<string, StrictInputType> = {};
    const allKeys = new Set([...Object.keys(parsed), ...Object.keys(argTypes)]);

    for (const key of allKeys) {
      merged[key] = { ...parsed[key], ...argTypes[key], name: key } as StrictInputType;
    }

    return merged;
  };
}

// schema runs first (section settings as base), doc runs second (snippet
// params override). In practice they're mutually exclusive per file type.
export const argTypesEnhancers: ArgTypesEnhancer<ShopifyRenderer>[] = shopifyOptions.renderDocTags
  ? [
      makeArgTypesEnhancer(parseSchemaArgTypes),
      makeArgTypesEnhancer(parseDocArgTypes),
    ]
  : [];
