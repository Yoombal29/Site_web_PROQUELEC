export type AxisDirection = 'horizontal' | 'vertical';
export type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';

export interface AutoLayout {
  direction: AxisDirection;
  padding: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  gap: string;
  horizontalAlign: Alignment;
  verticalAlign: Alignment;
  wrap: boolean;
}

export type PositionType = 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface Constraints {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface SizeConstraint {
  value: string;
  min?: string;
  max?: string;
}

export interface LayoutNode {
  width?: SizeConstraint;
  height?: SizeConstraint;
  position: PositionType;
  constraints: Constraints;
  autoLayout?: AutoLayout;
  zIndex?: number;
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
  aspectRatio?: string;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type BreakpointWidth = 375 | 768 | 1280;

export const BREAKPOINTS: Record<Breakpoint, BreakpointWidth> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

export interface ComputedNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: ComputedNode[];
  zIndex: number;
  overflow: string;
}

export interface LayoutEngineConfig {
  containerWidth: number;
  containerHeight: number;
  breakpoint: Breakpoint;
}
