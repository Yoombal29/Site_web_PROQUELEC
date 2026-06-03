import { describe, it, expect } from 'vitest';
const {
  adminUpdatePageSchema,
  draftPageSchema,
  namedVersionSchema,
  themeConfigSchema,
} = await import('./pages.validator.js');

describe('Pages validator schemas', () => {
  it('accepts admin page updates with safe builder JSON fields', () => {
    const payload = {
      structure_json: [{ id: 'section-1', type: 'hero' }],
      categories: ['news', 'home'],
      tags: ['web', 'builder'],
    };

    expect(() => adminUpdatePageSchema.parse(payload)).not.toThrow();
  });

  it('accepts draft autosave payloads with JSON content', () => {
    const payload = { draft_json: { blocks: [{ id: 'block-1', type: 'hero' }] } };
    expect(() => draftPageSchema.parse(payload)).not.toThrow();
  });

  it('rejects draft autosave payloads without draft_json', () => {
    expect(() => draftPageSchema.parse({})).toThrow();
  });

  it('accepts named version creation payloads', () => {
    const payload = {
      version_name: 'Version 1',
      structure_json: [{ id: 'block-1', type: 'hero' }],
    };
    expect(() => namedVersionSchema.parse(payload)).not.toThrow();
  });

  it('accepts theme config updates', () => {
    const payload = {
      theme_config: {
        primaryColor: '#000000',
        secondaryColor: '#111111',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '12px',
        spacingScale: '1.25',
      },
    };
    expect(() => themeConfigSchema.parse(payload)).not.toThrow();
  });

  it('rejects theme config with invalid types', () => {
    const payload = {
      theme_config: {
        primaryColor: 123,
      },
    };
    expect(() => themeConfigSchema.parse(payload)).toThrow();
  });
});
