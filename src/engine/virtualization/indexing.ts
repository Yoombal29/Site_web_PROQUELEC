import type { ViewportRect, SpatialIndex } from './types';

const MAX_ITEMS = 16;
const MAX_DEPTH = 12;

interface QuadTreeNode {
  bounds: ViewportRect;
  items: Map<string, ViewportRect>;
  children: QuadTreeNode[] | null;
  depth: number;
}

function rectsOverlap(a: ViewportRect, b: ViewportRect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function rectContains(outer: ViewportRect, inner: ViewportRect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/**
 * Find which child fully contains the given rect.
 * Returns the child index (0-3) if exactly one child contains it,
 * or -1 if the rect straddles a boundary (fits in 0 or 2+ children).
 */
function findContainingChild(children: QuadTreeNode[], bounds: ViewportRect): number {
  let match = -1;
  for (let i = 0; i < children.length; i++) {
    if (rectContains(children[i].bounds, bounds)) {
      if (match !== -1) return -1; // overlaps multiple → keep in parent
      match = i;
    }
  }
  return match;
}

function splitNode(parent: QuadTreeNode): void {
  const { x, y, width, height } = parent.bounds;
  const halfW = width / 2;
  const halfH = height / 2;
  const childDepth = parent.depth + 1;

  parent.children = [
    { bounds: { x, y, width: halfW, height: halfH }, items: new Map(), children: null, depth: childDepth },
    { bounds: { x: x + halfW, y, width: halfW, height: halfH }, items: new Map(), children: null, depth: childDepth },
    { bounds: { x, y: y + halfH, width: halfW, height: halfH }, items: new Map(), children: null, depth: childDepth },
    { bounds: { x: x + halfW, y: y + halfH, width: halfW, height: halfH }, items: new Map(), children: null, depth: childDepth },
  ];

  // Only push items down to children that fully contain them.
  // Items straddling a boundary stay in the parent.
  const straddling = new Map<string, ViewportRect>();
  for (const [id, rect] of parent.items) {
    const childIdx = findContainingChild(parent.children, rect);
    if (childIdx >= 0) {
      parent.children[childIdx].items.set(id, rect);
    } else {
      straddling.set(id, rect);
    }
  }
  parent.items.clear();

  // Keep straddling items in the parent
  if (straddling.size > 0) {
    parent.items = straddling;
  }

  // Recursively split children that now exceed capacity
  for (const child of parent.children) {
    if (child.items.size > MAX_ITEMS && child.depth < MAX_DEPTH) {
      splitNode(child);
    }
  }
}

function insertInto(node: QuadTreeNode, id: string, bounds: ViewportRect): void {
  if (node.children) {
    // Try to push to a child that fully contains the bounds
    const childIdx = findContainingChild(node.children, bounds);
    if (childIdx >= 0) {
      insertInto(node.children[childIdx], id, bounds);
      return;
    }
    // Straddles boundary → keep in this node
    node.items.set(id, bounds);
    return;
  }

  node.items.set(id, bounds);

  if (node.items.size > MAX_ITEMS && node.depth < MAX_DEPTH) {
    splitNode(node);
  }
}

function removeFrom(node: QuadTreeNode, id: string): boolean {
  if (node.items.delete(id)) return true;
  if (node.children) {
    for (const child of node.children) {
      if (removeFrom(child, id)) return true;
    }
  }
  return false;
}

function queryNode(node: QuadTreeNode, rect: ViewportRect, results: Set<string>): void {
  if (!rectsOverlap(node.bounds, rect)) return;

  // Check items stored in this node (boundary-straddling or parent items)
  for (const [id, itemBounds] of node.items) {
    if (rectsOverlap(itemBounds, rect)) {
      results.add(id);
    }
  }

  if (node.children) {
    for (const child of node.children) {
      queryNode(child, rect, results);
    }
  }
}

function updateIn(node: QuadTreeNode, id: string, bounds: ViewportRect): void {
  removeFrom(node, id);
  insertInto(node, id, bounds);
}

function countItems(node: QuadTreeNode): number {
  let count = node.items.size;
  if (node.children) {
    for (const child of node.children) {
      count += countItems(child);
    }
  }
  return count;
}

function clearNode(node: QuadTreeNode): void {
  node.items.clear();
  if (node.children) {
    for (const child of node.children) {
      clearNode(child);
    }
    node.children = null;
  }
}

/** Quadtree-based spatial index for efficient viewport intersection queries */
export class QuadTreeSpatialIndex implements SpatialIndex {
  private root: QuadTreeNode;

  constructor(bounds?: ViewportRect) {
    this.root = {
      bounds: bounds ?? {
        x: -100000,
        y: -100000,
        width: 200000,
        height: 200000,
      },
      items: new Map(),
      children: null,
      depth: 0,
    };
  }

  insert(id: string, bounds: ViewportRect): void {
    insertInto(this.root, id, bounds);
  }

  remove(id: string): void {
    removeFrom(this.root, id);
  }

  update(id: string, bounds: ViewportRect): void {
    updateIn(this.root, id, bounds);
  }

  query(rect: ViewportRect): string[] {
    const results = new Set<string>();
    queryNode(this.root, rect, results);
    return Array.from(results);
  }

  clear(): void {
    clearNode(this.root);
  }

  get size(): number {
    return countItems(this.root);
  }
}

/** Simple grid-based spatial hash for smaller datasets */
export class GridSpatialIndex implements SpatialIndex {
  private grid = new Map<string, Map<string, ViewportRect>>();
  private cellSize: number;
  private _size = 0;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }

  private getCells(bounds: ViewportRect): string[] {
    const cells = new Set<string>();
    const minCol = Math.floor(bounds.x / this.cellSize);
    const maxCol = Math.floor((bounds.x + bounds.width) / this.cellSize);
    const minRow = Math.floor(bounds.y / this.cellSize);
    const maxRow = Math.floor((bounds.y + bounds.height) / this.cellSize);

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        cells.add(`${col}:${row}`);
      }
    }
    return Array.from(cells);
  }

  insert(id: string, bounds: ViewportRect): void {
    for (const key of this.getCells(bounds)) {
      if (!this.grid.has(key)) {
        this.grid.set(key, new Map());
      }
      this.grid.get(key)!.set(id, bounds);
    }
    this._size++;
  }

  remove(id: string): void {
    for (const cell of this.grid.values()) {
      if (cell.delete(id)) {
        this._size--;
      }
    }
  }

  update(id: string, bounds: ViewportRect): void {
    this.remove(id);
    this.insert(id, bounds);
  }

  query(rect: ViewportRect): string[] {
    const results = new Set<string>();
    for (const key of this.getCells(rect)) {
      const cell = this.grid.get(key);
      if (!cell) continue;
      for (const [id, bounds] of cell) {
        if (rectsOverlap(rect, bounds)) {
          results.add(id);
        }
      }
    }
    return Array.from(results);
  }

  clear(): void {
    this.grid.clear();
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }
}

export function createSpatialIndex(type: 'quadtree' | 'grid', bounds?: ViewportRect, cellSize?: number): SpatialIndex {
  if (type === 'quadtree') return new QuadTreeSpatialIndex(bounds);
  return new GridSpatialIndex(cellSize);
}
