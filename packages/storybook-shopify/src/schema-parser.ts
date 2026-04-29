import type { InputType } from 'storybook/internal/types';

const SCHEMA_BLOCK_RE = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/;

interface ShopifySetting {
  type: string;
  id: string;
  label: string;
  info?: string;
  default?: unknown;
  // select / radio
  options?: Array<{ value: string; label: string }>;
  // range
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  // video_url
  accept?: string[];
  // metaobject
  metaobject_type?: string;
}

// Setting types that are UI chrome, not actual data inputs
const SIDEBAR_TYPES = new Set(['header', 'paragraph', 'color_scheme_group']);

export function parseSchemaDefaults(template: string): Record<string, unknown> {
  const match = template.match(SCHEMA_BLOCK_RE);
  if (!match) return {};
  let schema: { settings?: ShopifySetting[] };
  try {
    schema = JSON.parse(match[1].trim());
  } catch {
    return {};
  }
  const defaults: Record<string, unknown> = {};
  for (const setting of schema.settings ?? []) {
    if (setting.id && setting.default !== undefined) {
      defaults[setting.id] = setting.default;
    }
  }
  return defaults;
}

export function parseSchemaArgTypes(template: string): Record<string, InputType> {
  const match = template.match(SCHEMA_BLOCK_RE);
  if (!match) return {};

  let schema: { settings?: ShopifySetting[] };
  try {
    schema = JSON.parse(match[1].trim());
  } catch {
    return {};
  }

  const settings = schema.settings;
  if (!settings?.length) return {};

  const argTypes: Record<string, InputType> = {};

  for (const setting of settings) {
    if (SIDEBAR_TYPES.has(setting.type)) continue;

    const { control, options, typeName } = resolveControl(setting);

    argTypes[setting.id] = {
      name: setting.id,
      description: setting.info ?? setting.label,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: { name: typeName, required: false } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      control: control as any,
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

function resolveControl(setting: ShopifySetting): {
  control: string | Record<string, unknown>;
  typeName: string;
  options?: string[];
} {
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
