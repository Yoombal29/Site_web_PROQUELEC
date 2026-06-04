import React, { useEffect, useMemo, useState } from 'react';
import { useNode } from '@craftjs/core';
import {
  SettingsLabel,
  SettingsInput,
  SettingsColor,
  SettingsRow,
  SettingsTextarea,
} from './ProquelecBlocks';
import { MediaPickerButton } from '@/components/admin/MediaLibrary';

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

const JsonSettingsField = ({
  propKey,
  label,
  value,
  expected,
  setProp,
}: {
  propKey: string;
  label: string;
  value: any;
  expected: 'array' | 'object';
  setProp: (cb: (props: any) => void) => void;
}) => {
  const serialized = useMemo(() => stringifyValue(value), [value]);
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(serialized);
    setError('');
  }, [propKey, serialized]);

  const applyDraft = () => {
    try {
      const parsed = JSON.parse(draft || (expected === 'array' ? '[]' : '{}'));
      const isValid =
        expected === 'array'
          ? Array.isArray(parsed)
          : parsed && typeof parsed === 'object' && !Array.isArray(parsed);

      if (!isValid) {
        setError(
          expected === 'array' ? 'Le JSON doit être un tableau.' : 'Le JSON doit être un objet.',
        );
        return;
      }

      setProp((props: any) => {
        props[propKey] = parsed;
      });
      setError('');
    } catch {
      setError('JSON invalide. Corrigez la syntaxe puis appliquez.');
    }
  };

  return (
    <SettingsRow>
      <div className="flex items-center justify-between gap-2">
        <SettingsLabel label={label + ' (JSON)'} />
        <button
          type="button"
          onClick={applyDraft}
          className="rounded border border-indigo-500/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-200 hover:bg-indigo-500/15"
        >
          Appliquer
        </button>
      </div>
      <SettingsTextarea
        rows={expected === 'array' ? 10 : 8}
        value={draft}
        onBlur={applyDraft}
        onChange={(e: any) => {
          setDraft(e.target.value);
          if (error) setError('');
        }}
        className="font-mono text-[11px]"
        spellCheck={false}
      />
      {error && <p className="text-[11px] leading-snug text-red-300">{error}</p>}
    </SettingsRow>
  );
};

export const AutoSettingsPanel = () => {
  const nodeData: any = useNode((n: any) => ({ ...n.data.props }));
  const {
    actions: { setProp },
  } = nodeData;

  const propKeys = Object.keys(nodeData).filter((key) => {
    if (key === 'children' || INTERNAL_KEYS.includes(key)) return false;
    return true;
  });

  if (propKeys.length === 0) {
    return <div className="text-xs text-slate-500 italic p-2">Aucun paramètre disponible.</div>;
  }

  return (
    <div className="space-y-3">
      {propKeys.map((key) => {
        const label = labelize(key);
        const value = nodeData[key];

        if (Array.isArray(value)) {
          const isPrimitiveList = value.every((item) =>
            ['string', 'number', 'boolean'].includes(typeof item),
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
            <JsonSettingsField
              key={key}
              propKey={key}
              label={label}
              value={value}
              expected="array"
              setProp={setProp}
            />
          );
        }

        if (value && typeof value === 'object') {
          return (
            <JsonSettingsField
              key={key}
              propKey={key}
              label={label}
              value={value}
              expected="object"
              setProp={setProp}
            />
          );
        }

        if (isColorKey(key)) {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsColor
                value={value}
                onChange={(e: any) => setProp((p: any) => (p[key] = e.target.value))}
              />
            </SettingsRow>
          );
        }

        if (isUrlKey(key)) {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <div className="flex gap-2">
                <div className="flex-1">
                  <SettingsInput
                    value={value}
                    onChange={(e: any) => setProp((p: any) => (p[key] = e.target.value))}
                    placeholder="URL"
                  />
                </div>
                <MediaPickerButton
                  onSelect={(url: string) => setProp((p: any) => (p[key] = url))}
                  label="..."
                />
              </div>
            </SettingsRow>
          );
        }

        if (typeof value === 'boolean') {
          return (
            <SettingsRow key={key}>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e: any) => setProp((p: any) => (p[key] = e.target.checked))}
                  className="rounded"
                />
                {label}
              </label>
            </SettingsRow>
          );
        }

        if (typeof value === 'number') {
          return (
            <SettingsRow key={key}>
              <SettingsLabel label={label} />
              <SettingsInput
                type="number"
                value={value}
                onChange={(e: any) =>
                  setProp((p: any) => (p[key] = parseFloat(e.target.value) || 0))
                }
              />
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
                onChange={(e: any) => setProp((p: any) => (p[key] = e.target.value))}
              />
            </SettingsRow>
          );
        }

        return (
          <SettingsRow key={key}>
            <SettingsLabel label={label} />
            <SettingsInput
              value={value ?? ''}
              onChange={(e: any) => setProp((p: any) => (p[key] = e.target.value))}
            />
          </SettingsRow>
        );
      })}
    </div>
  );
};
