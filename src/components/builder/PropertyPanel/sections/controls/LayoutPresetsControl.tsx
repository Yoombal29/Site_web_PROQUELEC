import React from 'react';
import { useStyleEditor } from '@/components/builder/PropertyPanel/hooks/useStyleEditor';

export const LayoutPresetsControl: React.FC = () => {
  const { updateStyle } = useStyleEditor();

  const applyGrid = (cols: string) => {
    updateStyle({ display: 'grid', gridTemplateColumns: cols } as any);
  };

  const applyFlexCenter = () => {
    updateStyle({ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '960px' } as any);
  };

  return (
    <div className="space-x-2">
      <button type="button" className="btn" onClick={() => applyGrid('repeat(2, 1fr)')}>2 colonnes</button>
      <button type="button" className="btn" onClick={() => applyGrid('repeat(3, 1fr)')}>3 colonnes</button>
      <button type="button" className="btn" onClick={() => applyGrid('repeat(auto-fit, minmax(200px, 1fr))')}>Auto-fit</button>
      <button type="button" className="btn" onClick={applyFlexCenter}>Centre (flex)</button>
    </div>
  );
};

export default LayoutPresetsControl;
