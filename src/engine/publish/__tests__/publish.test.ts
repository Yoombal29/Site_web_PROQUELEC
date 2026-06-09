import { describe, it, expect, vi } from 'vitest';
import { PublishPipeline } from '../pipeline';
import { RuntimeCompiler } from '../compiler';
import type { Block } from '@/types/builder';
import type { ValidationReport } from '@/engine/validation/types';

describe('PublishPipeline', () => {
  const createMockBlock = (id: string, type = 'text', content = {}): Block => ({
    id,
    type,
    content,
    children: [],
  });

  const mockValidator = {
    validate: vi.fn().mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
      infos: [],
    } as ValidationReport),
  };

  it('compiles a valid draft block tree successfully', async () => {
    const pipeline = new PublishPipeline(undefined, mockValidator);
    
    const draft: Block[] = [
      createMockBlock('1', 'hero', { title: 'Hello', _editorOpen: true }),
      createMockBlock('2', 'section', { bg: 'blue' }),
    ];

    const result = await pipeline.publish('page_123', draft);

    expect(result.status).toBe('success');
    expect(result.snapshot).toBeDefined();
    
    const compiled = result.snapshot?.compiled;
    expect(compiled?.blocks).toHaveLength(2);
    
    // Editor metadata should be stripped by default
    expect(compiled?.blocks[0].content._editorOpen).toBeUndefined();
    expect(compiled?.blocks[0].content.title).toBe('Hello');
  });

  it('strips disabled blocks by default', async () => {
    const pipeline = new PublishPipeline();
    
    const draft: Block[] = [
      { ...createMockBlock('1', 'hero'), enabled: true },
      { ...createMockBlock('2', 'text'), enabled: false }, // Should be stripped
      { ...createMockBlock('3', 'image') }, // Undefined enabled is treated as true
    ];

    const result = await pipeline.publish('page_123', draft);
    
    expect(result.snapshot?.compiled.blocks).toHaveLength(2);
    expect(result.snapshot?.compiled.stats.strippedCount).toBe(1);
  });

  it('returns validation_failed if validator rejects', async () => {
    const failingValidator = {
      validate: vi.fn().mockReturnValue({
        valid: false,
        errors: [{ code: 'E1', severity: 'error', message: 'Bad block' }],
        warnings: [],
        infos: [],
      }),
    };

    const pipeline = new PublishPipeline(undefined, failingValidator);
    
    const result = await pipeline.publish('page_123', []);
    
    expect(result.status).toBe('validation_failed');
    expect(result.errors).toContain('Bad block');
    expect(result.snapshot).toBeUndefined();
  });

  it('reports progress events correctly', async () => {
    const onProgress = vi.fn();
    const pipeline = new PublishPipeline(undefined, undefined, onProgress);
    
    await pipeline.publish('page_123', [createMockBlock('1')]);
    
    // Expect multiple progress events (validating, compiling, done, etc.)
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ stage: 'validating' }));
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ stage: 'compiling' }));
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ stage: 'done' }));
  });
});

describe('RuntimeCompiler', () => {
  it('extracts assets when option is enabled', async () => {
    const compiler = new RuntimeCompiler({ extractAssets: true });
    
    const blocks: Block[] = [
      { id: '1', type: 'image', content: { src: '/uploads/test.png' } },
      { id: '2', type: 'video', content: { src: 'https://youtube.com/watch?v=123' } },
      { id: '3', type: 'text', content: { text: 'Hello' } }
    ];

    const result = await compiler.compile(blocks);
    
    expect(result.assets).toBeDefined();
    expect(result.assets).toHaveLength(2);
    expect(result.assets?.[0].url).toBe('/uploads/test.png');
    expect(result.assets?.[1].type).toBe('video');
  });

  it('respects max depth limit to prevent stack overflows', async () => {
    const compiler = new RuntimeCompiler({ maxDepth: 2 });
    
    // Create a tree of depth 4
    const blocks: Block[] = [{
      id: '1', type: 'section', content: {}, children: [{
        id: '2', type: 'section', content: {}, children: [{
          id: '3', type: 'section', content: {}, children: [{
            id: '4', type: 'text', content: {}
          }]
        }]
      }]
    }];

    const result = await compiler.compile(blocks);
    
    // Depth 0 (1), Depth 1 (2), Depth 2 (3). Block 4 (depth 3) should be dropped.
    expect(result.blocks[0].children?.[0].children?.[0].children?.length).toBe(0);
  });
});
