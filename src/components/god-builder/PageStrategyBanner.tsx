import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, X } from 'lucide-react';
import {
  PAGE_ARCHITECTURE_LABELS,
  resolvePageArchitecture,
  getArchitectureBadgeClass,
} from '@/lib/page-architecture';

type Props = {
  slug?: string;
  title?: string;
  immutable?: boolean;
  designOptions?: { page_type?: string } | null;
  onDismiss?: () => void;
  dismissed?: boolean;
};

export const PageStrategyBanner: React.FC<Props> = ({
  slug,
  title,
  immutable,
  designOptions,
  onDismiss,
  dismissed,
}) => {
  const navigate = useNavigate();

  if (!slug || dismissed) return null;

  const arch = resolvePageArchitecture(slug, {
    slug,
    immutable,
    design_options: designOptions,
  });

  if (!arch) return null;

  const meta = PAGE_ARCHITECTURE_LABELS[arch.category];

  const borderColor: Record<string, string> = {
    content: 'border-emerald-500/30 bg-emerald-500/5',
    hybrid: 'border-blue-500/30 bg-blue-500/5',
    sections: 'border-amber-500/30 bg-amber-500/5',
    functional: 'border-slate-500/30 bg-slate-500/5',
  };

  return (
    <div
      className={`shrink-0 border-b px-4 py-2 flex items-start gap-3 text-xs ${borderColor[arch.category]}`}
    >
      <AlertCircle size={16} className="shrink-0 mt-0.5 opacity-80" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full border font-bold text-[10px] ${getArchitectureBadgeClass(arch.category)}`}
          >
            {meta.emoji} {meta.label}
          </span>
          <span className="text-slate-300 font-semibold truncate">
            {title || slug}
          </span>
          <span className="text-slate-500 font-mono">/{slug}</span>
        </div>
        <p className="text-slate-400 leading-snug">
          <strong className="text-slate-300">Éditeur :</strong> {arch.editor}
          {arch.hint ? ` — ${arch.hint}` : ''}
        </p>
        {arch.category === 'functional' && (
          <button
            type="button"
            onClick={() => navigate('/admin/builder')}
            className="mt-1 text-slate-400 hover:text-slate-200 font-bold inline-flex items-center gap-1"
          >
            <BookOpen size={11} />
            Voir le guide des types de pages
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-slate-500 hover:text-white rounded"
          aria-label="Masquer le bandeau"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
