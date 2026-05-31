import { resolveColor, ColorToken } from './tokens/colors';
import { SpacingToken, spacingTailwindMap, marginTailwindMap, gapTailwindMap, resolveSpacing } from './tokens/spacing';
import { FontSizeToken, FontWeightToken, fontSizeTailwindMap, fontWeightTailwindMap } from './tokens/typography';
import { RadiusToken, radiusTailwindMap, resolveRadius } from './tokens/radius';
import { ShadowToken, shadowTailwindMap } from './tokens/shadows';

export interface StyleTokens {
  background?: ColorToken | string;
  color?: ColorToken | string;
  borderColor?: ColorToken | string;
  padding?: SpacingToken | string;
  paddingX?: SpacingToken | string;
  paddingY?: SpacingToken | string;
  margin?: SpacingToken | string;
  marginX?: SpacingToken | string;
  marginY?: SpacingToken | string;
  gap?: SpacingToken | string;
  fontSize?: FontSizeToken | string;
  fontWeight?: FontWeightToken | string;
  radius?: RadiusToken | string;
  shadow?: ShadowToken | string;
  width?: string;
  height?: string;
  maxWidth?: string;
}

export interface ResolvedStyles {
  className: string;
  style: Record<string, string>;
}

function isToken(value: string, prefix: string): boolean {
  return value.startsWith(`${prefix}.`);
}

function isColorToken(v: string): v is ColorToken {
  return /^(primary|secondary|surface|accent|danger|warning|success|neutral)\.\d+$/.test(v);
}

function isSpacingToken(v: string): v is SpacingToken {
  return v in spacingTailwindMap;
}

function isFontSizeToken(v: string): v is FontSizeToken {
  return v in fontSizeTailwindMap;
}

function isFontWeightToken(v: string): v is FontWeightToken {
  return v in fontWeightTailwindMap;
}

function isRadiusToken(v: string): v is RadiusToken {
  return v in radiusTailwindMap;
}

function isShadowToken(v: string): v is ShadowToken {
  return v in shadowTailwindMap;
}

export function resolveStyleTokens(tokens: StyleTokens): ResolvedStyles {
  const classes: string[] = [];
  const style: Record<string, string> = {};

  if (tokens.background) {
    if (isColorToken(tokens.background)) {
      const resolved = resolveColor(tokens.background);
      if (resolved) style.backgroundColor = resolved;
    } else {
      style.backgroundColor = tokens.background;
    }
  }

  if (tokens.color) {
    if (isColorToken(tokens.color)) {
      const resolved = resolveColor(tokens.color);
      if (resolved) style.color = resolved;
    } else {
      style.color = tokens.color;
    }
  }

  if (tokens.borderColor) {
    if (isColorToken(tokens.borderColor)) {
      const resolved = resolveColor(tokens.borderColor);
      if (resolved) style.borderColor = resolved;
    } else {
      style.borderColor = tokens.borderColor;
    }
  }

  if (tokens.padding) {
    if (isSpacingToken(tokens.padding)) {
      classes.push(spacingTailwindMap[tokens.padding]);
    } else {
      style.padding = tokens.padding;
    }
  }

  if (tokens.paddingX) {
    if (isSpacingToken(tokens.paddingX)) {
      classes.push(spacingTailwindMap[tokens.paddingX].replace('p-', 'px-'));
    } else {
      style.paddingLeft = tokens.paddingX;
      style.paddingRight = tokens.paddingX;
    }
  }

  if (tokens.paddingY) {
    if (isSpacingToken(tokens.paddingY)) {
      classes.push(spacingTailwindMap[tokens.paddingY].replace('p-', 'py-'));
    } else {
      style.paddingTop = tokens.paddingY;
      style.paddingBottom = tokens.paddingY;
    }
  }

  if (tokens.margin) {
    if (isSpacingToken(tokens.margin)) {
      classes.push(marginTailwindMap[tokens.margin]);
    } else {
      style.margin = tokens.margin;
    }
  }

  if (tokens.marginX) {
    if (isSpacingToken(tokens.marginX)) {
      classes.push(marginTailwindMap[tokens.marginX].replace('m-', 'mx-'));
    } else {
      style.marginLeft = tokens.marginX;
      style.marginRight = tokens.marginX;
    }
  }

  if (tokens.marginY) {
    if (isSpacingToken(tokens.marginY)) {
      classes.push(marginTailwindMap[tokens.marginY].replace('m-', 'my-'));
    } else {
      style.marginTop = tokens.marginY;
      style.marginBottom = tokens.marginY;
    }
  }

  if (tokens.gap) {
    if (isSpacingToken(tokens.gap)) {
      classes.push(gapTailwindMap[tokens.gap]);
    } else {
      style.gap = tokens.gap;
    }
  }

  if (tokens.fontSize) {
    if (isFontSizeToken(tokens.fontSize)) {
      classes.push(fontSizeTailwindMap[tokens.fontSize]);
    } else {
      style.fontSize = tokens.fontSize;
    }
  }

  if (tokens.fontWeight) {
    if (isFontWeightToken(tokens.fontWeight)) {
      classes.push(fontWeightTailwindMap[tokens.fontWeight]);
    } else {
      style.fontWeight = tokens.fontWeight;
    }
  }

  if (tokens.radius) {
    if (isRadiusToken(tokens.radius)) {
      classes.push(radiusTailwindMap[tokens.radius]);
    } else {
      style.borderRadius = tokens.radius;
    }
  }

  if (tokens.shadow) {
    if (isShadowToken(tokens.shadow)) {
      classes.push(shadowTailwindMap[tokens.shadow]);
    } else {
      style.boxShadow = tokens.shadow;
    }
  }

  if (tokens.width) style.width = tokens.width;
  if (tokens.height) style.height = tokens.height;
  if (tokens.maxWidth) style.maxWidth = tokens.maxWidth;

  return {
    className: classes.join(' '),
    style,
  };
}

export function styleTokensToInlineCSS(tokens: StyleTokens): string {
  const { style } = resolveStyleTokens(tokens);
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${value}`)
    .join('; ');
}

export function styleTokensToTailwindClasses(tokens: StyleTokens): string {
  return resolveStyleTokens(tokens).className;
}
