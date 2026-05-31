import type { Block } from '@/types/builder';
import type { 
  PublishOptions, 
  CompiledBlock, 
  CompiledRuntime, 
  ExtractedAsset,
  PipelineProgress
} from './types';
import { DEFAULT_PUBLISH_OPTIONS } from './types';

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
    const entranceAnim = props.entranceAnimation as string | undefined;
    if (entranceAnim && entranceAnim !== 'none') {
      // Store animation duration/delay as CSS variables on style
      const animStyle: Record<string, string> = {};
      const duration = props.animationDuration;
      if (duration !== undefined && duration !== null) {
        const dur = typeof duration === 'object'
          ? ((duration as any).desktop ?? 600)
          : duration;
        animStyle['--anim-duration'] = `${dur}ms`;
      }
      const delay = props.animationDelay;
      if (delay !== undefined && delay !== null) {
        const del = typeof delay === 'object'
          ? ((delay as any).desktop ?? 0)
          : delay;
        animStyle['--anim-delay'] = `${del}ms`;
      }
      if (props.animationEasing) {
        animStyle['--anim-easing'] = props.animationEasing as string;
      }

      compiled.animationClasses = [`animate-${entranceAnim}-vp`];
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

    const animationDefs: Record<string, { duration: string; easing: string }> = {
      fadeIn: { duration: '600ms', easing: 'ease-out' },
      fadeInUp: { duration: '600ms', easing: 'ease-out' },
      fadeInDown: { duration: '600ms', easing: 'ease-out' },
      fadeInLeft: { duration: '600ms', easing: 'ease-out' },
      fadeInRight: { duration: '600ms', easing: 'ease-out' },
      slideInUp: { duration: '600ms', easing: 'ease-out' },
      slideInDown: { duration: '600ms', easing: 'ease-out' },
      slideInLeft: { duration: '600ms', easing: 'ease-out' },
      slideInRight: { duration: '600ms', easing: 'ease-out' },
      zoomIn: { duration: '600ms', easing: 'ease-out' },
      zoomInUp: { duration: '600ms', easing: 'ease-out' },
      zoomInDown: { duration: '600ms', easing: 'ease-out' },
      bounceIn: { duration: '800ms', easing: 'ease-out' },
      flipInX: { duration: '600ms', easing: 'ease-out' },
      flipInY: { duration: '600ms', easing: 'ease-out' },
    };

    const keyframes: Record<string, string> = {
      'anim-fadeIn': '@keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }',
      'anim-fadeInUp': '@keyframes anim-fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }',
      'anim-fadeInDown': '@keyframes anim-fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }',
      'anim-fadeInLeft': '@keyframes anim-fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }',
      'anim-fadeInRight': '@keyframes anim-fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }',
      'anim-slideInUp': '@keyframes anim-slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }',
      'anim-slideInDown': '@keyframes anim-slideInDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }',
      'anim-slideInLeft': '@keyframes anim-slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }',
      'anim-slideInRight': '@keyframes anim-slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }',
      'anim-zoomIn': '@keyframes anim-zoomIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }',
      'anim-zoomInUp': '@keyframes anim-zoomInUp { from { opacity: 0; transform: scale(0.6) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }',
      'anim-zoomInDown': '@keyframes anim-zoomInDown { from { opacity: 0; transform: scale(0.6) translateY(-30px); } to { opacity: 1; transform: scale(1) translateY(0); } }',
      'anim-bounceIn': '@keyframes anim-bounceIn { from { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }',
      'anim-flipInX': '@keyframes anim-flipInX { from { opacity: 0; transform: perspective(400px) rotateX(90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0); } }',
      'anim-flipInY': '@keyframes anim-flipInY { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0); } }',
    };

    for (const animName of usedAnimations) {
      const def = animationDefs[animName];
      if (!def) continue;

      // CSS class with viewport-trigger support
      cssParts.push(
        `.animate-${animName}-vp {\n` +
        `  animation: anim-${animName} var(--anim-duration, ${def.duration}) var(--anim-easing, ${def.easing}) var(--anim-delay, 0ms) both;\n` +
        `  animation-play-state: paused;\n` +
        `}\n` +
        `.animate-${animName}-vp.anim-visible {\n` +
        `  animation-play-state: running;\n` +
        `}`
      );

      // Include keyframes if not already present from another animation
      const kfKey = `anim-${animName}`;
      if (keyframes[kfKey]) {
        cssParts.push(keyframes[kfKey]);
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
