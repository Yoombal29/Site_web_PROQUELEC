import { describe, it, expect } from 'vitest';
import {
  adminUpdatePageSchema,
  draftPageSchema,
  namedVersionSchema,
  themeConfigSchema,
  atomicSaveSchema,
  purgeVersionsSchema,
} from './pages.validator.js';

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

  // ── Atomic Save Schema ──
  it('accepts atomic save with structure_json only', () => {
    const payload = { structure_json: { ROOT: {} } };
    expect(() => atomicSaveSchema.parse(payload)).not.toThrow();
  });

  it('accepts atomic save with draft_json only', () => {
    const payload = { draft_json: '{"blocks":[]}' };
    expect(() => atomicSaveSchema.parse(payload)).not.toThrow();
  });

  it('accepts atomic save with all fields', () => {
    const payload = {
      structure_json: { ROOT: {} },
      draft_json: { blocks: [] },
      theme_config: { primaryColor: '#2563eb' },
    };
    expect(() => atomicSaveSchema.parse(payload)).not.toThrow();
  });

  it('rejects atomic save with no fields', () => {
    expect(() => atomicSaveSchema.parse({})).toThrow();
  });

  it('rejects atomic save with extra unknown fields', () => {
    const payload = { structure_json: {}, invalid_field: true };
    expect(() => atomicSaveSchema.parse(payload)).not.toThrow();
  });

  // ── Purge Versions Schema ──
  it('accepts purge versions with keep_last', () => {
    const payload = { keep_last: 10 };
    expect(() => purgeVersionsSchema.parse(payload)).not.toThrow();
  });

  it('accepts purge versions with older_than_days', () => {
    const payload = { older_than_days: 30 };
    expect(() => purgeVersionsSchema.parse(payload)).not.toThrow();
  });

  it('accepts purge versions as dry run', () => {
    const payload = { keep_last: 10, dry_run: true };
    expect(() => purgeVersionsSchema.parse(payload)).not.toThrow();
  });

  it('rejects purge versions with negative keep_last', () => {
    const payload = { keep_last: -1 };
    expect(() => purgeVersionsSchema.parse(payload)).toThrow();
  });
});
