import { fileURLToPath } from 'node:url';

import type { PresetProperty } from 'storybook/internal/types';

// Registers our entry-preview module so Storybook loads render + renderToCanvas
export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (input = []) => {
  return [
    ...(input as string[]),
    fileURLToPath(import.meta.resolve('./entry-preview.js')),
  ];
};
