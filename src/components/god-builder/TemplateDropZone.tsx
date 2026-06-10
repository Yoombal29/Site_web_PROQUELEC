import React, { useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cloneNodeTreeWithNewIds } from './cloneNodeTree';
import type { SectionTemplate } from './builderTemplates';
import { toast } from 'sonner';

interface TemplateDropZoneProps {
  templateLabel?: string;
  templateJson?: string;
  children?: React.ReactNode;
}

/**
 * Zone de dépôt pour les templates du God Builder.
 * Quand ce bloc est créé (via drag & drop ou double-clic),
 * il parse le template stocké dans templateJson et l'insère automatiquement,
 * puis se détruit.
 */
export const TemplateDropZone: React.FC<TemplateDropZoneProps> & { craft?: unknown } = ({
  templateLabel,
  templateJson,
  children,
}) => {
  const { actions, query } = useEditor();

  useEffect(() => {
    if (!templateJson) return;
    try {
      const templateData = JSON.parse(templateJson);
      const element = templateData.factory();
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
  }, [templateJson, actions, query]);

  return <>{children || null}</>;
};

TemplateDropZone.craft = {
  displayName: 'Template Drop Zone',
  props: {
    templateLabel: '',
    templateJson: '',
  },
};
