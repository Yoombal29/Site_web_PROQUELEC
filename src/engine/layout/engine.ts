import type { Block, BlockStyle } from '@/types/builder';
import type { LayoutNode, AutoLayout, Constraints, PositionType, SizeConstraint, ComputedNode, LayoutEngineConfig, Breakpoint } from './types';
import { computeAutoLayout } from './auto-layout';
import { resolveResponsiveStyle } from './responsive';

function parseCssLength(value: string | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  if (value.endsWith('vw')) return (num / 100) * 1920;
  if (value.endsWith('vh')) return (num / 100) * 1080;
  if (value.endsWith('%')) return 0; // Can't compute without parent
  return num;
}

function extractLayoutNode(style: BlockStyle | undefined): LayoutNode {
  if (!style) {
    return { position: 'relative', constraints: {} };
  }

  const constraints: Constraints = {};
  if (style.marginTop) constraints.top = style.marginTop;
  if (style.marginRight) constraints.right = style.marginRight;
  if (style.marginBottom) constraints.bottom = style.marginBottom;
  if (style.marginLeft) constraints.left = style.marginLeft;

  const width: SizeConstraint | undefined = style.width ? {
    value: style.width,
    min: undefined,
    max: style.maxWidth || undefined,
  } : undefined;

  const height: SizeConstraint | undefined = style.height || style.minHeight ? {
    value: style.height || 'auto',
    min: style.minHeight || undefined,
    max: undefined,
  } : undefined;

  let position: PositionType = 'relative';
  if (style.position === 'absolute' || style.position === 'fixed' || style.position === 'sticky') {
    position = style.position as PositionType;
  }

  let autoLayout: AutoLayout | undefined;
  if (style.display === 'flex') {
    autoLayout = {
      direction: style.flexDirection === 'column' ? 'vertical' : 'horizontal',
      padding: {
        top: style.paddingTop || style.padding || '0',
        right: style.paddingRight || style.padding || '0',
        bottom: style.paddingBottom || style.padding || '0',
        left: style.paddingLeft || style.padding || '0',
      },
      gap: style.gap || '0',
      horizontalAlign: (style.justifyContent as AutoLayout['horizontalAlign']) || 'start',
      verticalAlign: (style.alignItems as AutoLayout['verticalAlign']) || 'start',
      wrap: style.flexWrap === 'wrap' || false,
    };
  }

  return {
    width,
    height,
    position,
    constraints,
    autoLayout,
    zIndex: style.zIndex ? parseInt(String(style.zIndex)) : undefined,
    overflow: style.overflow as LayoutNode['overflow'],
    aspectRatio: style.aspectRatio,
  };
}

export function computeNodeLayout(
  block: Block,
  config: LayoutEngineConfig,
): ComputedNode {
  const style = resolveResponsiveStyle(block.style || {}, config.breakpoint);
  const layout = extractLayoutNode(style);

  let width = parseCssLength(style.width) || config.containerWidth;
  let height = parseCssLength(style.height) || parseCssLength(style.minHeight) || 200;

  if (layout.width?.max) {
    const maxW = parseCssLength(layout.width.max);
    if (width > maxW) width = maxW;
  }
  if (layout.width?.min) {
    const minW = parseCssLength(layout.width.min);
    if (width < minW) width = minW;
  }

  let children: ComputedNode[] = [];
  if (block.children && block.children.length > 0) {
    children = block.children.map((child, _index) => {
      return computeNodeLayout(child, {
        ...config,
        containerWidth: layout.autoLayout ? width : config.containerWidth,
        containerHeight: height,
      });
    });
  }

  if (layout.autoLayout && children.length > 0) {
    const result = computeAutoLayout({
      children,
      autoLayout: layout.autoLayout,
      containerWidth: width,
      containerHeight: height,
    });
    width = result.width;
    height = result.height;
    children = result.children;
  }

  let x = 0;
  let y = 0;
  if (layout.position === 'absolute' || layout.position === 'fixed' || layout.position === 'sticky') {
    if (layout.constraints.left) x = parseCssLength(layout.constraints.left);
    else if (layout.constraints.right) x = config.containerWidth - width - parseCssLength(layout.constraints.right);
    if (layout.constraints.top) y = parseCssLength(layout.constraints.top);
    else if (layout.constraints.bottom) y = config.containerHeight - height - parseCssLength(layout.constraints.bottom);
  }

  return {
    id: block.id,
    type: block.type,
    x,
    y,
    width: Math.round(width),
    height: Math.round(height),
    children,
    zIndex: layout.zIndex || 0,
    overflow: layout.overflow || 'visible',
  };
}

export function computeFullLayout(
  blocks: Block[],
  config: LayoutEngineConfig,
): ComputedNode[] {
  return blocks.map((block, _index) => computeNodeLayout(block, config));
}

export function generateFlexCSS(node: LayoutNode): Record<string, string> {
  if (!node.autoLayout) return {};
  return {
    display: 'flex',
    flexDirection: node.autoLayout.direction === 'horizontal' ? 'row' : 'column',
    flexWrap: node.autoLayout.wrap ? 'wrap' : 'nowrap',
    gap: node.autoLayout.gap,
    padding: `${node.autoLayout.padding.top} ${node.autoLayout.padding.right} ${node.autoLayout.padding.bottom} ${node.autoLayout.padding.left}`,
    justifyContent: node.autoLayout.horizontalAlign === 'start' ? 'flex-start'
      : node.autoLayout.horizontalAlign === 'end' ? 'flex-end'
      : node.autoLayout.horizontalAlign === 'space-between' ? 'space-between'
      : node.autoLayout.horizontalAlign === 'space-around' ? 'space-around'
      : node.autoLayout.horizontalAlign === 'space-evenly' ? 'space-evenly'
      : node.autoLayout.horizontalAlign,
    alignItems: node.autoLayout.verticalAlign === 'start' ? 'flex-start'
      : node.autoLayout.verticalAlign === 'end' ? 'flex-end'
      : node.autoLayout.verticalAlign,
  };
}
