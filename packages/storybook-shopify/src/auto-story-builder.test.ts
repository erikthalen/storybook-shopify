import { describe, it, expect } from 'vitest';
import { buildAutoStory, buildAutoTitle } from './auto-story-builder.js';

describe('buildAutoTitle', () => {
  it('capitalises the dir and title-cases the filename', () => {
    expect(buildAutoTitle('sections', 'announcement-bar.liquid')).toBe('Sections/Announcement Bar');
  });

  it('handles single-word filenames', () => {
    expect(buildAutoTitle('snippets', 'banner.liquid')).toBe('Snippets/Banner');
  });
});

describe('buildAutoStory — no presets (existing behaviour)', () => {
  it('generates a Default export with section settings context', () => {
    const result = buildAutoStory('sections', 'cart.liquid', '../../sections/cart.liquid', {}, null);
    expect(result).toContain("title: 'Sections/Cart'");
    expect(result).toContain("{ section: { settings: args } }");
    expect(result).toContain('export const Default = {};');
  });

  it('includes args from defaults', () => {
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', { amount: 0 }, null);
    expect(result).toContain('"amount": 0');
    expect(result).toContain('export const Default = {};');
  });

  it('uses block context for block dir', () => {
    const result = buildAutoStory('blocks', 'my-block.liquid', '../../blocks/my-block.liquid', {}, null);
    expect(result).toContain("{ block: { settings: args } }");
  });

  it('uses bare args context for snippets dir', () => {
    const result = buildAutoStory('snippets', 'banner.liquid', '../../snippets/banner.liquid', {}, null);
    expect(result).toContain('renderTemplate(template, args)');
  });
});

describe('buildAutoStory — with presets, no blocks', () => {
  it('generates one named export per preset', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: 'Space' }] };
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', { amount: 0 }, presetsInfo);
    expect(result).toContain("title: 'Sections/Space'");
    expect(result).toContain("name: 'Space'");
    expect(result).toContain('export const Space = {');
    expect(result).not.toContain('export const Default = {}');
  });

  it('uses the plain settings render function (no block destructuring)', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: 'Space' }] };
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', {}, presetsInfo);
    expect(result).toContain('{ section: { settings: args } }');
    expect(result).not.toContain('blocks = []');
  });

  it('puts schema defaults at the default level (not per-story)', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: 'Space' }] };
    const result = buildAutoStory('sections', 'space.liquid', '../../sections/space.liquid', { amount: 0 }, presetsInfo);
    expect(result).toMatch(/export default \{[\s\S]*"amount": 0[\s\S]*\};/);
  });

  it('generates multiple named exports for multiple presets', () => {
    const presetsInfo = {
      hasBlocks: false,
      presets: [{ name: 'Foo' }, { name: 'Bar Baz' }],
    };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const Foo = {');
    expect(result).toContain('export const BarBaz = {');
  });

  it('escapes single quotes in preset name', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: "St. Patrick's Day" }] };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain("name: 'St. Patrick\\'s Day'");
    expect(result).not.toContain("name: 'St. Patrick's Day'");
  });

  it('falls back to Default export when presets array is empty', () => {
    const presetsInfo = { hasBlocks: false, presets: [] };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const Default = {};');
    expect(result).not.toContain('export const  = {');
  });
});

describe('buildAutoStory — with presets and blocks', () => {
  it('uses block-destructuring render function', () => {
    const presetsInfo = {
      hasBlocks: true,
      presets: [{ name: 'Announcement bar', blocks: [{ type: 'item', settings: { text: 'Announcement' } }] }],
    };
    const result = buildAutoStory('sections', 'announcement-bar.liquid', '../../sections/announcement-bar.liquid', {}, presetsInfo);
    expect(result).toContain('blocks = []');
    expect(result).toContain('section: { settings, blocks }');
  });

  it('includes block args in the story export', () => {
    const presetsInfo = {
      hasBlocks: true,
      presets: [{ name: 'Announcement bar', blocks: [{ type: 'item', settings: { text: 'Announcement' } }] }],
    };
    const result = buildAutoStory('sections', 'announcement-bar.liquid', '../../sections/announcement-bar.liquid', {}, presetsInfo);
    expect(result).toContain('"type": "item"');
    expect(result).toContain('"text": "Announcement"');
  });

  it('does not include args key in story export when blocks array is empty', () => {
    const presetsInfo = {
      hasBlocks: true,
      presets: [{ name: 'Header', blocks: [] }],
    };
    const result = buildAutoStory('sections', 'header.liquid', '../../sections/header.liquid', {}, presetsInfo);
    expect(result).not.toContain('args:');
  });
});

describe('toExportName edge cases (via buildAutoStory)', () => {
  it('prefixes a leading digit with underscore', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: '3 Column Layout' }] };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const _3ColumnLayout = {');
  });

  it('strips special characters', () => {
    const presetsInfo = { hasBlocks: false, presets: [{ name: "Hero & Banner!" }] };
    const result = buildAutoStory('sections', 'test.liquid', '../../sections/test.liquid', {}, presetsInfo);
    expect(result).toContain('export const HeroBanner = {');
  });
});
