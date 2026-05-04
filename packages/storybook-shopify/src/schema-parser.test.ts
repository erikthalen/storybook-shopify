import { describe, it, expect } from 'vitest';
import { parseSchemaDefaults } from './schema-parser.js';

describe('parseSchemaDefaults (smoke)', () => {
  it('returns empty object for template with no schema', () => {
    expect(parseSchemaDefaults('no schema here')).toEqual({});
  });
});
