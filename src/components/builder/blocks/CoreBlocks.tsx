
import React from 'react';

import { cn } from '@/lib/utils';
import { sanitizeHTML, sanitizeCodeBlock, sanitizeURL } from '@/utils/sanitize';
import { resolveTokenStyle } from '@/design-system/runtime-resolver';

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
      style={resolveTokenStyle(style) as React.CSSProperties}>
      
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
      style={resolveTokenStyle(style) as React.CSSProperties}>
      
            {content.title && <h2>{content.title}</h2>}
            <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
        </div>);

});

// --- 3. IMAGE BLOCK ---
export const ImageBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <div id={id} className={cn("w-full overflow-hidden", className)} style={resolveTokenStyle(style) as React.CSSProperties}>
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
      style={resolveTokenStyle(style) as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: sanitized }} />);


});

// --- 5. BUTTON BLOCK ---
export const ButtonBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <div id={id} className={cn("flex justify-center", className)} style={resolveTokenStyle(style) as React.CSSProperties}>
      <a
        href={sanitizeURL(content.href || '#')}
        className={cn(
          "inline-block px-8 py-3 font-bold rounded-lg transition-all hover:scale-105 shadow-md text-center",
          style?.className
        )}
        style={{
          backgroundColor: style?.backgroundColor as string || '#2563eb',
          color: style?.color as string || '#ffffff',
          borderRadius: style?.borderRadius as string,
          fontSize: style?.fontSize as string,
          fontWeight: style?.fontWeight as string,
          padding: style?.padding as string,
        }}
      >
        {content.title || 'Bouton'}
      </a>
    </div>
  );
});

// --- 6. DIVIDER BLOCK ---
export const DividerBlock: React.FC<BlockProps> = React.memo(({ style, id, className }) => {
  return (
    <hr
      id={id}
      className={cn("border-t", className)}
      style={{
        borderColor: style?.borderColor as string || '#e2e8f0',
        margin: style?.margin as string || '20px 0',
        opacity: style?.opacity as number ?? 1,
        ...resolveTokenStyle(style) as React.CSSProperties,
      }}
    />
  );
});

// --- 7. SPACER BLOCK ---
export const SpacerBlock: React.FC<BlockProps> = React.memo(({ style, id, className }) => {
  return (
    <div
      id={id}
      className={className}
      style={{
        minHeight: style?.minHeight as string || '40px',
        ...resolveTokenStyle(style) as React.CSSProperties,
      }}
    />
  );
});

// --- 8. COLUMNS BLOCK ---
export const ColumnsBlock: React.FC<BlockProps> = React.memo(({ style, id, className, children }) => {
  return (
    <div
      id={id}
      className={cn("flex flex-wrap", className, style?.className)}
      style={{
        gap: style?.gap as string || '20px',
        ...resolveTokenStyle(style) as React.CSSProperties,
      }}
    >
      {children}
    </div>
  );
});

// --- 9. CARD BLOCK ---
export const CardBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <div
      id={id}
      className={cn("rounded-lg overflow-hidden", className, style?.className)}
      style={resolveTokenStyle(style) as React.CSSProperties}
    >
      {content.title && <h3 className="text-lg font-bold mb-2">{content.title}</h3>}
      {content.subtitle && <p className="text-sm opacity-80 mb-2">{content.subtitle}</p>}
      {content.text && <p className="text-sm">{content.text}</p>}
      {content.items && content.items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {content.items.map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {item.icon && <span>{item.icon}</span>}
              <span>{item.title || item.label || item.name}</span>
              {item.description && <span className="opacity-70">— {item.description}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

// --- 10. STATS BLOCK ---
export const StatsBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <div
      id={id}
      className={cn("flex flex-wrap justify-center gap-8", className, style?.className)}
      style={resolveTokenStyle(style) as React.CSSProperties}
    >
      {content.items && content.items.length > 0 ? content.items.map((item: any, i: number) => (
        <div key={i} className="text-center">
          {item.icon && <div className="text-3xl mb-2">{item.icon}</div>}
          <div className="text-3xl font-black" style={{ color: style?.color as string }}>{item.value || '0'}</div>
          <div className="text-sm opacity-80">{item.label || item.title}</div>
        </div>
      )) : (
        <>
          <div className="text-center">
            <div className="text-3xl font-black">100+</div>
            <div className="text-sm opacity-80">Projets réalisés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black">50+</div>
            <div className="text-sm opacity-80">Clients satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black">15+</div>
            <div className="text-sm opacity-80">Ans d'expérience</div>
          </div>
        </>
      )}
    </div>
  );
});

// --- 11. GRID BLOCK ---
export const GridBlock: React.FC<BlockProps> = React.memo(({ style, id, className, children }) => {
  return (
    <div
      id={id}
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className, style?.className)}
      style={resolveTokenStyle(style) as React.CSSProperties}
    >
      {children}
    </div>
  );
});

// --- 12. LIST BLOCK ---
export const ListBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  const items = content.items || [];
  return (
    <div
      id={id}
      className={cn("space-y-3", className)}
      style={resolveTokenStyle(style) as React.CSSProperties}
    >
      {content.title && <h3 className="text-lg font-bold mb-3">{content.title}</h3>}
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
          {item.icon && <span className="text-xl mt-0.5">{item.icon}</span>}
          <div>
            <div className="font-semibold text-sm">{item.title || item.label}</div>
            {(item.description || item.content) && (
              <div className="text-xs opacity-70 mt-0.5">{item.description || item.content}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

// --- 13. FORM BLOCK ---
export const FormBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  return (
    <div
      id={id}
      className={cn("p-6 rounded-lg", className, style?.className)}
      style={resolveTokenStyle(style) as React.CSSProperties}
    >
      {content.title && <h3 className="text-xl font-bold mb-2">{content.title}</h3>}
      {content.subtitle && <p className="text-sm opacity-80 mb-4">{content.subtitle}</p>}
      <div className="space-y-3">
        <input placeholder="Nom" className="w-full px-4 py-2 border rounded-lg text-sm" readOnly />
        <input placeholder="Email" className="w-full px-4 py-2 border rounded-lg text-sm" readOnly />
        <input placeholder="Téléphone" className="w-full px-4 py-2 border rounded-lg text-sm" readOnly />
        <textarea placeholder="Message" className="w-full px-4 py-2 border rounded-lg text-sm" rows={3} readOnly />
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">
          Envoyer
        </button>
      </div>
    </div>
  );
});

// --- 14. VIDEO BLOCK ---
export const VideoBlock: React.FC<BlockProps> = React.memo(({ content, style, id, className }) => {
  const src = content.src || '';
  const embedUrl = src.includes('youtube.com') || src.includes('youtu.be')
    ? src.replace(/.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/, 'https://www.youtube.com/embed/$1')
    : src;
  return (
    <div id={id} className={cn("w-full", className)} style={resolveTokenStyle(style) as React.CSSProperties}>
      <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
        {embedUrl ? (
          <iframe
            src={sanitizeURL(embedUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={content.caption || 'Video'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Vidéo (URL: {content.src || 'non définie'})
          </div>
        )}
      </div>
      {content.caption && <p className="text-center text-sm text-slate-500 mt-2 italic">{content.caption}</p>}
    </div>
  );
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
      style={resolveTokenStyle(style) as React.CSSProperties}>

            {sanitizedContent.title && <h2>{sanitizedContent.title}</h2>}
            {sanitizedContent.subtitle && <p>{sanitizedContent.subtitle}</p>}
            {sanitizedContent.text && <p>{sanitizedContent.text}</p>}
            {sanitizedContent.html && <div dangerouslySetInnerHTML={{ __html: sanitizedContent.html }} />}
            {children}
        </section>);

});