
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Activity,
  Shield,
  Zap,
  Star,
  Search,
  Layout,
  MessageSquare,
  PlayCircle } from
'lucide-react';
import { Badge } from '@/components/ui/badge';

// --- ICON MAPPING ---
const IconMap: Record<string, unknown> = {
  shield: Shield,
  zap: Zap,
  star: Star,
  search: Search,
  activity: Activity,
  layout: Layout,
  message: MessageSquare,
  play: PlayCircle
};

// --- HEADING BLOCK ---
export const HeadingBlock = ({ text, level = 'h2', align = 'left' }: unknown) => {
  const Tag = level as keyof JSX.IntrinsicElements;
  const alignmentClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const sizeClasses = {
    h1: 'text-4xl md:text-6xl font-black mb-8 tracking-tighter',
    h2: 'text-3xl md:text-4xl font-bold mb-6 tracking-tight',
    h3: 'text-2xl md:text-3xl font-bold mb-4',
    h4: 'text-xl md:text-2xl font-semibold mb-3'
  }[level as string] || 'text-2xl font-bold mb-4';

  return (
    <div className={cn("w-full px-4 max-w-7xl mx-auto", alignmentClass)}>
            <Tag className={cn(sizeClasses, "text-slate-900")}>{text}</Tag>
        </div>);

};

// --- TEXT BLOCK ---
export const TextBlock = ({ content }: unknown) => {
  return (
    <div className="w-full px-4 max-w-4xl mx-auto my-8 prose prose-lg prose-slate"
    dangerouslySetInnerHTML={{ __html: content }} />);

};

// --- DIVIDER BLOCK ---
export const DividerBlock = ({ style = 'solid', color = '#e5e7eb', height = 1 }: unknown) => {
  return (
    <div className="w-full px-4 max-w-7xl mx-auto my-8">
            <hr
        className="w-full border-t-[var(--border-height)] border-[var(--border-style)] border-[var(--border-color)]"
        style={{
          '--border-height': `${height}px`,
          '--border-style': style,
          '--border-color': color
        } as React.CSSProperties} />
      
        </div>);

};

// --- SPACER BLOCK ---
export const SpacerBlock = ({ height = 40 }: unknown) => {
  // We use a CSS variable for the height to avoid inline 'style={{ height }}' which can trigger lints
  return <div
    className="w-full h-[var(--spacer-height)]"
    style={{ '--spacer-height': `${height}px` } as React.CSSProperties} />;

};

// --- BUTTON BLOCK ---
export const ButtonBlock = ({ label, url, style = 'primary' }: unknown) => {
  return (
    <div className="w-full px-4 max-w-7xl mx-auto my-6 flex justify-center">
            <a
        href={url}
        className={cn(
          "px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg",
          style === 'primary' ? "bg-proqblue text-white hover:bg-proqblue-dark" : "bg-white text-proqblue border-2 border-proqblue hover:bg-slate-50"
        )}>
        
                {label}
            </a>
        </div>);

};

// --- ACCORDION BLOCK ---
export const AccordionBlock = ({ items = [] }: unknown) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <div className="w-full px-4 max-w-4xl mx-auto my-12 space-y-4">
            {items.map((item: unknown, index: number) =>
      <div key={index} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
          onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors" aria-label="Action">
          
                        <span>{item.title}</span>
                        <ChevronDown className={cn("w-5 h-5 text-proqblue transition-transform", activeIndex === index && "rotate-180")} />
                    </button>
                    {activeIndex === index &&
        <div className="p-5 border-t bg-slate-50/50 text-slate-600 animate-in fade-in slide-in-from-top-2">
                            {item.content}
                        </div>
        }
                </div>
      )}
        </div>);

};

// --- CTA BLOCK ---
export const CTABlock = ({ title, buttonLabel, url }: unknown) => {
  return (
    <div className="w-full py-20 px-4">
            <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-proqblue to-indigo-900 p-12 text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-proqblue-light/20 rounded-full blur-3xl -ml-32 -mb-32" />

                <h2 className="text-3xl md:text-5xl font-black mb-8 relative z-10 tracking-tight">{title}</h2>
                <a
          href={url}
          className="inline-flex items-center gap-2 px-10 py-5 bg-white text-proqblue font-black rounded-full hover:shadow-xl hover:shadow-white/20 transition-all hover:scale-105 relative z-10">
          
                    {buttonLabel}
                    <Check className="w-5 h-5" />
                </a>
            </div>
        </div>);

};

// --- IMAGE BLOCK ---
export const ImageBlock = ({ url, alt, caption }: unknown) => {
  return (
    <div className="w-full px-4 max-w-5xl mx-auto my-12 text-center">
            <img src={url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'} alt={alt} className="w-full rounded-2xl shadow-xl mb-4" loading="lazy" />
            {caption && <p className="text-sm text-slate-400 italic">{caption}</p>}
        </div>);

};

// --- QUOTE BLOCK ---
export const QuoteBlock = ({ text, author }: unknown) => {
  return (
    <div className="w-full px-4 max-w-4xl mx-auto my-12">
            <blockquote className="relative p-8 bg-slate-50 rounded-2xl border-l-8 border-proqblue font-serif">
                <p className="text-xl md:text-2xl font-medium text-slate-700 italic mb-4">"{text}"</p>
                {author && <cite className="text-slate-500 font-bold not-italic font-sans">— {author}</cite>}
            </blockquote>
        </div>);

};

// --- STATS BLOCK ---
export const StatsBlock = ({ items = [] }: unknown) => {
  return (
    <div className="w-full px-4 max-w-7xl mx-auto my-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {items.map((item: unknown, index: number) =>
        <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                        <div className="text-3xl md:text-5xl font-black text-proqblue mb-2">{item.value}</div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{item.label}</div>
                    </div>
        )}
            </div>
        </div>);

};

// --- FEATURE BLOCK (Icon + Title + Description) ---
export const FeatureBlock = ({ icon: IconName, title, description }: unknown) => {
  const IconComponent = IconName && IconMap[IconName.toLowerCase()] || Layout;

  return (
    <div className="w-full px-4 max-w-7xl mx-auto my-8">
            <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-proqblue/10 group">
                <div className="w-16 h-16 bg-proqblue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-proqblue" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{description}</p>
            </div>
        </div>);

};

// --- PRICING BLOCK ---
export const PricingBlock = ({ title, price, period, features = [], isPopular }: unknown) => {
  return (
    <div className={cn(
      "relative p-8 rounded-3xl border-2 transition-all flex flex-col h-full",
      isPopular ? "border-proqblue bg-proqblue/5 shadow-xl scale-105 z-10" : "border-slate-100 bg-white hover:border-slate-200"
    )}>
            {isPopular && <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-proqblue text-white px-4 py-1">RECOMMANDÉ</Badge>}
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">{price}</span>
                <span className="text-slate-500">/{period}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((f: string, i: number) =>
        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {f}
                    </li>
        )}
            </ul>
            <ButtonBlock label="Choisir ce plan" url="#" style={isPopular ? 'primary' : 'secondary'} aria-label="Action" />
        </div>);

};

// --- TESTIMONIALS LIST BLOCK ---
export const TestimonialsListBlock = ({ testimonials = [] }: unknown) => {
  return (
    <div className="w-full px-4 max-w-7xl mx-auto my-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t: unknown, i: number) =>
        <div key={i} className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                <img src={t.avatar || `https://i.pravatar.cc/150?u=${i}`} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">{t.name}</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t.role}</div>
                            </div>
                        </div>
                        <p className="text-slate-600 italic">"{t.content}"</p>
                    </div>
        )}
            </div>
        </div>);

};

// --- HERO BLOCK ---
export const HeroBlock = ({ title, subtitle, background_url, cta_text, cta_link }: unknown) => {
  const defaultBg = 'https://images.unsplash.com/photo-1558449028-s549c1d27c63?auto=format&fit=crop&q=80';
  return (
    <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden">
            <div
        className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-[10s] bg-[image:var(--hero-bg)]"
        style={{ '--hero-bg': `url(${background_url || defaultBg})` } as React.CSSProperties} />
      
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
            <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.1] animate-in slide-in-from-bottom-8 duration-700">{title}</h1>
                <p className="text-xl md:text-2xl font-light text-slate-200 mb-10 opacity-90 animate-in slide-in-from-bottom-8 duration-700 delay-100">{subtitle}</p>
                {cta_text &&
        <a href={cta_link} className="inline-flex items-center gap-2 px-10 py-5 bg-proqblue hover:bg-proqblue-dark text-white font-black rounded-full transition-all hover:scale-105 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 delay-200 uppercase tracking-widest text-sm">
                        {cta_text}
                        <ChevronRight className="w-5 h-5" />
                    </a>
        }
            </div>
        </div>);

};

// --- VIDEO BLOCK ---
export const VideoBlock = ({ url, type = 'youtube' }: unknown) => {
  const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');

  return (
    <div className="w-full px-4 max-w-5xl mx-auto my-16">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white translate-z-0">
                {isYouTube ?
        <iframe title="Lecteur Vidéo PROQUELEC" className="w-full h-full" src={`https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`} allowFullScreen /> :

        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 italic">
                        Visualisateur vidéo {type} à venir
                    </div>
        }
            </div>
        </div>);

};

// --- TABS BLOCK ---
export const TabsBlock = ({ items = [] }: unknown) => {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className="w-full px-4 max-w-5xl mx-auto my-16">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {items.map((item: unknown, i: number) =>
        <button
          key={i}
          onClick={() => setActiveTab(i)}
          className={cn(
            "px-6 py-3 rounded-xl font-bold transition-all",
            activeTab === i ? "bg-proqblue text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-50 border"
          )} aria-label="Action">
          
                        {item.title}
                    </button>
        )}
            </div>
            <div className="bg-white p-10 rounded-3xl border shadow-sm animate-in fade-in duration-500 overflow-hidden relative">
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: items[activeTab]?.content }} />
            </div>
        </div>);

};