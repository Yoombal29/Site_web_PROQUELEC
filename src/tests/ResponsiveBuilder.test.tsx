/**
 * 🧪 ResponsiveBuilder — Tests du Système Responsive du Builder PROQUELEC
 *
 * Valide :
 * 1. getUniversalStyles() — génération de variables CSS responsive
 * 2. getUniversalStyles() — classes de visibilité, bordures, effets, animations
 * 3. BuilderCanvas — largeurs responsive desktop/tablet/mobile
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getUniversalStyles } from '@/components/blocks/universalStyles';

// =============================================================================
// Mock BuilderCanvas dependencies
// =============================================================================

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() }),
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null }),
  DndContext: ({ children }: { children: React.ReactNode }) => children,
  DragOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: '',
    isDragging: false,
  }),
  arrayMove: <T,>(arr: T[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
}));

vi.mock('lucide-react', () => ({
  MousePointer2: ({ className }: { className?: string }) => (
    <svg data-testid="mock-mouse-pointer" className={className} />
  ),
}));

vi.mock('@/stores/useBuilderStore', () => ({
  useBuilderStore: () => ({
    selectedBlockId: null,
    selectBlock: vi.fn(),
  }),
}));

// Mock BuilderPageRenderer to avoid deep rendering of complex block components
vi.mock('@/components/builder/BuilderPageRenderer', () => ({
  default: ({ blocks }: { blocks?: unknown[] }) => (
    <div data-testid="builder-page-renderer">{blocks?.length ?? 0} block(s)</div>
  ),
}));

// Import after mocks are set up
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';

// =============================================================================
// Tests — getUniversalStyles — Responsive System
// =============================================================================

describe('getUniversalStyles — Basic', () => {
  it('returns style and className objects', () => {
    const result = getUniversalStyles({});
    expect(result).toHaveProperty('style');
    expect(result).toHaveProperty('className');
    expect(typeof result.style).toBe('object');
    expect(typeof result.className).toBe('string');
  });

  it('returns empty className when no animation, effects, or visibility classes', () => {
    const result = getUniversalStyles({});
    expect(result.className).toBe('');
  });

  it('handles simple (non-responsive) numeric value as single breakpoint', () => {
    const result = getUniversalStyles({ marginTop: 20 });
    expect(result.style['--desktop-margin-top']).toBe('20px');
    expect(result.style['--tablet-margin-top']).toBe('20px');
    expect(result.style['--mobile-margin-top']).toBe('20px');
  });

  it('returns empty style for empty props', () => {
    const result = getUniversalStyles({});
    expect(Object.keys(result.style)).toHaveLength(0);
  });

  it('handles multiple simple values simultaneously', () => {
    const result = getUniversalStyles({
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: 18,
    });
    expect(result.style['--desktop-padding-left']).toBe('16px');
    expect(result.style['--desktop-padding-right']).toBe('16px');
    expect(result.style['--desktop-font-size']).toBe('18px');
    // All three breakpoints set for each
    expect(result.style['--tablet-padding-left']).toBe('16px');
    expect(result.style['--mobile-padding-left']).toBe('16px');
  });

  it('ignores undefined and null values', () => {
    const result = getUniversalStyles({
      marginTop: undefined,
      marginBottom: null as unknown as number | undefined,
      paddingTop: 10,
    });
    expect(result.style['--desktop-margin-top']).toBeUndefined();
    expect(result.style['--desktop-margin-bottom']).toBeUndefined();
    expect(result.style['--desktop-padding-top']).toBe('10px');
  });
});

describe('getUniversalStyles — Responsive Values', () => {
  it('generates correct CSS vars for responsive object with all three breakpoints', () => {
    const result = getUniversalStyles({
      paddingTop: { desktop: 40, tablet: 24, mobile: 12 },
    });
    expect(result.style['--desktop-padding-top']).toBe('40px');
    expect(result.style['--tablet-padding-top']).toBe('24px');
    expect(result.style['--mobile-padding-top']).toBe('12px');
  });

  it('generates only provided breakpoints from responsive object', () => {
    const result = getUniversalStyles({
      marginBottom: { desktop: 60, mobile: 20 },
    });
    expect(result.style['--desktop-margin-bottom']).toBe('60px');
    expect(result.style['--mobile-margin-bottom']).toBe('20px');
    // Tablet should not be set
    expect(result.style['--tablet-margin-bottom']).toBeUndefined();
  });

  it('falls back correctly — only desktop value provided', () => {
    const result = getUniversalStyles({
      paddingLeft: { desktop: 32 },
    });
    expect(result.style['--desktop-padding-left']).toBe('32px');
    expect(result.style['--tablet-padding-left']).toBeUndefined();
    expect(result.style['--mobile-padding-left']).toBeUndefined();
  });

  it('handles responsive gap value', () => {
    const result = getUniversalStyles({
      gap: { desktop: 24, tablet: 16, mobile: 8 },
    });
    expect(result.style['--desktop-gap']).toBe('24px');
    expect(result.style['--tablet-gap']).toBe('16px');
    expect(result.style['--mobile-gap']).toBe('8px');
  });

  it('handles responsive padding (all sides)', () => {
    const result = getUniversalStyles({
      paddingTop: { desktop: 40, tablet: 30, mobile: 20 },
      paddingBottom: { desktop: 40, tablet: 30, mobile: 20 },
      paddingLeft: { desktop: 32, tablet: 24, mobile: 16 },
      paddingRight: { desktop: 32, tablet: 24, mobile: 16 },
    });
    expect(result.style['--desktop-padding-top']).toBe('40px');
    expect(result.style['--desktop-padding-bottom']).toBe('40px');
    expect(result.style['--desktop-padding-left']).toBe('32px');
    expect(result.style['--desktop-padding-right']).toBe('32px');
    expect(result.style['--tablet-padding-top']).toBe('30px');
    expect(result.style['--mobile-padding-top']).toBe('20px');
  });

  it('handles responsive margin (all sides)', () => {
    const result = getUniversalStyles({
      marginTop: { desktop: 20, tablet: 16, mobile: 8 },
      marginBottom: { desktop: 20, tablet: 16, mobile: 8 },
      marginLeft: { desktop: 0, tablet: 0, mobile: 0 },
      marginRight: { desktop: 0, tablet: 0, mobile: 0 },
    });
    expect(result.style['--desktop-margin-top']).toBe('20px');
    expect(result.style['--tablet-margin-top']).toBe('16px');
    expect(result.style['--mobile-margin-top']).toBe('8px');
    expect(result.style['--desktop-margin-left']).toBe('0px');
  });

  it('handles responsive fontFamily, fontWeight, lineHeight', () => {
    const result = getUniversalStyles({
      fontFamily: { desktop: 'Roboto', tablet: 'Roboto', mobile: 'Arial' },
      fontWeight: { desktop: '700', tablet: '600', mobile: '400' },
      lineHeight: { desktop: 1.8, tablet: 1.6, mobile: 1.4 },
    });
    expect(result.style['--desktop-font-family']).toBe('Roboto');
    expect(result.style['--tablet-font-family']).toBe('Roboto');
    expect(result.style['--mobile-font-family']).toBe('Arial');
    expect(result.style['--desktop-font-weight']).toBe('700');
    expect(result.style['--tablet-font-weight']).toBe('600');
    expect(result.style['--mobile-font-weight']).toBe('400');
    expect(result.style['--desktop-line-height']).toBe('1.8');
    expect(result.style['--tablet-line-height']).toBe('1.6');
    expect(result.style['--mobile-line-height']).toBe('1.4');
  });

  it('handles responsive display, flexDirection, justifyContent', () => {
    const result = getUniversalStyles({
      display: { desktop: 'flex', tablet: 'flex', mobile: 'block' },
      flexDirection: { desktop: 'row', tablet: 'row', mobile: 'column' },
      justifyContent: { desktop: 'space-between', tablet: 'center', mobile: 'center' },
    });
    expect(result.style['--desktop-display']).toBe('flex');
    expect(result.style['--mobile-display']).toBe('block');
    expect(result.style['--desktop-flex-direction']).toBe('row');
    expect(result.style['--mobile-flex-direction']).toBe('column');
    expect(result.style['--desktop-justify-content']).toBe('space-between');
    expect(result.style['--tablet-justify-content']).toBe('center');
  });

  it('handles responsive textAlign with no unit suffix', () => {
    const result = getUniversalStyles({
      textAlign: { desktop: 'left', tablet: 'center', mobile: 'right' },
    });
    expect(result.style['--desktop-text-align']).toBe('left');
    expect(result.style['--tablet-text-align']).toBe('center');
    expect(result.style['--mobile-text-align']).toBe('right');
  });

  it('handles responsive flexWrap, alignItems, alignSelf', () => {
    const result = getUniversalStyles({
      flexWrap: { desktop: 'nowrap', mobile: 'wrap' },
      alignItems: { desktop: 'center', tablet: 'flex-start' },
      alignSelf: { desktop: 'auto', mobile: 'stretch' },
    });
    expect(result.style['--desktop-flex-wrap']).toBe('nowrap');
    expect(result.style['--mobile-flex-wrap']).toBe('wrap');
    expect(result.style['--desktop-align-items']).toBe('center');
    expect(result.style['--tablet-align-items']).toBe('flex-start');
    expect(result.style['--desktop-align-self']).toBe('auto');
    expect(result.style['--mobile-align-self']).toBe('stretch');
  });

  it('handles responsive grid properties', () => {
    const result = getUniversalStyles({
      gridTemplateColumns: { desktop: '1fr 1fr 1fr', tablet: '1fr 1fr', mobile: '1fr' },
      gridTemplateRows: { desktop: 'auto', mobile: 'auto' },
      placeItems: { desktop: 'center', mobile: 'stretch' },
    });
    expect(result.style['--desktop-grid-template-columns']).toBe('1fr 1fr 1fr');
    expect(result.style['--tablet-grid-template-columns']).toBe('1fr 1fr');
    expect(result.style['--mobile-grid-template-columns']).toBe('1fr');
    expect(result.style['--desktop-grid-template-rows']).toBe('auto');
    expect(result.style['--mobile-place-items']).toBe('stretch');
  });
});

describe('getUniversalStyles — Visibility Classes', () => {
  it('adds hide-desktop class when hideDesktop is true', () => {
    const result = getUniversalStyles({ hideDesktop: true });
    expect(result.className).toContain('hide-desktop');
  });

  it('adds hide-tablet class when hideTablet is true', () => {
    const result = getUniversalStyles({ hideTablet: true });
    expect(result.className).toContain('hide-tablet');
  });

  it('adds hide-mobile class when hideMobile is true', () => {
    const result = getUniversalStyles({ hideMobile: true });
    expect(result.className).toContain('hide-mobile');
  });

  it('adds reverse-mobile class when reverseMobile is true', () => {
    const result = getUniversalStyles({ reverseMobile: true });
    expect(result.className).toContain('reverse-mobile');
  });

  it('combines multiple visibility classes', () => {
    const result = getUniversalStyles({
      hideDesktop: true,
      hideMobile: true,
      reverseMobile: true,
    });
    expect(result.className).toContain('hide-desktop');
    expect(result.className).toContain('hide-mobile');
    expect(result.className).not.toContain('hide-tablet');
    expect(result.className).toContain('reverse-mobile');
  });

  it('includes extraClasses when provided alongside visibility classes', () => {
    const result = getUniversalStyles({
      hideTablet: true,
      extraClasses: 'my-custom-class',
    });
    expect(result.className).toContain('hide-tablet');
    expect(result.className).toContain('my-custom-class');
  });

  it('does not add visibility classes when all false', () => {
    const result = getUniversalStyles({
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
      reverseMobile: false,
    });
    expect(result.className).not.toContain('hide-');
    expect(result.className).not.toContain('reverse-mobile');
  });
});

describe('getUniversalStyles — Border & Effects', () => {
  it('sets border CSS vars when borderWidth, borderColor, borderStyle provided', () => {
    const result = getUniversalStyles({
      borderWidth: 2,
      borderColor: '#2563eb',
      borderStyle: 'solid',
    });
    expect(result.style['--border-width']).toBe('2px');
    expect(result.style['--border-color']).toBe('#2563eb');
    expect(result.style['--border-style']).toBe('solid');
  });

  it('sets borderRadius CSS var', () => {
    const result = getUniversalStyles({ borderRadius: 12 });
    expect(result.style['--border-radius']).toBe('12px');
  });

  it('sets opacity and boxShadow CSS vars', () => {
    const result = getUniversalStyles({
      opacity: 0.85,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    });
    expect(result.style['--opacity']).toBe(0.85);
    expect(result.style['--box-shadow']).toBe('0 4px 12px rgba(0,0,0,0.1)');
  });

  it('skips boxShadow when value is "none"', () => {
    const result = getUniversalStyles({ boxShadow: 'none' });
    expect(result.style['--box-shadow']).toBeUndefined();
  });

  it('sets zIndex', () => {
    const result = getUniversalStyles({ zIndex: 50 });
    expect(result.style['--z-index']).toBe(50);
  });

  it('sets zIndex as "auto" string', () => {
    const result = getUniversalStyles({ zIndex: 'auto' });
    expect(result.style['--z-index']).toBe('auto');
  });

  it('sets hover effect CSS vars when hoverEffect provided', () => {
    const result = getUniversalStyles({
      hoverEffect: 'lift',
      hoverDuration: 300,
      hoverIntensity: 15,
      hoverEasing: 'ease-in-out',
      hoverGlowColor: '#ff0000',
    });
    expect(result.style['--hover-duration']).toBe('300ms');
    expect(result.style['--hover-easing']).toBe('ease-in-out');
    expect(result.style['--hover-distance']).toBe('15px');
    expect(result.style['--hover-scale']).toBe(`${1 + Math.min(15, 40) / 250}`);
    expect(result.style['--hover-zoom']).toBe(`${1 + Math.min(15, 40) / 160}`);
    expect(result.style['--hover-glow-color']).toBe('#ff0000');
    expect(result.className).toContain('effect-hover-lift');
  });

  it('sets hover effect with default values when only hoverEffect provided', () => {
    const result = getUniversalStyles({ hoverEffect: 'scale' });
    expect(result.style['--hover-duration']).toBe('220ms');
    expect(result.style['--hover-easing']).toBe('ease-out');
    expect(result.style['--hover-distance']).toBe('10px');
    expect(result.className).toContain('effect-hover-scale');
  });

  it('does not add effect class when hoverEffect is "none"', () => {
    const result = getUniversalStyles({ hoverEffect: 'none' });
    expect(result.className).not.toContain('effect-hover-');
  });

  it('sets filter effect vars and class when filterEffect provided', () => {
    const result = getUniversalStyles({
      filterEffect: 'grayscale',
      filterIntensity: 75,
    });
    expect(result.style['--filter-amount']).toBe('75%');
    expect(result.style['--filter-blur']).toBe(`${75 / 25}px`);
    expect(result.className).toContain('effect-filter-grayscale');
  });
});

describe('getUniversalStyles — Animation', () => {
  it('adds animation class when entranceAnimation provided', () => {
    const result = getUniversalStyles({ entranceAnimation: 'fadeIn' });
    expect(result.className).toContain('animate-fadeIn');
  });

  it('supports legacy entryAnimation prop as fallback', () => {
    const result = getUniversalStyles({ entryAnimation: 'slideInLeft' } as unknown as Parameters<
      typeof getUniversalStyles
    >[0]);
    expect(result.className).toContain('animate-slideInLeft');
  });

  it('sets animation duration, delay, and easing vars', () => {
    const result = getUniversalStyles({
      entranceAnimation: 'fadeIn',
      animationDuration: 1000,
      animationDelay: 200,
      animationEasing: 'ease-in',
    });
    expect(result.style['--anim-duration']).toBe('1000ms');
    expect(result.style['--anim-delay']).toBe('200ms');
    expect(result.style['--anim-easing']).toBe('ease-in');
  });

  it('adds animation-trigger-load class when trigger is "load"', () => {
    const result = getUniversalStyles({
      entranceAnimation: 'fadeIn',
      animationTrigger: 'load',
    });
    expect(result.className).toContain('animate-fadeIn');
    expect(result.className).toContain('animation-trigger-load');
  });

  it('does not add animation-trigger-load when trigger is "viewport"', () => {
    const result = getUniversalStyles({
      entranceAnimation: 'fadeIn',
      animationTrigger: 'viewport',
    });
    expect(result.className).toContain('animate-fadeIn');
    expect(result.className).not.toContain('animation-trigger-load');
  });

  it('sets animation iteration, direction, and fill mode vars', () => {
    const result = getUniversalStyles({
      entranceAnimation: 'bounce',
      animationRepeat: '3',
      animationDirection: 'alternate',
      animationFillMode: 'forwards',
    });
    expect(result.style['--anim-iteration-count']).toBe('3');
    expect(result.style['--anim-direction']).toBe('alternate');
    expect(result.style['--anim-fill-mode']).toBe('forwards');
  });

  it('does not add animation class when entranceAnimation is "none"', () => {
    const result = getUniversalStyles({ entranceAnimation: 'none' });
    expect(result.className).not.toContain('animate-');
  });

  it('combines animation class with effect classes and visibility classes', () => {
    const result = getUniversalStyles({
      entranceAnimation: 'fadeInUp',
      hoverEffect: 'shadow',
      hideMobile: true,
    });
    expect(result.className).toContain('animate-fadeInUp');
    expect(result.className).toContain('effect-hover-shadow');
    expect(result.className).toContain('hide-mobile');
  });
});

describe('getUniversalStyles — Custom Inline CSS', () => {
  it('parses customInlineCss and applies to style object', () => {
    const result = getUniversalStyles({
      customInlineCss: 'background-color: red; color: white;',
    });
    expect(result.style.backgroundColor).toBe('red');
    expect(result.style.color).toBe('white');
  });

  it('handles empty customInlineCss gracefully', () => {
    const result = getUniversalStyles({ customInlineCss: '' });
    expect(Object.keys(result.style)).toHaveLength(0);
  });
});

// =============================================================================
// Tests — BuilderCanvas — Responsive View Modes
// =============================================================================

describe('BuilderCanvas — Responsive Widths', () => {
  it('applies desktop widthClass', () => {
    const { container } = render(<BuilderCanvas blocks={[]} widthClass="max-w-6xl" />);
    const canvas = container.querySelector('[data-testid="builder-canvas"]');
    expect(canvas).toHaveClass('max-w-6xl');
  });

  it('applies tablet widthClass', () => {
    const { container } = render(<BuilderCanvas blocks={[]} widthClass="max-w-[768px]" />);
    const canvas = container.querySelector('[data-testid="builder-canvas"]');
    expect(canvas).toHaveClass('max-w-[768px]');
  });

  it('applies mobile widthClass', () => {
    const { container } = render(<BuilderCanvas blocks={[]} widthClass="max-w-[375px]" />);
    const canvas = container.querySelector('[data-testid="builder-canvas"]');
    expect(canvas).toHaveClass('max-w-[375px]');
  });

  it('shows empty state when no blocks', () => {
    render(<BuilderCanvas blocks={[]} widthClass="max-w-6xl" />);
    expect(screen.getByText('La page est vide')).toBeInTheDocument();
    expect(
      screen.getByText('Glissez un élément ou un modèle depuis la barre latérale.'),
    ).toBeInTheDocument();
  });

  it('renders mouse pointer icon in empty state', () => {
    render(<BuilderCanvas blocks={[]} widthClass="max-w-6xl" />);
    expect(screen.getByTestId('mock-mouse-pointer')).toBeInTheDocument();
  });

  it('renders blocks when provided (does not show empty state)', () => {
    const blocks = [{ id: 'block-1', type: 'hero', content: { title: 'Test' }, style: {} }];
    render(<BuilderCanvas blocks={blocks} widthClass="max-w-6xl" />);
    expect(screen.queryByText('La page est vide')).not.toBeInTheDocument();
    // BuilderPageRenderer mock renders a div with block count
    expect(screen.getByTestId('builder-page-renderer')).toBeInTheDocument();
  });

  it('renders multiple blocks', () => {
    const blocks = [
      { id: 'b1', type: 'hero', content: {}, style: {} },
      { id: 'b2', type: 'text', content: {}, style: {} },
      { id: 'b3', type: 'image', content: {}, style: {} },
    ];
    render(<BuilderCanvas blocks={blocks} widthClass="max-w-6xl" />);
    // Our mock shows "3 block(s)"
    expect(screen.getByTestId('builder-page-renderer')).toHaveTextContent('3 block(s)');
  });
});
