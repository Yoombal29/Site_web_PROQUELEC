import { describe, it, expect } from 'vitest';
import { validateBlockTree } from '../block-validator';
import { validateTokens } from '../token-validator';
import { validateLayout } from '../layout-validator';
import { validateBindings } from '../binding-validator';
import { validateAnimations } from '../animation-validator';
import { validatePlugins } from '../plugin-validator';
import { validatePublishReady } from '../publish-validator';
import { validateAISafety } from '../ai-safety';
import { validateRuntime } from '../runtime-validator';
import type { ValidationIssue } from '../types';

// ─── Helper ──────────────────────────────────────────────────────────────────

function hasCode(issues: ValidationIssue[], code: string): boolean {
  return issues.some(i => i.code === code);
}

function errorCount(issues: ValidationIssue[]): number {
  return issues.filter(i => i.severity === 'error').length;
}

// ─── Block Validator ─────────────────────────────────────────────────────────

describe('BlockValidator', () => {
  it('should pass for empty blocks', () => {
    const issues = validateBlockTree({ blocks: [] });
    expect(errorCount(issues)).toBe(0);
  });

  it('should reject blocks without id', () => {
    const issues = validateBlockTree({ blocks: [{ type: 'text', content: {} }] });
    expect(hasCode(issues, 'BLOCK_MISSING_ID')).toBe(true);
  });

  it('should reject unknown block type', () => {
    const issues = validateBlockTree({
      blocks: [{ id: '1', type: 'unknownType', content: {} }],
    });
    expect(hasCode(issues, 'BLOCK_UNKNOWN_TYPE')).toBe(true);
  });

  it('should pass for known block types', () => {
    const issues = validateBlockTree({
      blocks: [
        { id: 'hero-1', type: 'hero', content: { title: 'Hello' } },
        { id: 'text-1', type: 'text', content: { text: 'World' } },
        { id: 'btn-1', type: 'button', content: { text: 'Click' } },
      ],
    });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect duplicate IDs', () => {
    const issues = validateBlockTree({
      blocks: [
        { id: 'dup', type: 'text', content: {} },
        { id: 'dup', type: 'text', content: {} },
      ],
    });
    expect(hasCode(issues, 'BLOCK_DUPLICATE_IDS')).toBe(true);
  });

  it('should detect excessive depth', () => {
    const deepBlock: Record<string, unknown> = { id: 'level-0', type: 'section', content: { title: 'x' }, children: [] };
    let current = deepBlock;
    for (let i = 1; i <= 12; i++) {
      const child: Record<string, unknown> = {
        id: `level-${i}`, type: 'section', content: { title: 'x' }, children: [],
      };
      current.children = [child];
      current = child;
    }
    const issues = validateBlockTree({ blocks: [deepBlock] });
    expect(hasCode(issues, 'BLOCK_MAX_DEPTH_EXCEEDED')).toBe(true);
  });

  it('should reject non-array blocks root', () => {
    const issues = validateBlockTree({ blocks: null as unknown as [] });
    expect(hasCode(issues, 'BLOCKS_NOT_ARRAY')).toBe(true);
  });

  it('should detect children in non-parent block types', () => {
    const issues = validateBlockTree({
      blocks: [{
        id: 'bad',
        type: 'text',
        content: {},
        children: [{ id: 'child', type: 'button', content: {} }],
      }],
    });
    expect(hasCode(issues, 'BLOCK_CHILD_IN_PARENT')).toBe(true);
  });
});

// ─── Token Validator ─────────────────────────────────────────────────────────

describe('TokenValidator', () => {
  it('should pass for valid tokens', () => {
    const issues = validateTokens({
      blocks: [{
        id: 'b1',
        type: 'hero',
        style: { background: 'primary.500', color: 'neutral.100' },
      }],
    });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect invalid color shade', () => {
    const issues = validateTokens({
      blocks: [{
        id: 'b1',
        type: 'hero',
        style: { background: 'primary.999' },
      }],
    });
    expect(hasCode(issues, 'TOKEN_INVALID_COLOR_SHADE')).toBe(true);
  });

  it('should detect invalid spacing token', () => {
    const issues = validateTokens({
      blocks: [{
        id: 'b1',
        type: 'section',
        style: { padding: 'spacing.xxl' },
      }],
    });
    expect(hasCode(issues, 'TOKEN_INVALID_SPACING')).toBe(true);
  });

  it('should detect invalid radius token', () => {
    const issues = validateTokens({
      blocks: [{
        id: 'b1',
        type: 'card',
        style: { borderRadius: 'radius.xxl' },
      }],
    });
    expect(hasCode(issues, 'TOKEN_INVALID_RADIUS')).toBe(true);
  });

  it('should detect invalid shadow token', () => {
    const issues = validateTokens({
      blocks: [{
        id: 'b1',
        type: 'card',
        style: { boxShadow: 'shadow.extreme' },
      }],
    });
    expect(hasCode(issues, 'TOKEN_INVALID_SHADOW')).toBe(true);
  });

  it('should pass for hardcoded CSS values (not token-prefixed)', () => {
    const issues = validateTokens({
      blocks: [{
        id: 'b1',
        type: 'hero',
        style: { background: '#ff0000', padding: '16px' },
      }],
    });
    expect(errorCount(issues)).toBe(0);
  });
});

// ─── Layout Validator ────────────────────────────────────────────────────────

describe('LayoutValidator', () => {
  it('should pass for valid layout', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'section',
        style: { display: 'flex', flexDirection: 'row', gap: '16px' },
      }],
    });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect invalid position', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'text',
        style: { position: 'floating' },
      }],
    });
    expect(hasCode(issues, 'LAYOUT_INVALID_POSITION')).toBe(true);
  });

  it('should detect invalid overflow', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'text',
        style: { overflow: 'scrollable' },
      }],
    });
    expect(hasCode(issues, 'LAYOUT_INVALID_OVERFLOW')).toBe(true);
  });

  it('should detect invalid z-index', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'text',
        style: { zIndex: 'NaN' },
      }],
    });
    expect(hasCode(issues, 'LAYOUT_INVALID_Z_INDEX')).toBe(true);
  });

  it('should detect missing coords for absolute', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'text',
        style: { position: 'absolute' },
      }],
    });
    expect(hasCode(issues, 'LAYOUT_ABSOLUTE_MISSING_COORDS')).toBe(true);
  });

  it('should detect negative sizes', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'text',
        style: { width: '-100px', height: '50px' },
      }],
    });
    expect(hasCode(issues, 'LAYOUT_NEGATIVE_SIZE')).toBe(true);
  });

  it('should detect invalid aspect ratio', () => {
    const issues = validateLayout({
      blocks: [{
        id: 'b1',
        type: 'image',
        style: { aspectRatio: '16/0' },
      }],
    });
    expect(hasCode(issues, 'LAYOUT_INVALID_ASPECT_RATIO')).toBe(true);
  });
});

// ─── Binding Validator ───────────────────────────────────────────────────────

describe('BindingValidator', () => {
  it('should pass without bindings', () => {
    const issues = validateBindings({ blocks: [], bindings: [] });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect empty template expression', () => {
    const issues = validateBindings({
      blocks: [{
        id: 'b1',
        type: 'text',
        content: { text: 'Hello {{}}' },
      }],
      bindings: [],
    });
    expect(hasCode(issues, 'BINDING_EMPTY_EXPRESSION')).toBe(true);
  });

  it('should detect invalid source type in binding', () => {
    const issues = validateBindings({
      blocks: [],
      bindings: [{
        id: 'bind-1', node_id: 'b1', source_type: 'graphql', source_config: {},
      }],
    });
    expect(hasCode(issues, 'BINDING_INVALID_SOURCE_TYPE_TABLE')).toBe(true);
  });

  it('should pass for valid template syntax', () => {
    const issues = validateBindings({
      blocks: [{
        id: 'b1',
        type: 'text',
        content: { text: '{{page.title}}' },
      }],
      bindings: [],
    });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect unknown filter', () => {
    const issues = validateBindings({
      blocks: [{
        id: 'b1',
        type: 'text',
        content: { text: '{{page.title | unknownFilter}}' },
      }],
      bindings: [],
    });
    expect(hasCode(issues, 'BINDING_UNKNOWN_FILTER')).toBe(true);
  });
});

// ─── Animation Validator ─────────────────────────────────────────────────────

describe('AnimationValidator', () => {
  it('should pass without animations', () => {
    const issues = validateAnimations({ blocks: [] });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect unknown preset', () => {
    const issues = validateAnimations({
      blocks: [{
        id: 'b1',
        type: 'text',
        animations: [{ preset: 'nonExistentPreset' }],
      }],
    });
    expect(hasCode(issues, 'ANIMATION_UNKNOWN_PRESET')).toBe(true);
  });

  it('should pass for valid preset', () => {
    const issues = validateAnimations({
      blocks: [{
        id: 'b1',
        type: 'hero',
        animations: [{ preset: 'fadeUp', duration: '500ms', trigger: 'viewport' }],
      }],
    });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect invalid duration', () => {
    const issues = validateAnimations({
      blocks: [{
        id: 'b1',
        type: 'text',
        animations: [{ preset: 'fadeIn', duration: 'not-a-duration' }],
      }],
    });
    expect(hasCode(issues, 'ANIMATION_INVALID_DURATION')).toBe(true);
  });

  it('should detect invalid trigger', () => {
    const issues = validateAnimations({
      blocks: [{
        id: 'b1',
        type: 'text',
        animations: [{ preset: 'fadeIn', trigger: 'onLoad' }],
      }],
    });
    expect(hasCode(issues, 'ANIMATION_INVALID_TRIGGER')).toBe(true);
  });

  it('should validate stagger config', () => {
    const issues = validateAnimations({
      blocks: [{
        id: 'b1',
        type: 'section',
        animations: [{
          preset: 'fadeUp',
          stagger: { delayPerChild: 'bad', direction: 'diagonal', spatial: 'circular' },
        }],
      }],
    });
    expect(hasCode(issues, 'ANIMATION_INVALID_STAGGER_DELAY')).toBe(true);
    expect(hasCode(issues, 'ANIMATION_INVALID_STAGGER_DIRECTION')).toBe(true);
    expect(hasCode(issues, 'ANIMATION_INVALID_STAGGER_SPATIAL')).toBe(true);
  });
});

// ─── Plugin Validator ────────────────────────────────────────────────────────

describe('PluginValidator', () => {
  it('should pass for empty plugins', () => {
    const issues = validatePlugins({ plugins: [], blocks: [] });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect missing name', () => {
    const issues = validatePlugins({
      plugins: [{ version: '1.0.0' }],
      blocks: [],
    });
    expect(hasCode(issues, 'PLUGIN_MISSING_NAME')).toBe(true);
  });

  it('should detect duplicate plugin names', () => {
    const issues = validatePlugins({
      plugins: [
        { name: 'duplicate' },
        { name: 'duplicate' },
      ],
      blocks: [],
    });
    expect(hasCode(issues, 'PLUGIN_DUPLICATE_NAME')).toBe(true);
  });

  it('should pass for valid plugin config', () => {
    const issues = validatePlugins({
      plugins: [{
        name: 'my-plugin',
        version: '1.0.0',
        config: {
          events: [{ event: 'block:created' }],
          commands: [{ type: 'CREATE_NODE' }],
          panels: [{ position: 'sidebar' }],
        },
      }],
      blocks: [],
    });
    expect(errorCount(issues)).toBe(0);
  });

  it('should detect invalid panel position', () => {
    const issues = validatePlugins({
      plugins: [{
        name: 'my-plugin',
        config: { panels: [{ position: 'topbar' }] },
      }],
      blocks: [],
    });
    expect(hasCode(issues, 'PLUGIN_INVALID_PANEL_POSITION')).toBe(true);
  });
});

// ─── Publish Validator ──────────────────────────────────────────────────────

describe('PublishValidator', () => {
  it('should reject empty page for publish', () => {
    const report = validatePublishReady({ blocks: [] });
    expect(report.valid).toBe(false);
    expect(hasCode(report.errors, 'PUBLISH_NO_BLOCKS')).toBe(true);
  });

  it('should pass for valid page', () => {
    const report = validatePublishReady({
      blocks: [{
        id: 'hero-1',
        type: 'hero',
        content: { title: 'Welcome' },
        style: { background: 'primary.500' },
      }],
    });
    expect(report.valid).toBe(true);
  });
});

// ─── AI Safety Validator ─────────────────────────────────────────────────────

describe('AISafetyValidator', () => {
  it('should flag raw HTML blocks', () => {
    const issues = validateAISafety({
      blocks: [{
        id: 'b1',
        type: 'html',
        content: { html: '<script>alert("xss")</script>' },
      }],
    });
    expect(hasCode(issues, 'AI_SAFETY_RAW_HTML')).toBe(true);
  });

  it('should flag dangerous content keys', () => {
    const issues = validateAISafety({
      blocks: [{
        id: 'b1',
        type: 'text',
        content: { dangerouslySetInnerHTML: { __html: '<b>bold</b>' } },
      }],
    });
    expect(hasCode(issues, 'AI_SAFETY_DANGEROUS_CONTENT')).toBe(true);
  });

  it('should flag blocked protocols in image src', () => {
    const issues = validateAISafety({
      blocks: [{
        id: 'b1',
        type: 'image',
        content: { src: 'javascript:alert(1)' },
      }],
    });
    expect(hasCode(issues, 'AI_SAFETY_BLOCKED_PROTOCOL')).toBe(true);
  });

  it('should flag blocked protocols in button href', () => {
    const issues = validateAISafety({
      blocks: [{
        id: 'b1',
        type: 'button',
        content: { text: 'Click', href: 'javascript:void(0)' },
      }],
    });
    expect(hasCode(issues, 'AI_SAFETY_BLOCKED_HREF')).toBe(true);
  });

  it('should detect unlikely block types', () => {
    const issues = validateAISafety({
      blocks: [{
        id: 'b1',
        type: 'script',
        content: {},
      }],
    });
    expect(hasCode(issues, 'AI_SAFETY_UNLIKELY_BLOCK_TYPE')).toBe(true);
  });

  it('should pass for safe blocks', () => {
    const issues = validateAISafety({
      blocks: [{
        id: 'b1',
        type: 'hero',
        content: { title: 'Welcome' },
      }],
    });
    expect(errorCount(issues)).toBe(0);
  });
});

// ─── Runtime Validator (orchestrator) ────────────────────────────────────────

describe('RuntimeValidator', () => {
  it('should return valid report for empty state', () => {
    const report = validateRuntime({ blocks: [] }, { mode: 'save' });
    expect(report.valid).toBe(true);
  });

  it('should return invalid report for unknown block type', () => {
    const report = validateRuntime({
      blocks: [{ id: 'b1', type: 'unknownType', content: {} }],
    }, { mode: 'save' });
    expect(report.valid).toBe(false);
  });

  it('should run all validators in full mode', () => {
    const ctx = {
      blocks: [{
        id: 'b1',
        type: 'hero',
        content: { title: 'Test' },
        style: { background: 'primary.500' },
        animations: [{ preset: 'fadeUp' }],
      }],
    };
    const report = validateRuntime(ctx as Parameters<typeof validateRuntime>[0], { mode: 'full' });
    expect(report.valid).toBe(true);
    // Full mode should include warnings about hardcoded colors etc.
    expect(Array.isArray(report.warnings)).toBe(true);
  });

  it('should detect publish blocking errors', () => {
    const report = validateRuntime({ blocks: [] }, { mode: 'publish' });
    expect(report.valid).toBe(false);
    expect(report.errors.some(e => e.code === 'PUBLISH_NO_BLOCKS')).toBe(true);
  });

  it('should run AI safety in ai mode', () => {
    const report = validateRuntime({
      blocks: [{
        id: 'b1',
        type: 'html',
        content: { html: '<script>alert(1)</script>' },
      }],
    }, { mode: 'ai' });
    expect(report.errors).toEqual([]);
    expect(report.infos.some(w => w.code === 'AI_SAFETY_RAW_HTML')).toBe(true);
  });
});
