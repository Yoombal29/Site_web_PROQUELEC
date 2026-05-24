
import React from 'react';

import { cn } from '@/lib/utils';
import { sanitizeHTML, sanitizeCodeBlock, sanitizeURL } from '@/utils/sanitize';

// --- Types ---
interface BlockProps {
  id: string;
  content: BlockContent;
  style?: BlockStyle;
  className?: string; // Passed from parent (for selection outline, etc.)
  children?: React.ReactNode;
}

interface BlockStyle {
  [key: string]: unknown;
  borderRadius?: string;
  objectFit?: string;
  className?: string;
}

interface BlockContent {
  title?: string;
  subtitle?: string;
  text?: string;
  html?: string;
  code?: string;
  src?: string;
  alt?: string;
  href?: string;
  caption?: string;
  [key: string]: unknown;
}

// --- 1. HERO BLOCK ---
export const HeroBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden",
        className,
        style?.className
      )}
      style={style as React.CSSProperties}>
      
            {/* Background Content (if any special logic needed, otherwise style handles it) */}

            <div className="relative z-10 max-w-4xl mx-auto">
                {content.title &&
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                        {content.title}
                    </h1>
        }
                {content.subtitle &&
        <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
        }
                {content.href &&
        <a
          href={sanitizeURL(content.href)}
          className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-lg hover:bg-blue-700">
          
                        {content.text || "En savoir plus"}
                    </a>
        }
            </div>
        </section>);

});

// --- 2. TEXT BLOCK ---
export const TextBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  const sanitizedHTML = sanitizeHTML(content.html || content.text || '<p>Texte par défaut...</p>');
  
  return (
    <div
      id={id}
      className={cn("prose max-w-none p-4", className, style?.className)}
      style={style as React.CSSProperties}>
      
            {content.title && <h2>{content.title}</h2>}
            <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
        </div>);

});

// --- 3. IMAGE BLOCK ---
export const ImageBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <div id={id} className={cn("w-full overflow-hidden", className)} style={style as React.CSSProperties}>
            <img
        src={sanitizeURL(content.src) || 'https://via.placeholder.com/800x400'}
        alt={content.alt || 'Image'}
        className={cn("w-full h-auto object-cover", style?.className)}
        style={{
          borderRadius: style?.borderRadius as string,
          objectFit: style?.objectFit as React.CSSProperties['objectFit']
        }} loading="lazy" />
      
            {content.caption &&
      <p className="text-center text-sm text-gray-500 mt-2 italic">{content.caption}</p>
      }
        </div>);

});

// --- 4. HTML / CODE BLOCK ---
export const HtmlBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  const isCodeBlock = content.type === 'code' || !content.html;
  const sanitized = isCodeBlock 
    ? sanitizeCodeBlock(content.code || content.html) 
    : sanitizeHTML(content.html || content.code || '');

  if (!content.html && !content.code) {
    return (
      <div className={cn("p-4 border border-dashed border-gray-300 text-gray-400 text-sm italic text-center", className)}>
                &lt;Code /&gt; (Vide)
            </div>);

  }
  return (
    <div
      id={id}
      className={className}
      style={style as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: sanitized }} />);


});

// --- 5. SECTION / CONTAINER BLOCK ---
export const SectionBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className, children }) => {
  // Sanitize content to prevent XSS
  const sanitizedContent = {
    title: content.title ? sanitizeHTML(String(content.title)) : undefined,
    subtitle: content.subtitle ? sanitizeHTML(String(content.subtitle)) : undefined,
    text: content.text ? sanitizeHTML(String(content.text)) : undefined,
    html: content.html ? sanitizeHTML(String(content.html)) : undefined,
    src: content.src ? sanitizeURL(String(content.src)) : undefined,
    href: content.href ? sanitizeURL(String(content.href)) : undefined,
    caption: content.caption ? sanitizeHTML(String(content.caption)) : undefined,
  };

  return (
    <section
      id={id}
      className={cn("min-h-[100px] p-4", className, style?.className)}
      style={style as React.CSSProperties}>

            {sanitizedContent.title && <h2>{sanitizedContent.title}</h2>}
            {sanitizedContent.subtitle && <p>{sanitizedContent.subtitle}</p>}
            {sanitizedContent.text && <p>{sanitizedContent.text}</p>}
            {sanitizedContent.html && <div dangerouslySetInnerHTML={{ __html: sanitizedContent.html }} />}
            {children}
        </section>);

});