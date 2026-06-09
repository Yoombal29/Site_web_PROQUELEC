import type { Block } from '@/types/builder';
import type { ComputedNode, LayoutEngineConfig } from '@/engine/layout/types';
import { computeFullLayout } from '@/engine/layout/engine';

export interface LayoutLoadResult {
  nodes: ComputedNode[];
  errors: string[];
}

export function computePageLayout(
  blocks: Block[],
  options: { containerWidth?: number; containerHeight?: number } = {},
): LayoutLoadResult {
  const result: LayoutLoadResult = { nodes: [], errors: [] };

  try {
    const config: LayoutEngineConfig = {
      containerWidth: options.containerWidth ?? 1280,
      containerHeight: options.containerHeight ?? 800,
      breakpoint: 'desktop',
    };
    result.nodes = computeFullLayout(blocks, config);
  } catch (err) {
    result.errors.push(
      `Layout computation failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return result;
}
