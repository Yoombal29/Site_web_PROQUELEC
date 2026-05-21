
import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { LatestNews } from '@/components/LatestNews';

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

  'Form': () => <div className="p-20 bg-slate-50 text-center font-bold border border-slate-200">FORMULAIRE DE CONTACT (PLACEHOLDER)</div>,
  'Bento': () => <div className="p-20 bg-slate-100 text-center font-bold border border-slate-200">GRID BENTO (PLACEHOLDER)</div>,
  'Gallery': () => <div className="p-20 bg-slate-50 text-center font-bold border border-slate-200">GALERIE IMAGES (PLACEHOLDER)</div>
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