import React from 'react';
import { useNode } from '@craftjs/core';
import { SettingsLabel, SettingsInput, SettingsColor, SettingsRow } from './ProquelecBlocks';

const INTERNAL_KEYS = ['actions', 'connectors', 'id', 'events', 'data', 'dragged', 'selected'];

export const AutoSettingsPanel = () => {
  const nodeData: any = useNode((n: any) => ({ ...n.data.props }));
  const { actions: { setProp } } = nodeData;

  const propKeys = Object.keys(nodeData).filter(key => {
    if (key === 'children' || INTERNAL_KEYS.includes(key)) return false;
    const val = nodeData[key];
    if (Array.isArray(val) || val === null || val === undefined) return false;
    return true;
  });

  if (propKeys.length === 0) {
    return <div className="text-xs text-slate-500 italic p-2">Aucun paramètre disponible.</div>;
  }

  return (
    <div className="space-y-3">
      {propKeys.map(key => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const value = nodeData[key];

        if (key.toLowerCase().includes('color')) {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsColor value={value} onChange={(e: any) => setProp((p: any) => p[key] = e.target.value)} />
            </SettingsRow>
          );
        }

        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('src') || key.toLowerCase().includes('link')) {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsInput value={value} onChange={(e: any) => setProp((p: any) => p[key] = e.target.value)} placeholder="URL" />
            </SettingsRow>
          );
        }

        if (typeof value === 'boolean') {
          return (
            <SettingsRow key={key}>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" checked={value} onChange={(e: any) => setProp((p: any) => p[key] = e.target.checked)} className="rounded" />
                {label}
              </label>
            </SettingsRow>
          );
        }

        if (typeof value === 'number') {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsInput type="number" value={value} onChange={(e: any) => setProp((p: any) => p[key] = parseFloat(e.target.value) || 0)} />
            </SettingsRow>
          );
        }

        return (
          <SettingsRow key={key}>
            <SettingsLabel label={label} />
            <SettingsInput value={value ?? ''} onChange={(e: any) => setProp((p: any) => p[key] = e.target.value)} />
          </SettingsRow>
        );
      })}
    </div>
  );
};
