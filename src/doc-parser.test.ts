import { describe, it, expect } from 'vitest';
import { parseDocDefaults } from './doc-parser.js';

describe('parseDocDefaults', () => {
  it('returns empty object when no doc block', () => {
    expect(parseDocDefaults('<div>{{ title }}</div>')).toEqual({});
  });

  it('derives a readable default from a string param name', () => {
    const template = `
      {% doc %}
        @param {string} title - The heading
      {% enddoc %}
    `;
    expect(parseDocDefaults(template)).toEqual({ title: 'Title' });
  });

  it('converts underscores to spaces and capitalises each word', () => {
    const template = `
      {% doc %}
        @param {string} heading_text - Main heading
      {% enddoc %}
    `;
    expect(parseDocDefaults(template)).toEqual({ heading_text: 'Heading Text' });
  });

  it('handles optional string params', () => {
    const template = `
      {% doc %}
        @param {string} [subtitle] - Optional subheading
      {% enddoc %}
    `;
    expect(parseDocDefaults(template)).toEqual({ subtitle: 'Subtitle' });
  });

  it('does not override non-string types that have fixtures', () => {
    const template = `
      {% doc %}
        @param {boolean} show_divider - Toggle
        @param {number} count - A number
      {% enddoc %}
    `;
    const defaults = parseDocDefaults(template);
    expect(defaults.show_divider).toBeUndefined();
    expect(defaults.count).toBeUndefined();
  });
});
