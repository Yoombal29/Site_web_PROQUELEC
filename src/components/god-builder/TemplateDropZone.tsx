import React, { useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { cloneNodeTreeWithNewIds } from './cloneNodeTree';
import { getTemplateFactory } from './builderTemplates';
import { toast } from 'sonner';

interface TemplateDropZoneProps {
  templateLabel?: string;
  children?: React.ReactNode;
}

/**
 * Zone de dépôt pour les templates du God Builder.
 * Quand ce bloc est créé (via drag & drop ou double-clic),
 * il cherche la factory dans le registre central via templateLabel,
 * l'exécute pour obtenir le ReactElement, parse l'arbre Craft.js
 * et insère les nœuds dans le canvas, puis se détruit.
 */
export const TemplateDropZone: React.FC<TemplateDropZoneProps> & { craft?: unknown } = ({
  templateLabel,
  children,
}) => {
  const { actions, query } = useEditor();

  useEffect(() => {
    if (!templateLabel) return;
    const factory = getTemplateFactory(templateLabel);
    if (!factory) {
      console.warn(`[TemplateDropZone] Aucune factory trouvée pour "${templateLabel}"`);
      toast.error(`Modèle "${templateLabel}" introuvable`);
      return;
    }
    try {
      const element = factory();
      if (!element?.type) throw new Error('Composant template invalide');
      const tree = query.parseReactElement(element).toNodeTree();
      actions.addNodeTree(cloneNodeTreeWithNewIds(tree, 'tpl'), 'ROOT');
    } catch (err) {
      console.error('[TemplateDropZone] Insertion error:', err);
      toast.error(
        err instanceof Error && err.message.includes('resolver')
          ? 'Modèle incompatible : rechargez la page ou choisissez un autre modèle.'
          : "Impossible d'insérer le modèle",
      );
    }
  }, [templateLabel, actions, query]);

  return <>{children || null}</>;
};

TemplateDropZone.craft = {
  displayName: 'Template Drop Zone',
  props: {
    templateLabel: '',
  },
};
