/**
 * HTML Sanitization Utility
 * Wraps DOMPurify to provide secure HTML content handling throughout the application
 * 
 * Security: Prevents XSS attacks by filtering dangerous tags and attributes
 * Performance: Uses memoization for repeated sanitization of same content
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify sanitization
 * Restricts to safe tags commonly used in builder blocks
 */
const SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'div', 'span', 'img',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'section', 'article', 'header',
    'footer', 'nav', 'figure', 'figcaption', 'video', 'audio', 'source'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'width', 'height', 'data-*', 'aria-*',
    'class', 'id', 'style', 'controls', 'loop', 'autoplay'
  ],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  IN_PLACE: false
};

/**
 * Simple memoization cache for sanitized content
 * Reduces overhead for repeated sanitization of same content
 */
const memoCache = new Map<string, string>();

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML content to sanitize
 * @param allowedTags - Optional custom list of allowed tags (uses default if not provided)
 * @returns Sanitized HTML safe for rendering with dangerouslySetInnerHTML
 * 
 * @example
 * const clean = sanitizeHTML('<img src=x onerror="alert(\'xss\')">');
 * // Returns: '<img src="x">'
 */
export const sanitizeHTML = (html: string | null | undefined, allowedTags?: string[]): string => {
  if (!html || typeof html !== 'string') return '';

  // Check cache first
  if (memoCache.has(html)) {
    return memoCache.get(html) || '';
  }

  // Configure tags if custom list provided
  const config = allowedTags ? { ...SANITIZE_CONFIG, ALLOWED_TAGS: allowedTags } : SANITIZE_CONFIG;

  try {
    const cleaned = DOMPurify.sanitize(html, config);
    
    // Cache the result for future use
    if (memoCache.size > 500) {
      // Prevent unbounded memory growth - clear cache if it gets too large
      const firstKey = memoCache.keys().next().value;
      if (firstKey) memoCache.delete(firstKey);
    }
    memoCache.set(html, cleaned);

    return cleaned;
  } catch (error) {
    console.error('[Sanitization Error]', error);
    return '';
  }
};

/**
 * Sanitize for code blocks - more restrictive
 * Only allows plain text and basic formatting
 */
export const sanitizeCodeBlock = (code: string | null | undefined): string => {
  if (!code || typeof code !== 'string') return '';
  
  // Code blocks should be plain text only - escape HTML entities
  return DOMPurify.sanitize(code, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize URL for href attributes
 * Prevents javascript: and data: protocol attacks
 */
export const sanitizeURL = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') return '';

  // Reject dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(url)) {
    console.warn(`[Sanitization] Blocked dangerous URL protocol: ${url}`);
    return '';
  }

  return url.trim();
};

/**
 * Sanitize CSS properties from user input
 * Prevents CSS injection attacks
 */
export const sanitizeCSS = (cssString: string | null | undefined): string => {
  if (!cssString || typeof cssString !== 'string') return '';

  // Reject dangerous CSS patterns
  const dangerous = /(javascript|expression|behavior|import|@import|-moz-binding)/i;
  if (dangerous.test(cssString)) {
    console.warn('[Sanitization] Blocked dangerous CSS pattern');
    return '';
  }

  return cssString;
};

/**
 * Clear sanitization cache
 * Useful for testing or memory management in long-running apps
 */
export const clearSanitizationCache = (): void => {
  memoCache.clear();
};

/**
 * Get cache statistics (useful for debugging)
 */
export const getSanitizationCacheStats = () => {
  return {
    size: memoCache.size,
    maxSize: 500
  };
};

export default sanitizeHTML;
