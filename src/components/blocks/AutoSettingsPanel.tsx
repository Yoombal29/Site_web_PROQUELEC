import React from 'react';
import { useNode } from '@craftjs/core';
import {
  SettingsLabel,
  SettingsInput,
  SettingsColor,
  SettingsRow,
  SettingsTextarea,
} from './ProquelecBlocks';

const INTERNAL_KEYS = ['actions', 'connectors', 'id', 'events', 'data', 'dragged', 'selected'];

const labelize = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (s) => s.toUpperCase());

const isColorKey = (key: string) =>
  !isUrlKey(key) && /color|background|bg|accent|border|track|fill|stroke/i.test(key);

const isUrlKey = (key: string) => /url|src|href|link|file/i.test(key);

const isLongTextKey = (key: string, value: string) =>
  value.length > 80 || /html|code|content|description|text|message|bio|caption/i.test(key);

const stringifyValue = (value: any) => JSON.stringify(value ?? null, null, 2);

export const AutoSettingsPanel = () => {
  const nodeData: any = useNode((n: any) => ({ ...n.data.props }));
  const { actions: { setProp } } = nodeData;

  const propKeys = Object.keys(nodeData).filter(key => {
    if (key === 'children' || INTERNAL_KEYS.includes(key)) return false;
    return true;
  });

  if (propKeys.length === 0) {
    return <div className="text-xs text-slate-500 italic p-2">Aucun paramètre disponible.</div>;
  }

  return (
    <div className="space-y-3">
      {propKeys.map(key => {
        const label = labelize(key);
        const value = nodeData[key];

        if (Array.isArray(value)) {
          const isPrimitiveList = value.every(
            (item) => ['string', 'number', 'boolean'].includes(typeof item),
          );

          if (isPrimitiveList) {
            return (
              <SettingsRow key={key}>
                <SettingsLabel label={label} />
                <SettingsTextarea
                  rows={Math.min(8, Math.max(3, value.length + 1))}
                  value={value.join('\n')}
                  onChange={(e: any) =>
                    setProp((p: any) => {
                      p[key] = String(e.target.value)
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean);
                    })
                  }
                  placeholder="Un élément par ligne"
                />
              </SettingsRow>
            );
          }

          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label + ' (JSON)'} />
              <SettingsTextarea
                rows={10}
                value={stringifyValue(value)}
                onChange={(e: any) => {
                  try {
                    const next = JSON.parse(e.target.value || '[]');
                    if (Array.isArray(next)) {
                      setProp((p: any) => {
                        p[key] = next;
                      });
                    }
                  } catch {
                    // Keep the current value until the JSON becomes valid.
                  }
                }}
                className="font-mono text-[11px]"
              />
            </SettingsRow>
          );
        }

        if (value && typeof value === 'object') {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label + ' (JSON)'} />
              <SettingsTextarea
                rows={8}
                value={stringifyValue(value)}
                onChange={(e: any) => {
                  try {
                    const next = JSON.parse(e.target.value || '{}');
                    if (next && typeof next === 'object' && !Array.isArray(next)) {
                      setProp((p: any) => {
                        p[key] = next;
                      });
                    }
                  } catch {
                    // Keep the current value until the JSON becomes valid.
                  }
                }}
                className="font-mono text-[11px]"
              />
            </SettingsRow>
          );
        }

        if (isColorKey(key)) {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsColor value={value} onChange={(e: any) => setProp((p: any) => p[key] = e.target.value)} />
            </SettingsRow>
          );
        }

        if (isUrlKey(key)) {
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

        if (typeof value === 'string' && isLongTextKey(key, value)) {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsTextarea
                rows={Math.min(10, Math.max(3, value.split('\n').length + 1))}
                value={value ?? ''}
                onChange={(e: any) => setProp((p: any) => p[key] = e.target.value)}
              />
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
