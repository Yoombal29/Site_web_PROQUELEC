import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';


interface SectionRendererProps {
  section: SectionContent;
  index?: number;
  themeColor?: string;
  isAdmin?: boolean;
  isSelected?: boolean;
  onEdit?: (id: string) => void;
}

/**
 * MOTEUR DE RENDU UNIFIÉ DE SECTION
 * Garantit une parité 1:1 entre l'Admin et le Site Public
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  index = 0,
  themeColor = "blue",
  isAdmin = false,
  isSelected = false,
  onEdit
}) => {
  if (!section || section.visible === false) return null;

  const { type, layout = 'left-right', title, subtitle, description, badge, media, features, stats, styles, customHTML } = section;

  // Rendu dynamique de l'icône
  const renderIcon = (iconName: string, className?: string) => {
    const IconComp = (LucideIcons as unknown)[iconName] || LucideIcons.CheckCircle2;
    return <IconComp className={cn(className)} />;
  };

  // Styles de section dynamiques
  const sectionStyles = {
    backgroundColor: styles?.gradient ? undefined : styles?.backgroundColor,
    backgroundImage: styles?.gradient,
    color: styles?.textColor,
    padding: styles?.padding || '80px 0',
    margin: styles?.margin,
    borderRadius: styles?.borderRadius,
    border: styles?.borderColor ? `${styles.borderWidth || '1px'} solid ${styles.borderColor}` : undefined,
    boxShadow: styles?.shadow,
    textAlign: styles?.textAlign as React.CSSProperties['textAlign'],
    maxWidth: styles?.maxWidth,
    fontSize: styles?.fontSize,
    fontWeight: styles?.fontWeight as React.CSSProperties['fontWeight']
  } as React.CSSProperties;

  // Animation de base
  const animationProps = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay: 0.1 }
  };

  const renderContent = () => {
    if (type === 'custom-html' || section.customHTML) {
      return (
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: customHTML || section.customHTML || '' }} />);


    }

    switch (type) {
      case 'hero':
        return (
          <div className="text-center space-y-8 py-12">
                        {badge &&
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border",
                `bg-blue-500/10 border-blue-500/20 text-blue-600`
              )}>
              
                                {badge}
                            </motion.span>
            }
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            {title}
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
                            {subtitle}
                        </p>
                    </div>);


      case 'text-image':
        const isReversed = layout === 'right-left';
        return (
          <div className={cn(
            "grid lg:grid-cols-2 gap-16 items-center",
            isReversed ? "lg:flex-row-reverse" : ""
          )}>
                        <div className={cn("space-y-8", isReversed ? "lg:order-2" : "")}>
                            <div className="space-y-4">
                                {badge && <span className={cn("text-xs font-black tracking-widest uppercase text-blue-600")}>{badge}</span>}
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
                                <p className="text-xl text-slate-600 font-light leading-relaxed">{subtitle}</p>
                            </div>
                            {description && <p className="text-slate-500 leading-relaxed">{description}</p>}

                            {features && features.length > 0 &&
              <ul className="grid sm:grid-cols-1 gap-4 mt-8">
                                    {features.map((f: unknown, fIdx: number) => {
                  const isObj = typeof f === 'object' && f !== null;
                  const fTitle = isObj ? f.title || f.label : f;
                  const fDesc = isObj ? f.description : null;
                  const fIcon = isObj ? f.icon : 'CheckCircle2';

                  return (
                    <li key={fIdx} className="list-none">
                                                <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: fIdx * 0.1 }}
                        className="flex items-start gap-4">
                        
                                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-blue-50 text-blue-600")}>
                                                        {renderIcon(fIcon, "w-3.5 h-3.5")}
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-800 font-bold block">{fTitle}</span>
                                                        {fDesc && <span className="text-slate-500 text-sm">{fDesc}</span>}
                                                    </div>
                                                </motion.div>
                                            </li>);

                })}
                                </ul>
              }
                        </div>
                        <div className={cn("relative", isReversed ? "lg:order-1" : "")}>
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                                <img
                  src={media?.url || (section as unknown).image || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                
                                <div className={cn("absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity")} />
                            </div>
                        </div>
                    </div>);


      case 'features-list':
        const cols = layout === 'grid-4' ? 'lg:grid-cols-4' : layout === 'grid-2' ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
        return (
          <div className="space-y-16">
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                            {badge && <span className={cn("text-xs font-black tracking-widest uppercase text-blue-600")}>{badge}</span>}
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
                            <p className="text-lg text-slate-600 font-light">{subtitle}</p>
                        </div>
                        <div className={cn("grid gap-8", cols)}>
                            {features?.map((f: unknown, fIdx: number) => {
                const isObj = typeof f === 'object' && f !== null;
                const fTitle = isObj ? f.title || f.label : f;
                const fDesc = isObj ? f.description : null;
                const fIcon = isObj ? f.icon : 'Zap';

                return (
                  <motion.div
                    key={fIdx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: fIdx * 0.1 }}
                    className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 bg-blue-50 text-blue-600")}>
                                            {renderIcon(fIcon, "w-7 h-7")}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{fTitle}</h3>
                                        <p className="text-slate-500 leading-relaxed text-sm">{fDesc || subtitle}</p>
                                    </motion.div>);

              })}
                        </div>
                    </div>);


      case 'testimonials':
        return (
          <div className="space-y-16">
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                            {badge && <span className={cn("text-xs font-black tracking-widest uppercase text-blue-600")}>{badge}</span>}
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
                            <p className="text-lg text-slate-600 font-light">{subtitle}</p>
                        </div>
                        <div className="flex overflow-x-auto pb-8 gap-6 scrollbar-hide snap-x">
                            {section.testimonials?.map((t: TestimonialItem, tIdx: number) =>
              <motion.div
                key={tIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm snap-center flex flex-col justify-between">
                
                                    <div className="space-y-6">
                                        <div className="flex gap-1 text-amber-400">
                                            {[...Array(t.rating || 5)].map((_, i) =>
                    <LucideIcons.Star key={i} className="w-4 h-4 fill-current" />
                    )}
                                        </div>
                                        <p className="text-slate-600 italic leading-relaxed text-lg">"{t.content}"</p>
                                    </div>
                                    <div className="mt-8 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                                            {t.avatar ?
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" loading="lazy" /> :

                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <LucideIcons.User className="w-6 h-6" />
                                                </div>
                    }
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 leading-tight">{t.name}</span>
                                            <span className="text-sm text-slate-500 uppercase tracking-widest font-bold text-[10px]">{t.role} {t.company && `• ${t.company}`}</span>
                                        </div>
                                    </div>
                                </motion.div>
              )}
                        </div>
                    </div>);


      case 'gallery':
        return (
          <div className="space-y-16">
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                            {badge && <span className={cn("text-xs font-black tracking-widest uppercase text-blue-600")}>{badge}</span>}
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
                            <p className="text-lg text-slate-600 font-light">{subtitle}</p>
                        </div>
                        <div className={cn(
              "grid gap-6",
              layout === 'masonry' ? "columns-1 md:columns-2 lg:columns-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            )}>
                            {media?.urls?.map((url, i) =>
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative rounded-3xl overflow-hidden shadow-lg aspect-square mb-6">
                
                                    <img src={url} alt={`Gallery item ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </motion.div>
              )}
                        </div>
                    </div>);


      case 'faq':
        return (
          <div className="grid lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-1 space-y-6">
                            {badge && <span className={cn("text-xs font-black tracking-widest uppercase text-blue-600")}>{badge}</span>}
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
                            <p className="text-xl text-slate-600 font-light">{subtitle}</p>
                            {description && <p className="text-slate-500 leading-relaxed">{description}</p>}
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            {section.faq?.map((item: FAQItem, fIdx: number) =>
              <details
                key={fIdx}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="text-lg font-bold text-slate-900">{item.question}</span>
                                        <LucideIcons.ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-4">
                                        {item.answer}
                                    </div>
                                </details>
              )}
                        </div>
                    </div>);


      case 'stats':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats?.map((stat: StatItem, sIdx: number) =>
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: sIdx * 0.1 }}
              className="text-center space-y-2">
              
                                <div className={cn("text-5xl font-black tracking-tighter text-blue-600")}>
                                    {stat.prefix}{stat.value}{stat.suffix}
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
            )}
                    </div>);


      default:
        return (
          <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 italic">
                        Type de section non reconnu : {type}
                    </div>);

    }
  };

  return (
    <section
      id={section.id}
      onClick={() => isAdmin && onEdit?.(section.id)}
      className={cn(
        "relative transition-all duration-300",
        isAdmin && "group/section hover:ring-2 hover:ring-blue-500/50 hover:ring-offset-4 rounded-xl cursor-pointer",
        isAdmin && isSelected && "ring-2 ring-blue-500 ring-offset-4 shadow-xl z-20"
      )}
      style={sectionStyles}>
      
            {isAdmin &&
      <div className="absolute -top-4 -right-4 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity z-50">
                    <button
          onClick={() => onEdit?.(section.id)}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Éditer la section">
          
                        <LucideIcons.Edit3 className="w-4 h-4" />
                    </button>
                    <div className="bg-white text-slate-400 text-[10px] px-2 py-1 rounded-md border shadow-sm font-mono self-center">
                        {section.type}
                    </div>
                </div>
      }

            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                <motion.div {...animationProps}>
                    {renderContent()}
                </motion.div>
            </div>
        </section>);

};