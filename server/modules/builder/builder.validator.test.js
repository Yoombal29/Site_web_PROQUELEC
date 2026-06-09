import { describe, it, expect } from 'vitest';
const {
  createTemplateSchema,
  updateTemplateSchema,
  updatePageBuilderSchema,
  createSnapshotSchema,
} = await import('./builder.validator.js');

describe('Builder validator schemas', () => {
  it('accepts valid create template payloads with builder blocks', () => {
    const payload = {
      name: 'Template test',
      category: 'Général',
      blocks: [
        {
          id: 'block-1',
          type: 'hero',
          content: { title: 'Hello' },
          style: { padding: '10px' },
          children: [],
        },
      ],
    };

    expect(() => createTemplateSchema.parse(payload)).not.toThrow();
  });

  it('rejects invalid builder block payloads in update template', () => {
    const payload = {
      blocks: [
        {
          id: 'block-1',
          content: { title: 'Missing type' },
        },
      ],
    };

    expect(() => updateTemplateSchema.parse(payload)).toThrow();
  });

  it('validates page builder field updates and published snapshot UUIDs', () => {
    const payload = {
      layout_tree: [{ id: 'node-1', type: 'hero' }],
      theme_config: { primary: '#fff' },
      bindings: [],
      animation_config: {},
      published_snapshot_id: '123e4567-e89b-12d3-a456-426614174000',
    };

    expect(() => updatePageBuilderSchema.parse(payload)).not.toThrow();
  });

  it('validates snapshot payloads with JSON data', () => {
    const payload = {
      label: 'Snapshot test',
      snapshot: [{ id: 'block-1', type: 'hero' }],
    };

    expect(() => createSnapshotSchema.parse(payload)).not.toThrow();
  });
});
