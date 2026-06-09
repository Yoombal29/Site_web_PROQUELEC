import type { AutoLayout, Alignment, AxisDirection, ComputedNode, LayoutNode } from './types';

function resolvePadding(autoLayout: AutoLayout): { top: number; right: number; bottom: number; left: number } {
  const toPx = (v: string): number => {
    if (v.endsWith('px')) return parseFloat(v);
    if (v.endsWith('rem')) return parseFloat(v) * 16;
    if (v.endsWith('em')) return parseFloat(v) * 16;
    return parseFloat(v) || 0;
  };
  return {
    top: toPx(autoLayout.padding.top),
    right: toPx(autoLayout.padding.right),
    bottom: toPx(autoLayout.padding.bottom),
    left: toPx(autoLayout.padding.left),
  };
}

function resolveGap(gap: string): number {
  if (gap.endsWith('px')) return parseFloat(gap);
  if (gap.endsWith('rem')) return parseFloat(gap) * 16;
  return parseFloat(gap) || 0;
}

export interface AutoLayoutInput {
  children: ComputedNode[];
  autoLayout: AutoLayout;
  containerWidth: number;
  containerHeight: number;
}

export function computeAutoLayout(input: AutoLayoutInput): { width: number; height: number; children: ComputedNode[] } {
  const { children, autoLayout, containerWidth, containerHeight } = input;
  const pad = resolvePadding(autoLayout);
  const gap = resolveGap(autoLayout.gap);
  const direction: AxisDirection = autoLayout.direction;
  const hAlign: Alignment = autoLayout.horizontalAlign;
  const vAlign: Alignment = autoLayout.verticalAlign;
  const wrap = autoLayout.wrap;

  const innerWidth = containerWidth - pad.left - pad.right;
  const innerHeight = containerHeight - pad.top - pad.bottom;

  const positioned = [...children];
  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;
  let totalWidth = 0;
  let totalHeight = 0;

  const rows: ComputedNode[][] = [];

  if (direction === 'horizontal') {
    if (wrap) {
      // Wrapping horizontal layout (like flex-wrap)
      for (const child of positioned) {
        if (cursorX + child.width > innerWidth && cursorX > 0) {
          cursorX = 0;
          cursorY += rowHeight + gap;
          rowHeight = 0;
        }
        child.x = pad.left + cursorX;
        child.y = pad.top + cursorY;
        child.x += 0; // Will apply alignment later
        cursorX += child.width + gap;
        rowHeight = Math.max(rowHeight, child.height);
        totalWidth = Math.max(totalWidth, cursorX - gap);
        totalHeight = cursorY + rowHeight;
      }
    } else {
      // Non-wrapping horizontal
      totalWidth = positioned.reduce((sum, c) => sum + c.width + gap, 0) - gap;
      totalHeight = Math.max(...positioned.map(c => c.height), 0);
      let startX = pad.left;
      if (hAlign === 'center') startX = pad.left + (innerWidth - totalWidth) / 2;
      if (hAlign === 'end') startX = pad.left + (innerWidth - totalWidth);
      if (hAlign === 'space-between') {
        const spacing = positioned.length > 1 ? (innerWidth - totalWidth) / (positioned.length - 1) : 0;
        positioned.forEach((c, i) => { c.x = startX + i * (c.width + gap + spacing); c.y = pad.top; });
        return { width: containerWidth, height: Math.max(totalHeight + pad.top + pad.bottom, containerHeight), children: positioned };
      }
      if (hAlign === 'space-around') {
        const spacing = positioned.length > 0 ? (innerWidth - totalWidth) / positioned.length : 0;
        positioned.forEach((c, i) => { c.x = startX + spacing / 2 + i * (c.width + gap + spacing); c.y = pad.top; });
        return { width: containerWidth, height: Math.max(totalHeight + pad.top + pad.bottom, containerHeight), children: positioned };
      }
      if (hAlign === 'space-evenly') {
        const spacing = positioned.length > 0 ? (innerWidth - totalWidth) / (positioned.length + 1) : 0;
        positioned.forEach((c, i) => { c.x = startX + spacing + i * (c.width + gap + spacing); c.y = pad.top; });
        return { width: containerWidth, height: Math.max(totalHeight + pad.top + pad.bottom, containerHeight), children: positioned };
      }
      positioned.forEach((c, i) => {
        c.x = startX;
        c.y = pad.top;
        startX += c.width + gap;
      });
    }
  } else {
    // Vertical direction
    let startY = pad.top;
    if (vAlign === 'center') startY = pad.top + (innerHeight - totalHeight) / 2;
    if (vAlign === 'end') startY = pad.top + (innerHeight - totalHeight);
    for (const child of positioned) {
      child.x = pad.left;
      child.y = startY;
      child.width = child.width || innerWidth;
      startY += child.height + gap;
      totalWidth = Math.max(totalWidth, child.width);
    }
    totalHeight = startY - gap - pad.top;
  }

  // Apply cross-axis alignment
  if (direction === 'horizontal') {
    for (const child of positioned) {
      if (vAlign === 'center') child.y = pad.top + (innerHeight - child.height) / 2;
      else if (vAlign === 'end') child.y = pad.top + innerHeight - child.height;
      else if (vAlign === 'stretch') child.height = innerHeight;
    }
  } else {
    for (const child of positioned) {
      if (hAlign === 'center') child.x = pad.left + (innerWidth - child.width) / 2;
      else if (hAlign === 'end') child.x = pad.left + innerWidth - child.width;
      else if (hAlign === 'stretch') child.width = innerWidth;
    }
  }

  return {
    width: Math.max(totalWidth + pad.left + pad.right, containerWidth),
    height: Math.max(totalHeight + pad.top + pad.bottom, containerHeight),
    children: positioned,
  };
}

export function autoLayoutStyle(autoLayout: AutoLayout): Record<string, string> {
  const styles: Record<string, string> = {};
  styles.display = 'flex';
  styles.flexDirection = autoLayout.direction === 'horizontal' ? 'row' : 'column';
  styles.padding = `${autoLayout.padding.top} ${autoLayout.padding.right} ${autoLayout.padding.bottom} ${autoLayout.padding.left}`;
  styles.gap = autoLayout.gap;
  styles.flexWrap = autoLayout.wrap ? 'wrap' : 'nowrap';

  const mainMap: Record<Alignment, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly',
  };
  if (autoLayout.direction === 'horizontal') {
    styles.justifyContent = mainMap[autoLayout.horizontalAlign] || 'flex-start';
    styles.alignItems = mainMap[autoLayout.verticalAlign] || 'stretch';
  } else {
    styles.justifyContent = mainMap[autoLayout.verticalAlign] || 'flex-start';
    styles.alignItems = mainMap[autoLayout.horizontalAlign] || 'stretch';
  }

  return styles;
}
