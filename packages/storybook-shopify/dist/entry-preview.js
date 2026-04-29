import { shopifyOptions } from 'virtual:storybook-shopify-options';
import { snippets } from 'virtual:storybook-shopify-snippets';
import { parseDocArgTypes, parseDocDefaults } from './doc-parser.js';
import { parseSchemaArgTypes, parseSchemaDefaults } from './schema-parser.js';
import { registerSnippets, render, renderToCanvas } from './render.js';
// Populate the engine's in-memory FS so {% render 'name' %} resolves correctly
registerSnippets(snippets);
export { render, renderToCanvas };
export const parameters = { renderer: 'shopify' };
// Storybook's normalizeInputTypes runs on explicitly-defined argTypes but not on
// enhancer output. Mirror its normalizeControl logic so the Controls panel sees
// the expected { type, disable } shape rather than raw string shorthands.
function normalizeControl(ctrl) {
    if (ctrl === false)
        return { disable: true };
    if (typeof ctrl === 'string')
        return { type: ctrl, disable: false };
    if (ctrl && typeof ctrl === 'object' && 'type' in ctrl && !('disable' in ctrl)) {
        return { ...ctrl, disable: false };
    }
    return ctrl;
}
// Builds an enhancer from any parser that maps a template string → InputType map.
// Explicit story argTypes always win; parsed types fill in the rest.
function makeArgTypesEnhancer(parser) {
    return (context) => {
        const { component, argTypes } = context;
        if (typeof component !== 'string')
            return argTypes;
        const parsed = parser(component);
        if (Object.keys(parsed).length === 0)
            return argTypes;
        const merged = {};
        const allKeys = new Set([...Object.keys(parsed), ...Object.keys(argTypes)]);
        for (const key of allKeys) {
            const entry = {
                ...parsed[key],
                ...argTypes[key],
                name: key,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (entry.control !== undefined)
                entry.control = normalizeControl(entry.control);
            merged[key] = entry;
        }
        return merged;
    };
}
// schema runs first (section settings as base), doc runs second (snippet
// params override). In practice they're mutually exclusive per file type.
export const argTypesEnhancers = shopifyOptions.renderDocTags
    ? [
        makeArgTypesEnhancer(parseSchemaArgTypes),
        makeArgTypesEnhancer(parseDocArgTypes),
    ]
    : [];
// Populate args from schema/doc defaults so controls start with meaningful data.
// Schema defaults cover section settings; doc defaults cover snippet @params.
// Only fills keys not already set by the story's own args.
function makeArgsEnhancer(parser) {
    return (context) => {
        const { component, initialArgs } = context;
        if (typeof component !== 'string')
            return {};
        const defaults = parser(component);
        const result = {};
        for (const [key, value] of Object.entries(defaults)) {
            if (!(key in initialArgs))
                result[key] = value;
        }
        return result;
    };
}
export const argsEnhancers = shopifyOptions.renderDocTags
    ? [
        makeArgsEnhancer(parseSchemaDefaults),
        makeArgsEnhancer(parseDocDefaults),
    ]
    : [];
//# sourceMappingURL=entry-preview.js.map