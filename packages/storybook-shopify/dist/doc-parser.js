const DOC_BLOCK_RE = /\{%-?\s*doc\s*-?%\}([\s\S]*?)\{%-?\s*enddoc\s*-?%\}/;
// Matches: @param {type} name - description
//      or: @param {type} [name] - description   (optional)
const PARAM_RE = /@param\s+\{(\w+)\}\s+(\[[\w.]+\]|[\w.]+)(?:\s+-\s*(.+))?/g;
export function parseDocArgTypes(template) {
    const docMatch = template.match(DOC_BLOCK_RE);
    if (!docMatch)
        return {};
    const docContent = docMatch[1];
    const argTypes = {};
    PARAM_RE.lastIndex = 0;
    let match;
    while ((match = PARAM_RE.exec(docContent)) !== null) {
        const [, liquidType, rawName, description = ''] = match;
        const isOptional = rawName.startsWith('[');
        const name = rawName.replace(/^\[|\]$/g, '');
        argTypes[name] = {
            name,
            description: description.trim(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control: liquidTypeToControl(liquidType),
            table: {
                type: { summary: liquidType },
                ...(isOptional ? { defaultValue: { summary: 'undefined' } } : {}),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: { name: liquidTypeToTsName(liquidType), required: !isOptional },
        };
    }
    return argTypes;
}
function liquidTypeToControl(type) {
    switch (type) {
        case 'boolean': return 'boolean';
        case 'number': return 'number';
        case 'object': return 'object';
        default: return 'text';
    }
}
function liquidTypeToTsName(type) {
    switch (type) {
        case 'boolean': return 'boolean';
        case 'number': return 'number';
        case 'object': return 'object';
        default: return 'string';
    }
}
//# sourceMappingURL=doc-parser.js.map