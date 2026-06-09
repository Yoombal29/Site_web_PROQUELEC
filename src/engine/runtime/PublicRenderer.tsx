import React, { useEffect, useRef } from 'react';
import { ComponentRegistry } from '@/components/builder/ComponentRegistry';
import { sanitizeCSS, sanitizeCSSSelector, sanitizeCSSValue } from '@/utils/sanitize';
import type { CompiledBlock, CompiledRuntime } from '@/engine/publish/types';
import type { BlockStyle } from '@/types/builder';

export interface PublicRendererProps {
  runtime: CompiledRuntime;
  className?: string;
}

// Helper to extract used fonts from compiled blocks
const getUsedFonts = (blocks: CompiledBlock[]): Set<string> => {
  const fonts = new Set<string>();
  
  const traverse = (nodes: CompiledBlock[]) => {
    for (const block of nodes) {
      const baseStyle = (block.style as any)?.base || block.style || {};
      if (baseStyle.fontFamily && !['sans', 'serif', 'mono', 'inherit'].includes(baseStyle.fontFamily)) {
        fonts.add(baseStyle.fontFamily);
      }
      if (block.children && block.children.length > 0) {
        traverse(block.children);
      }
    }
  };
  
  if (blocks) traverse(blocks);
  return fonts;
};

// Helper to generate CSS for responsive and dark mode styles
const generateResponsiveCss = (blocks: CompiledBlock[]): string => {
  let css = '';
  if (!blocks) return css;

  const traverse = (nodes: CompiledBlock[]) => {
    for (const block of nodes) {
      const rawStyle = block.style as any;
      if (rawStyle && (rawStyle.tablet || rawStyle.mobile || rawStyle.dark)) {
        const id = sanitizeCSSSelector(block.id);
        
        const toCssString = (styleObj: any) => {
          if (!styleObj) return '';
          return Object.entries(styleObj)
            .filter(([k]) => k !== 'className' && k !== 'customCss')
            .map(([k, v]) => {
              const kebabKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
              const sanitizedValue = sanitizeCSSValue(String(v));
              return `${kebabKey}: ${sanitizedValue} !important;`;
            })
            .join(' ');
        };

        if (rawStyle.tablet && Object.keys(rawStyle.tablet).length > 0) {
          const tabletCss = toCssString(rawStyle.tablet);
          css += `@media (max-width: 1024px) { [id="${id}"] { ${tabletCss} } }\n`;
        }
        if (rawStyle.mobile && Object.keys(rawStyle.mobile).length > 0) {
          const mobileCss = toCssString(rawStyle.mobile);
          css += `@media (max-width: 768px) { [id="${id}"] { ${mobileCss} } }\n`;
        }
        if (rawStyle.dark && Object.keys(rawStyle.dark).length > 0) {
          const darkCss = toCssString(rawStyle.dark);
          css += `.dark [id="${id}"] { ${darkCss} }\n`;
        }
      }
      
      if (block.children && block.children.length > 0) {
        traverse(block.children);
      }
    }
  };

  traverse(blocks);
  return sanitizeCSS(css);
};

const RecursiveRenderer: React.FC<{ blocks: CompiledBlock[] }> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => {
        const Component = ComponentRegistry[block.type];

        if (!Component) {
          // Public runtime silently ignores unknown blocks rather than throwing UI errors
          console.warn(`[PublicRenderer] Unknown block type: ${block.type}`);
          return null;
        }

        const rawStyle = block.style as any;
        const hasNested = rawStyle && (rawStyle.base || rawStyle.tablet || rawStyle.mobile || rawStyle.dark);
        const baseStyle = hasNested ? rawStyle.base : rawStyle;

        // Determine props: static bindings take precedence if resolved
        const contentProps = { ...block.content, ...(block.resolvedBindings || {}) };

        // Animation classes
        const animClasses = block.animationClasses?.join(' ') || '';
        const combinedClassName = [baseStyle?.className, animClasses].filter(Boolean).join(' ');

        return (
          <Component
            key={block.id}
            id={block.id}
            {...contentProps}
            content={contentProps}
            style={(baseStyle ?? {}) as BlockStyle}
            className={combinedClassName}
          >
            {block.children && block.children.length > 0 ? (
              <RecursiveRenderer blocks={block.children} />
            ) : undefined}
          </Component>
        );
      })}
    </>
  );
};

/**
 * PublicRenderer
 * A pure, standalone renderer for CompiledRuntime. 
 * Completely decoupled from DND-kit, Editor state, and History wrappers.
 */
const usePublicEntranceObserver = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const observeAnimated = () => {
      if (!container) return;
      container.querySelectorAll('[class*="-vp"]').forEach((el) => {
        if (!el.classList.contains('anim-visible')) {
          observer.observe(el);
        }
      });
    };

    observeAnimated();

    const mutationObserver = new MutationObserver(observeAnimated);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef]);
};

export const PublicRenderer: React.FC<PublicRendererProps> = ({ runtime, className }) => {
  const { blocks, animationCSS } = runtime;
  const containerRef = useRef<HTMLDivElement | null>(null);
  usePublicEntranceObserver(containerRef);

  // Dynamic Font Loading
  useEffect(() => {
    const usedFonts = getUsedFonts(blocks || []);
    if (usedFonts.size > 0) {
      const fontFamilies = Array.from(usedFonts).map((f) => f.replace(/ /g, '+'));
      const linkId = 'runtime-google-fonts';
      let link = document.getElementById(linkId) as HTMLLinkElement;

      if (!link && fontFamilies.length > 0) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      if (fontFamilies.length > 0 && link) {
        const fontQuery = fontFamilies.map((f) => `family=${f}:wght@300;400;600;700`).join('&');
        link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
      }
    }
  }, [blocks]);

  if (!blocks || blocks.length === 0) {
    return null;
  }

  const responsiveCSS = generateResponsiveCss(blocks);
  const combinedCSS = [responsiveCSS, animationCSS].filter(Boolean).join('\n');

  return (
    <div ref={containerRef} className={`proquelec-runtime ${className || ''}`}>
      {combinedCSS && <style dangerouslySetInnerHTML={{ __html: combinedCSS }} />}
      <RecursiveRenderer blocks={blocks} />
    </div>
  );
};

export default React.memo(PublicRenderer);
