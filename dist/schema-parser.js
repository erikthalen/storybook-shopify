import { FIXTURE_BY_SETTING_TYPE } from './fixtures.js';
const SCHEMA_BLOCK_RE = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/;
// Setting types that are UI chrome, not actual data inputs
const SIDEBAR_TYPES = new Set(['header', 'paragraph', 'color_scheme_group']);
export function parseSchemaDefaults(template) {
    const match = template.match(SCHEMA_BLOCK_RE);
    if (!match)
        return {};
    let schema;
    try {
        schema = JSON.parse(match[1].trim());
    }
    catch {
        return {};
    }
    const defaults = {};
    for (const setting of schema.settings ?? []) {
        if (!setting.id)
            continue;
        if (setting.default !== undefined) {
            defaults[setting.id] = setting.default;
        }
        else if (Object.prototype.hasOwnProperty.call(FIXTURE_BY_SETTING_TYPE, setting.type)) {
            defaults[setting.id] = FIXTURE_BY_SETTING_TYPE[setting.type];
        }
    }
    return defaults;
}
export function parseSchemaArgTypes(template) {
    const match = template.match(SCHEMA_BLOCK_RE);
    if (!match)
        return {};
    let schema;
    try {
        schema = JSON.parse(match[1].trim());
    }
    catch {
        return {};
    }
    const settings = schema.settings;
    if (!settings?.length)
        return {};
    const argTypes = {};
    for (const setting of settings) {
        if (SIDEBAR_TYPES.has(setting.type))
            continue;
        const { control, options, typeName } = resolveControl(setting);
        argTypes[setting.id] = {
            name: setting.id,
            description: setting.info ?? setting.label,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: { name: typeName, required: false },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control: control,
            ...(options ? { options } : {}),
            table: {
                type: { summary: setting.type },
                ...(setting.default !== undefined
                    ? { defaultValue: { summary: String(setting.default) } }
                    : {}),
            },
        };
    }
    return argTypes;
}
function resolveControl(setting) {
    switch (setting.type) {
        // ── Text-like ──────────────────────────────────────────────
        case 'text':
        case 'textarea':
        case 'richtext':
        case 'inline_richtext':
        case 'html':
        case 'liquid':
        case 'url':
        case 'link_list':
        case 'font_picker':
        case 'video_url':
            return { control: 'text', typeName: 'string' };
        // ── Numeric ────────────────────────────────────────────────
        case 'number':
            return { control: 'number', typeName: 'number' };
        case 'range':
            return {
                control: { type: 'range', min: setting.min, max: setting.max, step: setting.step },
                typeName: 'number',
            };
        // ── Boolean ────────────────────────────────────────────────
        case 'checkbox':
            return { control: 'boolean', typeName: 'boolean' };
        // ── Color ──────────────────────────────────────────────────
        case 'color':
        case 'color_background':
            return { control: 'color', typeName: 'string' };
        case 'color_scheme':
            return {
                control: 'select',
                typeName: 'string',
                options: ['scheme_1', 'scheme_2', 'scheme_3', 'scheme_4', 'scheme_5'],
            };
        // ── Choice ─────────────────────────────────────────────────
        case 'select':
            return {
                control: 'select',
                typeName: 'string',
                options: setting.options?.map((o) => o.value) ?? [],
            };
        case 'radio':
            return {
                control: 'radio',
                typeName: 'string',
                options: setting.options?.map((o) => o.value) ?? [],
            };
        case 'text_alignment':
            return {
                control: 'inline-radio',
                typeName: 'string',
                options: ['left', 'center', 'right'],
            };
        // ── Media / Shopify resources ───────────────────────────────
        case 'image_picker':
        case 'video':
        case 'article':
        case 'article_list':
        case 'blog':
        case 'collection':
        case 'collection_list':
        case 'product':
        case 'product_list':
        case 'page':
        case 'metaobject':
        case 'metaobject_list':
            return { control: 'object', typeName: 'object' };
        default:
            return { control: 'text', typeName: 'string' };
    }
}
export function parsePresets(template) {
    const match = template.match(SCHEMA_BLOCK_RE);
    if (!match)
        return null;
    let schema;
    try {
        schema = JSON.parse(match[1].trim());
    }
    catch {
        return null;
    }
    if (!schema.presets?.length)
        return null;
    const hasBlocks = (schema.blocks?.length ?? 0) > 0;
    const blockDefaults = {};
    for (const blockDef of schema.blocks ?? []) {
        const defs = {};
        for (const setting of blockDef.settings ?? []) {
            if (setting.default !== undefined)
                defs[setting.id] = setting.default;
        }
        blockDefaults[blockDef.type] = defs;
    }
    const presets = schema.presets.map(preset => {
        const resolved = { name: preset.name };
        if (preset.blocks?.length) {
            resolved.blocks = preset.blocks.map(b => ({
                type: b.type,
                settings: { ...blockDefaults[b.type], ...b.settings },
            }));
        }
        return resolved;
    });
    return { presets, hasBlocks };
}
//# sourceMappingURL=schema-parser.js.map