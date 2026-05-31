import type { Block } from '@/types/builder';
import type { ValidationReport } from '@/engine/validation/types';
import { hashTree } from '@/engine/diff/structural-hash';
import { RuntimeCompiler } from './compiler';
import type { PublishOptions, PublishResult, PublishSnapshot, PipelineProgress } from './types';

// Placeholder for actual validation engine until we hook it up
interface IValidationEngine {
  validate(blocks: Block[], mode: string): ValidationReport;
}

export class PublishPipeline {
  private compiler: RuntimeCompiler;
  private validator?: IValidationEngine;
  private onProgress?: (progress: PipelineProgress) => void;

  constructor(
    options?: PublishOptions,
    validator?: IValidationEngine,
    onProgress?: (progress: PipelineProgress) => void
  ) {
    this.compiler = new RuntimeCompiler(options, onProgress);
    this.validator = validator;
    this.onProgress = onProgress;
  }

  /**
   * Run the full publish pipeline on a draft tree.
   */
  public async publish(
    pageId: string | number,
    draftBlocks: Block[],
    userId = 'system',
    previousSnapshot?: PublishSnapshot
  ): Promise<PublishResult> {
    const startTime = performance.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    this.reportProgress('validating', 'Validating draft...', 5);

    // 1. Validate
    let validation: ValidationReport = { valid: true, errors: [], warnings: [], infos: [] };
    if (this.validator) {
      validation = this.validator.validate(draftBlocks, 'publish');
      if (!validation.valid) {
        this.reportProgress('error', 'Validation failed', 100);
        return {
          status: 'validation_failed',
          validation,
          errors: validation.errors.map(e => e.message),
          warnings: validation.warnings.map(w => w.message),
          durationMs: performance.now() - startTime,
        };
      }
    }

    // 2. Incremental checks (if previous snapshot exists)
    let changedBlockIds: string[] | undefined = undefined;
    const currentHash = JSON.stringify(hashTree(draftBlocks)); // In reality, we'd use the full tree hash

    if (previousSnapshot && previousSnapshot.draftHash === currentHash) {
      // No changes detected
      warnings.push('No structural changes detected since last publish');
    }

    try {
      // 3. Compile
      const compiled = await this.compiler.compile(draftBlocks);

      // 4. Create snapshot
      const snapshot: PublishSnapshot = {
        id: crypto.randomUUID(),
        pageId,
        compiled,
        validation,
        publishedAt: Date.now(),
        publishedBy: userId,
        draftHash: currentHash,
        changedBlockIds,
      };

      this.reportProgress('done', 'Publish successful', 100);

      return {
        status: 'success',
        snapshot,
        validation,
        errors,
        warnings,
        durationMs: performance.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
      this.reportProgress('error', `Compilation failed: ${errorMessage}`, 100);
      
      return {
        status: 'compile_error',
        validation,
        errors: [errorMessage],
        warnings,
        durationMs: performance.now() - startTime,
      };
    }
  }

  private reportProgress(stage: PipelineProgress['stage'], message: string, progress: number) {
    if (this.onProgress) {
      this.onProgress({ stage, message, progress });
    }
  }
}
