
import React, { useState } from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { LatestNews } from '@/components/LatestNews';

const FormBlock: React.FC<{ settings?: { title?: string; email?: string } }> = ({ settings }) => {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  if (submitted) {
    return (
      <div className="p-12 bg-emerald-50 text-center">
        <p className="text-emerald-700 font-semibold text-lg">✅ Message envoyé !</p>
        <p className="text-emerald-600 text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white border border-slate-200 rounded-xl max-w-lg mx-auto space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{settings?.title || 'Contactez-nous'}</h3>
      <input required placeholder="Votre nom" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      <input required type="email" placeholder="Votre email" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      <textarea required rows={4} placeholder="Votre message" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">Envoyer</button>
    </form>
  );
};

const BentoGridBlock: React.FC<{ settings?: { title?: string } }> = ({ settings }) => (
  <div className="p-8 bg-slate-50">
    {settings?.title && <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{settings.title}</h2>}
    <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto">
      <div className="col-span-2 row-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 flex flex-col justify-end text-white min-h-[240px]">
        <p className="text-3xl font-black">Créativité</p>
        <p className="text-sm text-white/80 mt-1">Des designs uniques pour votre marque</p>
      </div>
      <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-200 min-h-[110px] flex flex-col justify-center">
        <p className="text-lg font-bold text-slate-900">Performance</p>
        <p className="text-sm text-slate-500">Optimisé pour la vitesse</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 min-h-[110px] flex flex-col justify-center">
        <p className="text-lg font-bold text-slate-900">Responsive</p>
        <p className="text-sm text-slate-500">S'adapte à tous les écrans</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 min-h-[110px] flex flex-col justify-center">
        <p className="text-lg font-bold text-slate-900">Accessible</p>
        <p className="text-sm text-slate-500">Conforme WCAG</p>
      </div>
      <div className="col-span-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 flex flex-col justify-end text-white min-h-[110px]">
        <p className="text-xl font-bold">Innovation</p>
        <p className="text-sm text-white/80">Technologies de pointe</p>
      </div>
    </div>
  </div>
);

const GalleryBlock: React.FC<{ settings?: { title?: string } }> = ({ settings }) => {
  const images = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    'https://images.unsplash.com/photo-1559570272-8c3b5b0b6f8b?w=400&q=80',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
  ];
  return (
    <div className="p-8 bg-white">
      {settings?.title && <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{settings.title}</h2>}
      <div className="grid grid-cols-3 gap-3 max-w-5xl mx-auto">
        {images.map((src, i) => (
          <div key={i} className={`overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
            <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover min-h-[180px] hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};

const ComponentRegistry: Record<string, React.FC<unknown>> = {
  'HeroBanner': HeroBanner,
  'LatestNews': LatestNews,
  'StatsSection': () => <div className="p-20 bg-slate-100 text-center font-bold">SECTION STATISTIQUES (GÉNÉRÉE)</div>,
  'ServicesGrid': () => <div className="p-20 bg-white text-center font-bold">GRILLE DE SERVICES (GÉNÉRÉE)</div>,
  'NewSection': (props: unknown) =>
  <div
  // eslint-disable-next-line react/forbid-dom-props
  style={props.styles}
  className="border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[200px] text-slate-400 font-mono text-sm">
    
            {props.settings?.title || 'Conteneur Vide'}
        </div>,

  'Form': FormBlock,
  'Bento': BentoGridBlock,
  'Gallery': GalleryBlock,
};

interface DynamicPageRendererProps {
  layout: unknown[];
}

export const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ layout }) => {
  return (
    <div className="dynamic-root">
            {layout.map((comp) => {
        const Component = ComponentRegistry[comp.type];
        if (!Component) {
          return (
            <div key={comp.id} className="p-4 bg-red-50 text-red-500 border border-red-200 rounded m-2">
                            Composant inconnu : {comp.type}
                        </div>);

        }
        return (
          <div key={comp.id} id={comp.id} className="relative group">
                        <Component {...comp.settings} styles={comp.styles} />
                    </div>);

      })}
        </div>);

};