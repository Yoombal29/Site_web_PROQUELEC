import { describe, it, expect } from 'vitest';
import { validateBuilderStructure, validateThemeConfig, validatePageRecord } from './builderSchema';

describe('Builder structure validation', () => {
  it('accepts a top-level array of blocks', () => {
    const payload = [
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        type: 'hero',
        content: { title: 'Hello' },
      },
    ];

    const result = validateBuilderStructure(payload);
    expect(result.success).toBe(true);
  });

  it('accepts a structure object with blocks and optional version', () => {
    const payload = {
      blocks: [
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          type: 'hero',
          content: { title: 'Hello' },
        },
      ],
      version: 2,
    };

    const result = validateBuilderStructure(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe(2);
    }
  });

  it('rejects invalid block structure', () => {
    const payload = [
      {
        id: 'invalid-uuid',
        content: { title: 'Invalid block' },
      },
    ];

    const result = validateBuilderStructure(payload);
    expect(result.success).toBe(false);
  });

  it('accepts a Craft.js serialized structure', () => {
    const payload = {
      ROOT: {
        type: 'ROOT',
        nodes: {
          '1234': {
            type: 'DIV',
            nodes: [],
          },
        },
      },
    };

    const result = validateBuilderStructure(payload);
    expect(result.success).toBe(true);
  });

  it('validates theme config payloads', () => {
    const payload = {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '10px',
      spacingScale: '1.15',
    };

    const result = validateThemeConfig(payload);
    expect(result.success).toBe(true);
  });

  it('rejects invalid theme config value types', () => {
    const payload = {
      primaryColor: 123,
    };

    const result = validateThemeConfig(payload);
    expect(result.success).toBe(false);
  });

  it('validates a full page record payload', () => {
    const payload = {
      id: 'page-1',
      title: 'Page Test',
      slug: 'page-test',
      content: '<h1>Test</h1>',
      excerpt: 'Résumé',
      content_blocks: [
        {
          id: 'a1b2c3d4-e5f6-4789-9045-1234567890ab',
          type: 'hero',
          version: 1,
          data: { title: 'Bienvenue' }
        }
      ],
      workflow_status: 'draft',
      is_published: false,
      is_sticky: false,
      comment_status: 'open',
      meta_description: 'Description test',
      meta_keywords: 'test, builder',
      featured_image: 'https://example.com/image.jpg',
      design_options: {
        layout: 'default',
        hero_enabled: true,
        hero_height: 'medium',
        hero_overlay: 0.3,
        hero_alignment: 'center',
        content_width: 'default',
        sidebar_enabled: false,
        sidebar_position: 'right',
        footer_cta_enabled: true,
        background_color: '#ffffff',
        accent_color: '#000000',
        text_color: '#111111',
        heading_font: 'Inter, sans-serif',
        body_font: 'Inter, sans-serif',
        custom_sections: []
      },
      seo_options: {
        focus_keyword: 'builder',
        meta_description: 'Meta test',
        canonical_url: 'https://example.com/page-test',
        og_image: 'https://example.com/og.jpg',
        og_title: 'OG Title',
        og_description: 'OG Description',
        twitter_card: 'summary',
        schema_type: 'WebPage'
      },
      plugins_active: [],
      language_code: 'fr',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = validatePageRecord(payload);
    expect(result.success).toBe(true);
  });
});
