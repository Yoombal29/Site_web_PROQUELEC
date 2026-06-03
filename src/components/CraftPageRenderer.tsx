/**
 * CraftPageRenderer.tsx
 * Rendu des pages Craft.js en lecture seule.
 * Séparé de DynamicPage pour permettre le lazy loading
 * et éviter d'alourdir le bundle public avec Craft.js.
 */
import React from 'react';
import { Editor, Frame } from '@craftjs/core';
import { CRAFT_RESOLVER } from '@/components/blocks/craftResolver';

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
  return (
    <CraftErrorBoundary fallback={fallback}>
      <Editor resolver={CRAFT_RESOLVER} enabled={false}>
        {/* @ts-ignore - Frame accepte les objets JSON bruts */}
        <Frame data={structureJson} />
      </Editor>
    </CraftErrorBoundary>
  );
};

export default CraftPageRenderer;
