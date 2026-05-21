
import React from 'react';

import { cn } from '@/lib/utils';

// --- Types ---
interface BlockProps {
  id: string;
  content: BlockContent;
  style?: BlockStyle;
  className?: string; // Passed from parent (for selection outline, etc.)
  children?: React.ReactNode;
}

// --- 1. HERO BLOCK ---
export const HeroBlock: React.FC<BlockProps> = ({ content, style, id, className }) => {
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
          href={content.href}
          className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-lg hover:bg-blue-700">
          
                        {content.text || "En savoir plus"}
                    </a>
        }
            </div>
        </section>);

};

// --- 2. TEXT BLOCK ---
export const TextBlock: React.FC<BlockProps> = ({ content, style, id, className }) => {
  return (
    <div
      id={id}
      className={cn("prose max-w-none p-4", className, style?.className)}
      style={style as React.CSSProperties}>
      
            {content.title && <h2>{content.title}</h2>}
            <div dangerouslySetInnerHTML={{ __html: content.html || content.text || '<p>Texte par défaut...</p>' }} />
        </div>);

};

// --- 3. IMAGE BLOCK ---
export const ImageBlock: React.FC<BlockProps> = ({ content, style, id, className }) => {
  return (
    <div id={id} className={cn("w-full overflow-hidden", className)} style={style as React.CSSProperties}>
            <img
        src={content.src || 'https://via.placeholder.com/800x400'}
        alt={content.alt || 'Image'}
        className={cn("w-full h-auto object-cover", style?.className)}
        style={{
          borderRadius: style?.borderRadius
        }} loading="lazy" />
      
            {content.caption &&
      <p className="text-center text-sm text-gray-500 mt-2 italic">{content.caption}</p>
      }
        </div>);

};

// --- 4. HTML / CODE BLOCK ---
export const HtmlBlock: React.FC<BlockProps> = ({ content, style, id, className }) => {
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
      dangerouslySetInnerHTML={{ __html: content.html || content.code || '' }} />);


};

// --- 5. SECTION / CONTAINER BLOCK ---
export const SectionBlock: React.FC<BlockProps> = ({ content, style, id, className, children }) => {
  return (
    <section
      id={id}
      className={cn("min-h-[100px] p-4", className, style?.className)}
      style={style as React.CSSProperties}>
      
            {children}
        </section>);

};