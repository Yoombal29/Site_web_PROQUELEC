import React from 'react';

/**
 * Type pour les propriétés responsives (Desktop / Tablet / Mobile)
 */
export type ResponsiveProp<T> = T | {
  desktop?: T;
  tablet?: T;
  mobile?: T;
};

export interface UniversalStylesProps {
  marginTop?: ResponsiveProp<number>;
  marginRight?: ResponsiveProp<number>;
  marginBottom?: ResponsiveProp<number>;
  marginLeft?: ResponsiveProp<number>;
  paddingTop?: ResponsiveProp<number>;
  paddingRight?: ResponsiveProp<number>;
  paddingBottom?: ResponsiveProp<number>;
  paddingLeft?: ResponsiveProp<number>;
  fontSize?: ResponsiveProp<number>;
  textAlign?: ResponsiveProp<string>;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: number;
  opacity?: number;
  boxShadow?: string;
  zIndex?: number | 'auto';
  entryAnimation?: ResponsiveProp<string>;
  customInlineCss?: string;
  extraClasses?: string;
  htmlId?: string;
  
  // Responsive Visibility
  hideDesktop?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;

  // Mobile Reverse
  reverseMobile?: boolean;

  // Layout Props
  display?: ResponsiveProp<'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none'>;
  flexDirection?: ResponsiveProp<'row' | 'row-reverse' | 'column' | 'column-reverse'>;
  flexWrap?: ResponsiveProp<'nowrap' | 'wrap' | 'wrap-reverse'>;
  justifyContent?: ResponsiveProp<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>;
  alignItems?: ResponsiveProp<'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'>;
  gap?: ResponsiveProp<number>;
  flexGrow?: ResponsiveProp<number>;
  flexShrink?: ResponsiveProp<number>;
  flexBasis?: ResponsiveProp<string>;
  order?: ResponsiveProp<number>;
  alignSelf?: ResponsiveProp<'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'>;
  gridTemplateColumns?: ResponsiveProp<string>;
  gridTemplateRows?: ResponsiveProp<string>;
  placeItems?: ResponsiveProp<string>;

  // Typography
  fontFamily?: ResponsiveProp<string>;
  fontWeight?: ResponsiveProp<string>;
  fontStyle?: ResponsiveProp<string>;
  lineHeight?: ResponsiveProp<number>;
  letterSpacing?: ResponsiveProp<number>;
  fontColor?: string;

  // Entrance Animation
  entranceAnimation?: ResponsiveProp<string>;
  animationDuration?: ResponsiveProp<number>;
  animationDelay?: ResponsiveProp<number>;
  animationEasing?: ResponsiveProp<string>;
  animationTrigger?: ResponsiveProp<'viewport' | 'load'>;
  animationRepeat?: ResponsiveProp<string | number>;
  animationDirection?: ResponsiveProp<'normal' | 'reverse' | 'alternate' | 'alternate-reverse'>;
  animationFillMode?: ResponsiveProp<'none' | 'forwards' | 'backwards' | 'both'>;

  // Motion & visual effects
  hoverEffect?: ResponsiveProp<string>;
  hoverDuration?: ResponsiveProp<number>;
  hoverIntensity?: ResponsiveProp<number>;
  hoverEasing?: ResponsiveProp<string>;
  hoverGlowColor?: string;
  filterEffect?: ResponsiveProp<string>;
  filterIntensity?: ResponsiveProp<number>;
}

/**
 * Génère les variables CSS responsive et les classes d'animation
 * pour les appliquer sur le nœud racine de n'importe quel bloc.
 */
export const getUniversalStyles = (props: UniversalStylesProps) => {
  const style: React.CSSProperties & Record<string, any> = {};

  // Helper pour traiter les valeurs simples ou les objets responsive { desktop, tablet, mobile }
  const applyResponsiveVar = (propName: keyof UniversalStylesProps, varName: string, unit = 'px') => {
    const val = props[propName];
    if (val === undefined || val === null) return;

    if (typeof val === 'object' && !Array.isArray(val)) {
      const resp = val as { desktop?: any; tablet?: any; mobile?: any };
      if (resp.desktop !== undefined && resp.desktop !== null) {
        style[`--desktop-${varName}`] = `${resp.desktop}${unit}`;
      }
      if (resp.tablet !== undefined && resp.tablet !== null) {
        style[`--tablet-${varName}`] = `${resp.tablet}${unit}`;
      }
      if (resp.mobile !== undefined && resp.mobile !== null) {
        style[`--mobile-${varName}`] = `${resp.mobile}${unit}`;
      }
    } else {
      // Valeur simple (legacy ou non configurée responsive)
      style[`--desktop-${varName}`] = `${val}${unit}`;
      style[`--tablet-${varName}`] = `${val}${unit}`;
      style[`--mobile-${varName}`] = `${val}${unit}`;
    }
  };

  const getValue = <T,>(value: ResponsiveProp<T> | undefined, fallback?: T): T | undefined => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const responsive = value as { desktop?: T; tablet?: T; mobile?: T };
      return responsive.desktop ?? responsive.tablet ?? responsive.mobile ?? fallback;
    }
    return value as T;
  };

  const getNumberValue = (value: ResponsiveProp<number> | undefined, fallback: number) => {
    const resolved = getValue<number>(value, fallback);
    const numeric = typeof resolved === 'number' ? resolved : Number(resolved);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  // 1. Spacing (Marge & Padding)
  applyResponsiveVar('marginTop', 'margin-top');
  applyResponsiveVar('marginRight', 'margin-right');
  applyResponsiveVar('marginBottom', 'margin-bottom');
  applyResponsiveVar('marginLeft', 'margin-left');

  applyResponsiveVar('paddingTop', 'padding-top');
  applyResponsiveVar('paddingRight', 'padding-right');
  applyResponsiveVar('paddingBottom', 'padding-bottom');
  applyResponsiveVar('paddingLeft', 'padding-left');

  // 1b. Typography (Taille & Alignement)
  applyResponsiveVar('fontSize', 'font-size', 'px');
  applyResponsiveVar('textAlign', 'text-align', '');

  // 1b. Typography — font-family, weight, style, line-height, letter-spacing
  applyResponsiveVar('fontFamily', 'font-family', '');
  applyResponsiveVar('fontWeight', 'font-weight', '');
  applyResponsiveVar('fontStyle', 'font-style', '');
  applyResponsiveVar('lineHeight', 'line-height', '');
  applyResponsiveVar('letterSpacing', 'letter-spacing', 'px');
  if (props.fontColor) {
    style['--font-color'] = props.fontColor;
  }

  // 1c. Layout (Display, Flexbox & Grid)
  applyResponsiveVar('display', 'display', '');
  applyResponsiveVar('flexDirection', 'flex-direction', '');
  applyResponsiveVar('flexWrap', 'flex-wrap', '');
  applyResponsiveVar('justifyContent', 'justify-content', '');
  applyResponsiveVar('alignItems', 'align-items', '');
  applyResponsiveVar('gap', 'gap', 'px');
  applyResponsiveVar('flexGrow', 'flex-grow', '');
  applyResponsiveVar('flexShrink', 'flex-shrink', '');
  applyResponsiveVar('flexBasis', 'flex-basis', '');
  applyResponsiveVar('order', 'order', '');
  applyResponsiveVar('alignSelf', 'align-self', '');
  applyResponsiveVar('gridTemplateColumns', 'grid-template-columns', '');
  applyResponsiveVar('gridTemplateRows', 'grid-template-rows', '');
  applyResponsiveVar('placeItems', 'place-items', '');

  // 2. Bordure & Arrondi
  if (props.borderWidth !== undefined && props.borderWidth !== null) {
    style['--border-width'] = `${props.borderWidth}px`;
  }
  if (props.borderColor !== undefined && props.borderColor !== null) {
    style['--border-color'] = props.borderColor;
  }
  if (props.borderStyle !== undefined && props.borderStyle !== null) {
    style['--border-style'] = props.borderStyle;
  }
  if (props.borderRadius !== undefined && props.borderRadius !== null) {
    style['--border-radius'] = `${props.borderRadius}px`;
  }

  // 3. Effets
  if (props.opacity !== undefined && props.opacity !== null) {
    style['--opacity'] = props.opacity;
  }
  if (props.boxShadow !== undefined && props.boxShadow !== 'none' && props.boxShadow !== null) {
    style['--box-shadow'] = props.boxShadow;
  }
  if (props.zIndex !== undefined && props.zIndex !== null) {
    style['--z-index'] = props.zIndex === 'auto' ? 'auto' : props.zIndex;
  }

  const hoverEffect = getValue<string>(props.hoverEffect, 'none');
  const hoverDuration = getNumberValue(props.hoverDuration, 220);
  const hoverIntensity = getNumberValue(props.hoverIntensity, 10);
  const hoverEasing = getValue<string>(props.hoverEasing, 'ease-out');
  const filterEffect = getValue<string>(props.filterEffect, 'none');
  const filterIntensity = getNumberValue(props.filterIntensity, 100);

  if (hoverEffect && hoverEffect !== 'none') {
    style['--hover-duration'] = `${hoverDuration}ms`;
    style['--hover-easing'] = hoverEasing;
    style['--hover-distance'] = `${hoverIntensity}px`;
    style['--hover-scale'] = `${1 + Math.min(hoverIntensity, 40) / 250}`;
    style['--hover-zoom'] = `${1 + Math.min(hoverIntensity, 40) / 160}`;
    style['--hover-rotate'] = `${Math.max(1, hoverIntensity / 3)}deg`;
    style['--hover-blur'] = `${Math.max(1, hoverIntensity / 8)}px`;
    style['--hover-glow-color'] = props.hoverGlowColor ?? '#2563eb';
  }

  if (filterEffect && filterEffect !== 'none') {
    const percent = `${Math.max(0, filterIntensity)}%`;
    style['--filter-amount'] = percent;
    style['--filter-blur'] = `${Math.max(0, filterIntensity / 25)}px`;
  }

  // 4. CSS personnalisé (inline parse)
  if (props.customInlineCss) {
    try {
      const lines = props.customInlineCss.split(';');
      lines.forEach((line) => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          const val = parts.slice(1).join(':').trim();
          if (key && val) {
            style[key] = val;
          }
        }
      });
    } catch (e) {
      console.warn('Error parsing custom inline CSS:', e);
    }
  }

  // 5. Entrance Animation & Visibility
  let animationClass = '';
  const entranceAnimation = getValue<string>(props.entranceAnimation ?? props.entryAnimation, 'none');
  if (entranceAnimation && entranceAnimation !== 'none') {
    animationClass = `animate-${entranceAnimation}`;
    if (props.animationDuration !== undefined && props.animationDuration !== null) {
      style['--anim-duration'] = `${getNumberValue(props.animationDuration, 600)}ms`;
    }
    if (props.animationDelay !== undefined && props.animationDelay !== null) {
      style['--anim-delay'] = `${getNumberValue(props.animationDelay, 0)}ms`;
    }
    const easing = getValue<string>(props.animationEasing, 'ease-out');
    const repeat = getValue<string | number>(props.animationRepeat, 1);
    const direction = getValue<string>(props.animationDirection, 'normal');
    const fillMode = getValue<string>(props.animationFillMode, 'both');
    const trigger = getValue<string>(props.animationTrigger, 'viewport');

    if (easing) {
      style['--anim-easing'] = easing;
    }
    if (repeat !== undefined && repeat !== null) {
      style['--anim-iteration-count'] = String(repeat);
    }
    if (direction) {
      style['--anim-direction'] = direction;
    }
    if (fillMode) {
      style['--anim-fill-mode'] = fillMode;
    }
    if (trigger === 'load') {
      animationClass += ' animation-trigger-load';
    }
  }

  const visibilityClasses = [];
  if (props.hideDesktop) visibilityClasses.push('hide-desktop');
  if (props.hideTablet) visibilityClasses.push('hide-tablet');
  if (props.hideMobile) visibilityClasses.push('hide-mobile');
  if (props.reverseMobile) visibilityClasses.push('reverse-mobile');

  const effectClasses = [];
  if (hoverEffect && hoverEffect !== 'none') effectClasses.push(`effect-hover-${hoverEffect}`);
  if (filterEffect && filterEffect !== 'none') effectClasses.push(`effect-filter-${filterEffect}`);

  return {
    style,
    className: `${animationClass} ${effectClasses.join(' ')} ${visibilityClasses.join(' ')} ${props.extraClasses || ''}`.trim(),
  };
};
