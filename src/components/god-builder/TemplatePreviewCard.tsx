import React from 'react';
import type { SectionTemplate } from './builderTemplates';

type Props = {
  template: SectionTemplate;
  expanded: boolean;
  connectRef: (el: HTMLElement | null) => void;
  onInsert?: () => void;
};

/** Carte de modèle avec aperçu visuel (dégradé + squelette). */
export const TemplatePreviewCard: React.FC<Props> = ({ template, expanded, connectRef, onInsert }) => (
  <button
    type="button"
    ref={connectRef}
    onDoubleClick={(e) => {
      e.preventDefault();
      onInsert?.();
    }}
    className="w-full text-left overflow-hidden bg-[#0d0d1a] hover:bg-[#12121f] border border-[#252538] hover:border-amber-500/40 rounded-xl transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md hover:shadow-amber-500/5"
    title={`Glisser sur le canvas · double-clic pour insérer : ${template.label}`}
  >
    <div
      className="relative h-[72px] sm:h-[80px] overflow-hidden border-b border-[#252538]/80"
      style={{ background: template.previewGradient }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 flex flex-col justify-center px-3 gap-1.5 pointer-events-none">
        <div className="h-1.5 w-14 rounded-full bg-white/35" />
        <div className="h-2.5 w-[70%] max-w-[140px] rounded bg-white/50" />
        <div className="h-1.5 w-[45%] max-w-[100px] rounded bg-white/25" />
        <div className="flex gap-1 mt-1">
          <div className="h-2 w-10 rounded bg-white/40" />
          <div className="h-2 w-10 rounded border border-white/30" />
        </div>
      </div>
      <span className="absolute top-2 right-2 text-base drop-shadow-md select-none" aria-hidden>
        {template.emoji}
      </span>
    </div>

    <div className={`px-2.5 py-2 ${expanded ? 'pb-2.5' : 'py-2'}`}>
      <div className="text-[11px] font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">
        {template.label}
      </div>
      {expanded && (
        <p className="text-[9px] text-slate-500 mt-1 leading-snug line-clamp-2 group-hover:text-slate-400 transition-colors">
          {template.description}
        </p>
      )}
    </div>
  </button>
);
