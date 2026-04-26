const SCHEMA_BLOCK_RE = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/;
// Setting types that are UI chrome, not actual data inputs
const SIDEBAR_TYPES = new Set(['header', 'paragraph', 'color_scheme_group']);
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
        const { control, options } = resolveControl(setting);
        argTypes[setting.id] = {
            name: setting.id,
            description: setting.info ?? setting.label,
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
            return { control: 'text' };
        case 'video_url':
            // accepts youtube / vimeo URLs
            return { control: 'text' };
        // ── Numeric ────────────────────────────────────────────────
        case 'number':
            return { control: 'number' };
        case 'range':
            return {
                control: { type: 'range', min: setting.min, max: setting.max, step: setting.step },
            };
        // ── Boolean ────────────────────────────────────────────────
        case 'checkbox':
            return { control: 'boolean' };
        // ── Color ──────────────────────────────────────────────────
        case 'color':
            return { control: 'color' };
        case 'color_background':
            // supports gradients (CSS background value), not just hex
            return { control: 'text' };
        case 'color_scheme':
            // themes typically define scheme_1 … scheme_N; default to 5
            return {
                control: 'select',
                options: ['scheme_1', 'scheme_2', 'scheme_3', 'scheme_4', 'scheme_5'],
            };
        // ── Choice ─────────────────────────────────────────────────
        case 'select':
            return {
                control: 'select',
                options: setting.options?.map((o) => o.value) ?? [],
            };
        case 'radio':
            return {
                control: 'radio',
                options: setting.options?.map((o) => o.value) ?? [],
            };
        case 'text_alignment':
            return {
                control: 'inline-radio',
                options: ['left', 'center', 'right'],
            };
        // ── Media / Shopify resources ───────────────────────────────
        // These are all complex objects in real Shopify; use object control
        // so story authors can paste in a mock object (or leave null).
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
            return { control: 'object' };
        default:
            return { control: 'text' };
    }
}
//# sourceMappingURL=schema-parser.js.map