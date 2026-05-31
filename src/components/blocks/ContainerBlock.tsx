import React from 'react';
import { useNode } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import { useDisplayConditions } from './useDisplayConditions';

interface ContainerProps {
  padding?: number;
  paddingY?: number;
  backgroundColor?: string;
  maxWidth?: string;
  children?: React.ReactNode;
}

export const ContainerBlock = (props: ContainerProps & any) => {
  const { padding = 20, paddingY, backgroundColor = '#ffffff', maxWidth = '100%', children } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  const visible = useDisplayConditions(props);
  if (!visible) return null;

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{
        padding: `${paddingY ?? padding}px ${padding}px`,
        backgroundColor,
        maxWidth,
        margin: '0 auto',
        minHeight: '40px',
        border: '1px dashed #3a3a5a',
        ...universal.style,
      }}
      className={`w-full relative min-h-[40px] proquelec-builder-node ${universal.className}`}
    >
      {children}
    </div>
  );
};

const ContainerSettings = () => {
  const { actions: { setProp }, padding, paddingY, backgroundColor, maxWidth } = useNode((n: any) => ({ ...n.data.props }));

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Couleur de fond</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={backgroundColor || '#ffffff'}
            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
            className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
          />
          <input
            type="text"
            value={backgroundColor || '#ffffff'}
            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
            className="flex-1 bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Padding H (px)</label>
        <input
          type="number" value={padding || 0}
          onChange={(e) => setProp((props: any) => props.padding = parseInt(e.target.value, 10))}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Padding V (px)</label>
        <input
          type="number" value={paddingY ?? ''}
          onChange={(e) => setProp((props: any) => props.paddingY = parseInt(e.target.value, 10))}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Largeur max</label>
        <select
          value={maxWidth || '100%'}
          onChange={(e) => setProp((props: any) => props.maxWidth = e.target.value)}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="100%">Pleine largeur</option>
          <option value="1280px">1280px (XL)</option>
          <option value="1024px">1024px (LG)</option>
          <option value="768px">768px (MD)</option>
        </select>
      </div>
    </div>
  );
};

ContainerBlock.craft = {
  displayName: 'Conteneur',
  props: {
    padding: 20,
    backgroundColor: '#ffffff',
    maxWidth: '100%',
  },
  related: {
    settings: ContainerSettings,
  },
};
