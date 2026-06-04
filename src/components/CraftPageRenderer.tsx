/**
 * CraftPageRenderer.tsx
 * Rendu des pages Craft.js en lecture seule.
 * Séparé de DynamicPage pour permettre le lazy loading
 * et éviter d'alourdir le bundle public avec Craft.js.
 */
import React, { useRef } from 'react';
import { Editor, Frame } from '@craftjs/core';
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
  structureJson: any;
  fallback: React.ReactNode;
}

export const CraftPageRenderer: React.FC<CraftPageRendererProps> = ({
  structureJson,
  fallback,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useAnimateOnScroll(containerRef, { threshold: 0.1, once: true });

  // Normaliser la structure : convertir type: 'BlockName' en type: { resolvedName: 'BlockName' }
  const normalizeStructure = (data: any): any => {
    if (!data || typeof data !== 'object') return data;
    const normalized: any = Array.isArray(data) ? [] : {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const entry: any = { ...val };
        // Si type est une string simple, le convertir en { resolvedName }
        if (typeof entry.type === 'string' && entry.type !== 'div') {
          entry.type = { resolvedName: entry.type };
        }
        // Ajouter les champs manquants
        if (entry.type?.resolvedName && entry.isCanvas === undefined) {
          entry.isCanvas = Array.isArray(entry.nodes) && entry.nodes.length > 0;
        }
        if (entry.type?.resolvedName && !entry.displayName) {
          entry.displayName = entry.type.resolvedName;
        }
        normalized[key] = entry;
      } else {
        normalized[key] = val;
      }
    }
    return normalized;
  };

  return (
    <CraftErrorBoundary fallback={fallback}>
      <div ref={containerRef}>
        <style>{buildAnimationRuntimeCss()}</style>
        <Editor resolver={CRAFT_RESOLVER} enabled={false}>
          {/* @ts-ignore - Frame accepte les objets JSON bruts */}
          <Frame data={normalizeStructure(structureJson)} />
        </Editor>
      </div>
    </CraftErrorBoundary>
  );
};

export default CraftPageRenderer;
