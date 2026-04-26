import type { InputType } from 'storybook/internal/types';

const DOC_BLOCK_RE = /\{%-?\s*doc\s*-?%\}([\s\S]*?)\{%-?\s*enddoc\s*-?%\}/;
// Matches: @param {type} name - description
//      or: @param {type} [name] - description   (optional)
const PARAM_RE = /@param\s+\{(\w+)\}\s+(\[[\w.]+\]|[\w.]+)(?:\s+-\s*(.+))?/g;

export function parseDocArgTypes(template: string): Record<string, InputType> {
  const docMatch = template.match(DOC_BLOCK_RE);
  if (!docMatch) return {};

  const docContent = docMatch[1];
  const argTypes: Record<string, InputType> = {};

  PARAM_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = PARAM_RE.exec(docContent)) !== null) {
    const [, liquidType, rawName, description = ''] = match;
    const isOptional = rawName.startsWith('[');
    const name = rawName.replace(/^\[|\]$/g, '');

    argTypes[name] = {
      name,
      description: description.trim(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      control: liquidTypeToControl(liquidType) as any,
      table: {
        type: { summary: liquidType },
        ...(isOptional ? { defaultValue: { summary: 'undefined' } } : {}),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: { name: liquidTypeToTsName(liquidType), required: !isOptional } as any,
    };
  }

  return argTypes;
}

function liquidTypeToControl(type: string): string {
  switch (type) {
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'object': return 'object';
    default: return 'text';
  }
}

function liquidTypeToTsName(type: string): string {
  switch (type) {
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'object': return 'object';
    default: return 'string';
  }
}
