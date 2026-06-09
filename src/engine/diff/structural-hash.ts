import type { Block } from '@/types/builder';
import type { StructuralHash } from './types';

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return `s:${value}`;
  if (typeof value === 'number') return `n:${value}`;
  if (typeof value === 'boolean') return `b:${value}`;
  if (Array.isArray(value)) {
    return `a:[${value.map(stableStringify).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const parts = keys.map(k => `${k}:${stableStringify((value as Record<string, unknown>)[k])}`);
    return `o:{${parts.join(',')}}`;
  }
  return String(value);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
}

function hashBlock(block: Block): string {
  const parts: string[] = [block.type];

  if (block.style) {
    parts.push(stableStringify(block.style));
  }

  if (block.content) {
    const contentForHash = { ...block.content };
    delete (contentForHash as Record<string, unknown>).animation;
    parts.push(stableStringify(contentForHash));
  }

  if (block.enabled !== undefined) {
    parts.push(`enabled:${block.enabled}`);
  }

  if (block.isGlobal) {
    parts.push('global:1');
  }

  return hashString(parts.join('|'));
}

export function hashSubtree(block: Block): StructuralHash {
  const children = (block.children || []).map(hashSubtree);
  return {
    id: block.id,
    hash: hashBlock(block),
    children,
  };
}

export function hashTree(blocks: Block[]): StructuralHash[] {
  return blocks.map(hashSubtree);
}

export function compareHashes(a: StructuralHash[], b: StructuralHash[]): {
  changed: string[];
  added: string[];
  removed: string[];
} {
  const aMap = new Map(a.map(h => [h.id, h]));
  const bMap = new Map(b.map(h => [h.id, h]));

  const changed: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  for (const [id, hashB] of bMap) {
    const hashA = aMap.get(id);
    if (!hashA) {
      added.push(id);
      continue;
    }
    if (hashA.hash !== hashB.hash) {
      changed.push(id);
    }
    const childResult = compareHashes(hashA.children, hashB.children);
    changed.push(...childResult.changed);
    added.push(...childResult.added);
    removed.push(...childResult.removed);
  }

  for (const [id] of aMap) {
    if (!bMap.has(id)) {
      removed.push(id);
    }
  }

  return {
    changed: [...new Set(changed)],
    added: [...new Set(added)],
    removed: [...new Set(removed)],
  };
}
