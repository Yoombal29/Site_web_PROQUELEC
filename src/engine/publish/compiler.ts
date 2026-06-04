import type { Block } from '@/types/builder';
import type { 
  PublishOptions, 
  CompiledBlock, 
  CompiledRuntime, 
  ExtractedAsset,
  PipelineProgress
} from './types';
import { DEFAULT_PUBLISH_OPTIONS } from './types';
import { ANIMATION_DEFINITIONS, ANIMATION_KEYFRAMES } from '@/components/blocks/animationPresets';

export class RuntimeCompiler {
  private options: Required<PublishOptions>;
  private originalBlockCount = 0;
  private compiledBlockCount = 0;
  private strippedCount = 0;
  private assets: ExtractedAsset[] = [];
  private onProgress?: (progress: PipelineProgress) => void;

  constructor(
    options: PublishOptions = {},
    onProgress?: (progress: PipelineProgress) => void
  ) {
    this.options = { ...DEFAULT_PUBLISH_OPTIONS, ...options };
    this.onProgress = onProgress;
  }

  /**
   * Compiles a draft block tree into a minimal runtime tree.
   */
  public async compile(blocks: Block[], schemaVersion = 1): Promise<CompiledRuntime> {
    const startTime = performance.now();
    this.resetStats();

    this.reportProgress('compiling', 'Compiling blocks...', 10);
    const compiledBlocks = this.compileTree(blocks, 0);

    let animationCSS: string | undefined = undefined;
    if (this.options.inlineAnimationCSS) {
      this.reportProgress('compiling_animations', 'Inlining animation CSS...', 80);
      animationCSS = this.generateAnimationCSS(compiledBlocks);
    }

    if (this.options.extractAssets) {
      this.reportProgress('extracting_assets', 'Extracting assets...', 90);
      // Assets are populated during tree traversal
    }

    this.reportProgress('packaging', 'Packaging runtime...', 95);

    const compileDurationMs = performance.now() - startTime;

    this.reportProgress('done', 'Compilation complete', 100);

    return {
      schemaVersion,
      blocks: compiledBlocks,
      animationCSS,
      assets: this.options.extractAssets ? [...this.assets] : undefined,
      stats: {
        originalBlockCount: this.originalBlockCount,
        compiledBlockCount: this.compiledBlockCount,
        strippedCount: this.strippedCount,
        assetCount: this.assets.length,
        compileDurationMs,
      },
    };
  }

  private compileTree(blocks: Block[], depth: number): CompiledBlock[] {
    if (depth > this.options.maxDepth) {
      console.warn(`[RuntimeCompiler] Max depth exceeded (${depth} > ${this.options.maxDepth})`);
      return [];
    }

    const compiled: CompiledBlock[] = [];

    for (const block of blocks) {
      this.originalBlockCount++;

      // Skip disabled blocks if option is true
      if (this.options.stripDisabledBlocks && block.enabled === false) {
        this.strippedCount++;
        continue;
      }

      const compiledBlock = this.compileNode(block);

      if (block.children && block.children.length > 0) {
        compiledBlock.children = this.compileTree(block.children, depth + 1);
      }

      compiled.push(compiledBlock);
      this.compiledBlockCount++;
    }

    return compiled;
  }

  private compileNode(block: Block): CompiledBlock {
    // Basic structural copy
    const compiled: CompiledBlock = {
      id: block.id,
      type: block.type,
      content: { ...block.content },
    };

    if (block.style) {
      compiled.style = { ...block.style };
    }

    // Extract entrance animation from block props and populate animationClasses
    const props = block.content as Record<string, unknown>;
    const entranceAnim = this.getResponsiveValue<string>(props.entranceAnimation ?? props.entryAnimation, 'none');
    if (entranceAnim && entranceAnim !== 'none') {
      // Store animation duration/delay as CSS variables on style
      const animStyle: Record<string, string> = {};
      const duration = props.animationDuration;
      if (duration !== undefined && duration !== null) {
        const dur = this.getResponsiveValue<number | string>(duration, 600);
        animStyle['--anim-duration'] = `${dur}ms`;
      }
      const delay = props.animationDelay;
      if (delay !== undefined && delay !== null) {
        const del = this.getResponsiveValue<number | string>(delay, 0);
        animStyle['--anim-delay'] = `${del}ms`;
      }
      if (props.animationEasing) {
        const easing = this.getResponsiveValue<string>(props.animationEasing);
        if (easing) animStyle['--anim-easing'] = String(easing);
      }
      if (props.animationRepeat) {
        const repeat = this.getResponsiveValue<string | number>(props.animationRepeat);
        if (repeat) animStyle['--anim-iteration-count'] = String(repeat);
      }
      if (props.animationDirection) {
        const direction = this.getResponsiveValue<string>(props.animationDirection);
        if (direction) animStyle['--anim-direction'] = String(direction);
      }
      if (props.animationFillMode) {
        const fillMode = this.getResponsiveValue<string>(props.animationFillMode);
        if (fillMode) animStyle['--anim-fill-mode'] = String(fillMode);
      }

      compiled.animationClasses = [`animate-${entranceAnim}-vp`];
      const trigger = this.getResponsiveValue<string>(props.animationTrigger);
      if (trigger === 'load') {
        compiled.animationClasses.push('animation-trigger-load');
      }
      if (Object.keys(animStyle).length > 0) {
        compiled.style = { ...compiled.style, ...animStyle };
      }
    }

    // Process options
    if (this.options.stripEditorMetadata) {
      this.stripEditorMeta(compiled);
    }

    if (this.options.extractAssets) {
      this.extractNodeAssets(block);
    }

    // We don't implement full binding resolution here, but we'd hook into the DataStore if we had it
    if (this.options.optimizeBindings && block.bindings) {
      // Placeholder: in reality, we'd resolve static data source values
      // compiled.resolvedBindings = ...
    }

    return compiled;
  }

  private getResponsiveValue<T>(value: unknown, fallback?: T): T | undefined {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const responsive = value as { desktop?: T; tablet?: T; mobile?: T };
      return responsive.desktop ?? responsive.tablet ?? responsive.mobile ?? fallback;
    }
    return value as T;
  }

  private stripEditorMeta(block: CompiledBlock) {
    // Strip any internal '_' prefixed fields or known editor-only data
    const keys = Object.keys(block.content);
    for (const key of keys) {
      if (key.startsWith('_')) {
        delete block.content[key];
      }
    }
    
    // In actual implementation, we might also strip `data-builder-id` or similar from raw HTML
  }

  private extractNodeAssets(block: Block) {
    // Example: image tags, video src, etc.
    if (block.type === 'image' && typeof block.content.src === 'string' && block.content.src) {
      this.assets.push({
        type: 'image',
        url: block.content.src,
        blockId: block.id,
        field: 'src',
        priority: 'high' // simplified priority logic
      });
    } else if (block.type === 'video' && typeof block.content.src === 'string' && block.content.src) {
      this.assets.push({
        type: 'video',
        url: block.content.src,
        blockId: block.id,
        field: 'src',
        priority: 'low'
      });
    }
  }

  private generateAnimationCSS(blocks: CompiledBlock[]): string {
    const usedAnimations = new Set<string>();
    const cssParts: string[] = [];

    const traverse = (nodes: CompiledBlock[]) => {
      for (const block of nodes) {
        if (block.animationClasses) {
          for (const cls of block.animationClasses) {
            const match = cls.match(/^animate-(.+?)(?:-vp)?$/);
            if (match) usedAnimations.add(match[1]);
          }
        }
        if (block.children) traverse(block.children);
      }
    };
    traverse(blocks);

    if (usedAnimations.size === 0) return '/* No entrance animations */';

    for (const animName of usedAnimations) {
      const def = ANIMATION_DEFINITIONS[animName];
      if (!def) continue;

      // CSS class with viewport-trigger support
      cssParts.push(
        `.animate-${animName}-vp {\n` +
        `  animation: anim-${animName} var(--anim-duration, ${def.duration}) var(--anim-easing, ${def.easing}) var(--anim-delay, 0ms) var(--anim-iteration-count, 1) var(--anim-direction, normal) var(--anim-fill-mode, both);\n` +
        `  animation-play-state: paused;\n` +
        `}\n` +
        `.animate-${animName}-vp.anim-visible,\n` +
        `.animate-${animName}-vp.animation-trigger-load {\n` +
        `  animation-play-state: running;\n` +
        `}`
      );

      // Include keyframes if not already present from another animation
      if (ANIMATION_KEYFRAMES[animName]) {
        cssParts.push(ANIMATION_KEYFRAMES[animName]);
      }
    }

    return cssParts.join('\n\n');
  }

  private resetStats() {
    this.originalBlockCount = 0;
    this.compiledBlockCount = 0;
    this.strippedCount = 0;
    this.assets = [];
  }

  private reportProgress(stage: PipelineProgress['stage'], message: string, progress: number) {
    if (this.onProgress) {
      this.onProgress({ stage, message, progress });
    }
  }
}
