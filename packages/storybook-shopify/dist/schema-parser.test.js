import { describe, it, expect } from 'vitest';
import { parseSchemaDefaults, parsePresets } from './schema-parser.js';
describe('parseSchemaDefaults (smoke)', () => {
    it('returns empty object for template with no schema', () => {
        expect(parseSchemaDefaults('no schema here')).toEqual({});
    });
});
describe('parsePresets', () => {
    it('returns null when no schema block present', () => {
        expect(parsePresets('no schema here')).toBeNull();
    });
    it('returns null when schema has no presets key', () => {
        const template = `{% schema %}{"name": "Test", "settings": []}{% endschema %}`;
        expect(parsePresets(template)).toBeNull();
    });
    it('returns null when presets array is empty', () => {
        const template = `{% schema %}{"presets": []}{% endschema %}`;
        expect(parsePresets(template)).toBeNull();
    });
    it('returns preset with no blocks for a simple preset', () => {
        const template = `{% schema %}{"presets": [{"name": "Space"}]}{% endschema %}`;
        expect(parsePresets(template)).toEqual({
            hasBlocks: false,
            presets: [{ name: 'Space' }],
        });
    });
    it('returns hasBlocks true when schema defines block types', () => {
        const template = `{% schema %}{
      "blocks": [{"type": "item", "settings": []}],
      "presets": [{"name": "My Section"}]
    }{% endschema %}`;
        expect(parsePresets(template)).toEqual({
            hasBlocks: true,
            presets: [{ name: 'My Section' }],
        });
    });
    it('resolves block defaults from schema block type definitions', () => {
        const template = `{% schema %}{
      "blocks": [
        {
          "type": "item",
          "settings": [
            {"type": "text", "id": "text", "label": "Text", "default": "Announcement"},
            {"type": "url", "id": "url", "label": "Link"}
          ]
        }
      ],
      "presets": [
        {"name": "Announcement bar", "blocks": [{"type": "item"}]}
      ]
    }{% endschema %}`;
        expect(parsePresets(template)).toEqual({
            hasBlocks: true,
            presets: [
                {
                    name: 'Announcement bar',
                    blocks: [{ type: 'item', settings: { text: 'Announcement' } }],
                },
            ],
        });
    });
    it('preset block settings override block type defaults', () => {
        const template = `{% schema %}{
      "blocks": [
        {"type": "item", "settings": [{"type": "text", "id": "text", "default": "Default"}]}
      ],
      "presets": [
        {"name": "Custom", "blocks": [{"type": "item", "settings": {"text": "Override"}}]}
      ]
    }{% endschema %}`;
        const result = parsePresets(template);
        expect(result?.presets[0].blocks?.[0].settings).toEqual({ text: 'Override' });
    });
    it('handles blocks with no schema defaults (empty settings object)', () => {
        const template = `{% schema %}{
      "blocks": [{"type": "_cart-drawer"}],
      "presets": [{"name": "Header", "blocks": [{"type": "_cart-drawer"}]}]
    }{% endschema %}`;
        expect(parsePresets(template)).toEqual({
            hasBlocks: true,
            presets: [
                { name: 'Header', blocks: [{ type: '_cart-drawer', settings: {} }] },
            ],
        });
    });
    it('handles multiple presets', () => {
        const template = `{% schema %}{
      "presets": [{"name": "Foo"}, {"name": "Bar"}]
    }{% endschema %}`;
        const result = parsePresets(template);
        expect(result?.presets).toHaveLength(2);
        expect(result?.presets[0].name).toBe('Foo');
        expect(result?.presets[1].name).toBe('Bar');
    });
});
//# sourceMappingURL=schema-parser.test.js.map