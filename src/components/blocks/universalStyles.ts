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
  entryAnimation?: string;
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
  entranceAnimation?: string;
  animationDuration?: ResponsiveProp<number>;
  animationDelay?: ResponsiveProp<number>;
  animationEasing?: string;
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
  if (props.entranceAnimation && props.entranceAnimation !== 'none') {
    animationClass = `animate-${props.entranceAnimation}`;
    if (props.animationDuration !== undefined && props.animationDuration !== null) {
      const dur = typeof props.animationDuration === 'object' ? props.animationDuration.desktop : props.animationDuration;
      style['--anim-duration'] = `${dur}ms`;
    }
    if (props.animationDelay !== undefined && props.animationDelay !== null) {
      const del = typeof props.animationDelay === 'object' ? props.animationDelay.desktop : props.animationDelay;
      style['--anim-delay'] = `${del}ms`;
    }
    if (props.animationEasing) {
      style['--anim-easing'] = props.animationEasing;
    }
  }

  const visibilityClasses = [];
  if (props.hideDesktop) visibilityClasses.push('hide-desktop');
  if (props.hideTablet) visibilityClasses.push('hide-tablet');
  if (props.hideMobile) visibilityClasses.push('hide-mobile');
  if (props.reverseMobile) visibilityClasses.push('reverse-mobile');

  return {
    style,
    className: `${animationClass} ${visibilityClasses.join(' ')} ${props.extraClasses || ''}`.trim(),
  };
};
