/**
 * CraftPageRenderer.tsx
 * Rendu des pages Craft.js en lecture seule.
 * Séparé de DynamicPage pour permettre le lazy loading
 * et éviter d'alourdir le bundle public avec Craft.js.
 */
import React, { useRef } from 'react';
import { Editor, Frame } from '@craftjs/core';
import type { SerializedNode, SerializedNodes } from '@craftjs/core';
import { CRAFT_RESOLVER } from '@/components/blocks/craftResolver';
import { buildAnimationRuntimeCss } from '@/components/blocks/animationPresets';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';

// ErrorBoundary pour le rendu Craft.js
class CraftErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error('[CraftErrorBoundary] Erreur rendu Craft.js:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface CraftPageRendererProps {
  structureJson: string | SerializedNodes | null | undefined;
  fallback: React.ReactNode;
}

type MutableSerializedNode = Omit<SerializedNode, 'props' | 'type'> & {
  type: unknown;
  props?: Record<string, unknown>;
};

type MutableSerializedNodes = Record<string, MutableSerializedNode>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getResolvedName = (type: unknown) => {
  if (typeof type === 'string') return type;
  if (isRecord(type) && typeof type.resolvedName === 'string') return type.resolvedName;
  return null;
};

const toFiniteNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizePageShellWidth = (nodes: MutableSerializedNodes) => {
  const root = nodes.ROOT;
  if (!root || !Array.isArray(root.nodes) || root.nodes.length !== 1) return;

  const wrapperId = root.nodes[0];
  const wrapper = nodes[wrapperId];
  if (!wrapper || !isRecord(wrapper.props)) return;

  const typeName = getResolvedName(wrapper.type);
  const isPageShell =
    wrapperId === 'container_1' || typeName === 'ROOT' || wrapper.displayName === 'ROOT';
  if (!isPageShell) return;

  const horizontalPadding = toFiniteNumber(wrapper.props.padding) ?? 0;
  const verticalPadding = toFiniteNumber(wrapper.props.paddingY) ?? horizontalPadding;
  const hasLegacyWidth = wrapper.props.maxWidth === '1200px';

  if (hasLegacyWidth && horizontalPadding === 0 && verticalPadding === 0) {
    wrapper.props = {
      ...wrapper.props,
      maxWidth: '100%',
    };
  }
};

// Normaliser la structure : convertir type: 'BlockName' en type: { resolvedName: 'BlockName' }
const normalizeStructure = (
  data: CraftPageRendererProps['structureJson'],
): string | SerializedNodes | null | undefined => {
  if (!isRecord(data)) return data;

  const normalized: MutableSerializedNodes = {};
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (!isRecord(value)) continue;

    const entry: MutableSerializedNode = { ...value } as MutableSerializedNode;
    const typeName = getResolvedName(entry.type);

    // Si type est une string simple, le convertir en { resolvedName }
    if (typeof entry.type === 'string' && entry.type !== 'div') {
      entry.type = { resolvedName: entry.type };
    }

    // Ajouter les champs manquants
    if (typeName && typeName !== 'div' && entry.isCanvas === undefined) {
      entry.isCanvas = Array.isArray(entry.nodes) && entry.nodes.length > 0;
    }
    if (typeName && typeName !== 'div' && !entry.displayName) {
      entry.displayName = typeName;
    }

    normalized[key] = entry;
  }

  normalizePageShellWidth(normalized);

  return normalized as unknown as SerializedNodes;
};

export const CraftPageRenderer: React.FC<CraftPageRendererProps> = ({
  structureJson,
  fallback,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useAnimateOnScroll(containerRef, { threshold: 0.1, once: true });

  const normalizedStructure = normalizeStructure(structureJson);

  return (
    <CraftErrorBoundary fallback={fallback}>
      <div ref={containerRef} className="w-full max-w-none overflow-x-hidden">
        <style>{buildAnimationRuntimeCss()}</style>
        <Editor resolver={CRAFT_RESOLVER} enabled={false}>
          <Frame data={normalizedStructure ?? undefined} />
        </Editor>
      </div>
    </CraftErrorBoundary>
  );
};

export default CraftPageRenderer;
