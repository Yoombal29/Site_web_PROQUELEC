import React from 'react';
import { useStyleEditor } from '@/components/builder/PropertyPanel/hooks/useStyleEditor';

const presets = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '1rem',
      justifyItems: 'stretch',
      alignItems: 'start'
    }
  },
  {
    key: 'card',
    label: 'Cards',
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      gridAutoRows: 'minmax(180px, auto)',
      justifyItems: 'stretch',
      alignItems: 'stretch'
    }
  },
  {
    key: 'feature',
    label: 'Masonry',
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
      gap: '1rem',
      gridAutoRows: 'minmax(140px, auto)',
      justifyItems: 'stretch',
      alignItems: 'stretch'
    }
  },
  {
    key: 'stack',
    label: 'Stack mobile',
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      justifyItems: 'stretch',
      alignItems: 'stretch'
    }
  }
];

export const GridLayoutPreviewControl: React.FC = () => {
  const { updateStyle } = useStyleEditor();

  const applyPreset = (style: Record<string, unknown>) => {
    updateStyle(style as any);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
            onClick={() => applyPreset(preset.style)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50">
        <div className="h-16 rounded-lg bg-white border border-slate-200 shadow-sm" />
        <div className="h-16 rounded-lg bg-white border border-slate-200 shadow-sm" />
        <div className="h-16 rounded-lg bg-white border border-slate-200 shadow-sm" />
        <div className="h-16 rounded-lg bg-white border border-slate-200 shadow-sm" />
      </div>
      <p className="text-xs text-slate-500">Sélectionnez un preset pour appliquer une mise en page courante. Les styles s’appliquent au bloc sélectionné.</p>
    </div>
  );
};

export default GridLayoutPreviewControl;
