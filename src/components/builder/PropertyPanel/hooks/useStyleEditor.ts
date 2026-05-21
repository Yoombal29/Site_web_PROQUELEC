import { useCallback, useMemo } from 'react';
import type { BlockStyle } from '@/types/builder';
import {
  useSelectedBlock,
  useUpdateBlockStyle
} from '@/stores/useBuilderStoreSelectors';

type Device = 'base' | 'tablet' | 'mobile';

export interface RuntimeStyle {
  base: BlockStyle;
  tablet: BlockStyle;
  mobile: BlockStyle;
}

const COMMON_STYLE_KEYS: (keyof BlockStyle)[] = [
  'width','height','padding','paddingTop','paddingBottom','paddingLeft','paddingRight',
  'margin','marginTop','marginBottom','marginLeft','marginRight',
  'backgroundColor','backgroundImage','backgroundSize','backgroundPosition',
  'borderRadius','borderWidth','borderColor','color','fontSize','textAlign',
  'display','justifyContent','alignItems','flexDirection','gap','maxWidth','minHeight',
  'boxShadow','opacity','textTransform','fontWeight','fontFamily','lineHeight','letterSpacing','className','customCss','transition'
];

const sanitizeClassName = (input?: string) => {
  if (!input) return '';
  const tokens = input.split(/\s+/).filter(Boolean);
  const safe = tokens.filter((t) => {
    // Reject characters that are obviously unsafe
    if (/[<>;`{}]/.test(t)) return false;
    // Allow common Tailwind tokens (letters, numbers, '-', ':', '/', '_', '[', ']', '(', ')', '%', '#', ',')
    return /^[A-Za-z0-9\-:\[\]\/_%#(),@!]+$/.test(t);
  });
  return Array.from(new Set(safe)).join(' ');
};

const toggleClassName = (current: string | undefined, className: string, enabled?: boolean) => {
  const safeName = sanitizeClassName(className);
  if (!safeName) return current || '';
  const set = new Set((current || '').split(/\s+/).filter(Boolean));
  const shouldEnable = typeof enabled === 'boolean' ? enabled : !set.has(safeName);
  if (shouldEnable) set.add(safeName); else set.delete(safeName);
  return Array.from(set).join(' ');
};

const normalizeToRuntimeStyle = (raw?: BlockStyle): RuntimeStyle => {
  if (!raw) return { base: {}, tablet: {}, mobile: {} };
  const anyRaw = raw as any;
  // Already using runtime shape?
  if (anyRaw && (anyRaw.base || anyRaw.tablet || anyRaw.mobile)) {
    return {
      base: anyRaw.base ?? {},
      tablet: anyRaw.tablet ?? {},
      mobile: anyRaw.mobile ?? {}
    };
  }
  // Legacy flat shape -> place everything into base
  const copy: BlockStyle = { ...raw };
  return { base: copy, tablet: {}, mobile: {} };
};

export const useStyleEditor = () => {
  const selected = useSelectedBlock();
  const updateBlockStyle = useUpdateBlockStyle();

  const id = selected?.id;

  const runtimeStyle = useMemo(() => normalizeToRuntimeStyle(selected?.style), [selected?.style]);

  const updateStyle = useCallback((patch: Partial<BlockStyle>, device: Device = 'base') => {
    if (!id) return;
    const raw = selected?.style as any;
    const hasNested = raw && (raw.base || raw.tablet || raw.mobile);

    const current = runtimeStyle[device] ?? {};
    const merged = { ...current, ...patch } as BlockStyle;

    // Sanitize className if present
    if (merged.className) merged.className = sanitizeClassName(String(merged.className));

    const payload: any = { [device]: merged };

    // If legacy flat shape, migrate top-level keys into `base` and remove originals
    if (!hasNested && device === 'base' && selected?.style) {
      Object.keys(selected.style).forEach((k) => {
        if (k !== 'base' && k !== 'tablet' && k !== 'mobile') payload[k] = undefined;
      });
    }

    updateBlockStyle(id, payload as any);
  }, [id, updateBlockStyle, runtimeStyle, selected?.style]);

  const removeStyle = useCallback((key: keyof BlockStyle, device: Device = 'base') => {
    if (!id) return;
    const raw = selected?.style as any;
    const hasNested = raw && (raw.base || raw.tablet || raw.mobile);

    if (!hasNested && device === 'base') {
      // legacy: remove top-level key
      updateBlockStyle(id, { [key]: undefined } as any);
      return;
    }

    const newDevice = { ...runtimeStyle[device] } as any;
    // Setting to undefined ensures merge will clear the value
    newDevice[key] = undefined;
    const payload: any = { [device]: newDevice };
    updateBlockStyle(id, payload);
  }, [id, updateBlockStyle, runtimeStyle, selected?.style]);

  const resetStyle = useCallback(() => {
    if (!id) return;
    const raw = selected?.style as any;
    const hasNested = raw && (raw.base || raw.tablet || raw.mobile);

    const payload: any = { base: {}, tablet: {}, mobile: {} };
    if (!hasNested && selected?.style) {
      Object.keys(selected.style).forEach((k) => {
        if (k !== 'base' && k !== 'tablet' && k !== 'mobile') payload[k] = undefined;
      });
    }
    updateBlockStyle(id, payload);
  }, [id, updateBlockStyle, selected?.style]);

  const toggleClass = useCallback((className: string, enabled?: boolean, device: Device = 'base') => {
    if (!id) return;
    const current = runtimeStyle[device]?.className || '';
    const next = toggleClassName(current as string, className, enabled);
    updateStyle({ className: next }, device);
  }, [id, runtimeStyle, updateStyle]);

  return {
    style: runtimeStyle,
    updateStyle,
    removeStyle,
    resetStyle,
    toggleClass
  } as const;
};

export default useStyleEditor;
