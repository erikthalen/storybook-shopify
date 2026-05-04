import { fileURLToPath } from 'node:url';
// Registers our entry-preview module so Storybook loads render + renderToCanvas
export const previewAnnotations = async (input = []) => {
    return [
        ...input,
        fileURLToPath(import.meta.resolve('./entry-preview.js')),
    ];
};
//# sourceMappingURL=renderer-preset.js.map