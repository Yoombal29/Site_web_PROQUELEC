/**
 * SchemaBuilderIntegration.tsx
 * ═════════════════════════════════════════════════════════════════
 * 
 * 🔗 Hook pour intégrer le mode schéma avec panneaux dynamiques synchronisés
 * 
 * Fournit les fonctions de synchronisation et conversion:
 * • Schema → Panneaux dynamiques
 * • Panneaux → Modèle de calcul
 * • Gestion du mode schéma uniquement
 * • Trigger de recalcul synchronisé
 * 
 * @version 1.0
 * @status PRODUCTION READY
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { VoltageDropModel, VoltageDropResult } from '../types/VoltageDropModel';
import { DynamicPanelsGenerator, DynamicPanelsStructure } from '../generators/DynamicPanelsGenerator';
import { VoltageDropEngine } from '../engines/VoltageDropEngine';
import { NormativeHash } from '../utils/NormativeHash';
import { GraphStore } from '../stores/GraphStore';
import { EditorManager } from '../managers/EditorManager';

/**
 * Hook pour gérer la synchronisation schéma ↔ panneaux dynamiques
 */
export function useSchemaBuilder(
  graphStore: GraphStore | null,
  editorManager: EditorManager | null
) {
  const [dynamicPanels, setDynamicPanels] = useState<DynamicPanelsStructure | null>(null);
  const [calculationResult, setCalculationResult] = useState<VoltageDropResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculationHash, setLastCalculationHash] = useState<string>('');

  /**
   * 🔄 Génération des panneaux depuis le schéma
   */
  const regeneratePanels = useCallback(() => {
    if (!graphStore) return;

    try {
      const nodes = Array.from(graphStore.nodes.values());
      const edges = Array.from(graphStore.edges.values());

      const structure = DynamicPanelsGenerator.generate(
        nodes,
        edges,
        'three' // régime par défaut
      );

      setDynamicPanels(structure);
    } catch (error) {
      console.error('[SchemaBuilderIntegration] Error regenerating panels:', error);
    }
  }, [graphStore]);

  /**
   * 🎯 Callback appelé par DynamicPanels quand les valeurs changent
   */
  const handlePanelValuesChange = useCallback(
    (updatedPanels: DynamicPanelsStructure) => {
      setDynamicPanels(updatedPanels);
    },
    []
  );

  /**
   * 📊 Convertir les panneaux dynamiques en VoltageDropModel
   */
  const buildCalculationModel = useCallback(
    (): VoltageDropModel | null => {
      try {
        if (!dynamicPanels) {
          console.warn('[SchemaBuilderIntegration] No panels available for SCHEMA mode');
          return null;
        }
        return DynamicPanelsGenerator.toVoltageDropModel(dynamicPanels);
      } catch (error) {
        console.error('[SchemaBuilderIntegration] Error building calculation model:', error);
        return null;
      }
    },
    [dynamicPanels]
  );

  /**
   * ✅ Effectuer le calcul
   */
  const performCalculation = useCallback(
    async (formData?: any) => {
      const model = buildCalculationModel(formData);
      if (!model) return;

      // Vérifier si ce modèle a déjà été calculé
      const currentHash = NormativeHash.compute(model);
      if (currentHash === lastCalculationHash) {
        return; // Éviter les recalculs inutiles
      }

      setIsCalculating(true);
      const startTime = performance.now();

      try {
        const result = await VoltageDropEngine.calculateModel(model);
        const duration = Math.round(performance.now() - startTime);

        setCalculationResult(result);
        setLastCalculationHash(currentHash);
      } catch (error) {
        console.error('[SchemaBuilderIntegration] Calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    },
    [buildCalculationModel, lastCalculationHash]
  );

  /**
   * � Synchroniser: quand le schéma change, regénérer les panneaux
   */
  useEffect(() => {
    if (graphStore) {
      // Délai pour éviter les regénérations excessives
      const timer = setTimeout(() => {
        regeneratePanels();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [graphStore, regeneratePanels]);

  return {
    // État
    dynamicPanels,
    calculationResult,
    isCalculating,

    // Actions
    regeneratePanels,
    handlePanelValuesChange,
    performCalculation,
    buildCalculationModel
  };
}

/**
 * Helper pour convertir résultats → données pour affichage
 */
export function formatCalculationResults(result: VoltageDropResult | null) {
  if (!result) return null;

  // Récupérer les max values en itérant sur les feeders
  let maxVoltageDropPercent = 0;
  let maxThermalPower = 0;
  
  result.feederResults.forEach((feederResult) => {
    maxVoltageDropPercent = Math.max(maxVoltageDropPercent, feederResult.deltaU_percent);
    maxThermalPower = Math.max(maxThermalPower, feederResult.maxPower_watts);
  });

  return {
    globalVerdict: result.globalVerdict,
    conformityPercent: result.conformityPercent,
    issues: result.issues,
    normativeHash: result.normativeHash,
    maxVoltageDropPercent,
    maxThermalPower,
    feedersCount: result.feederResults.size
  };
}
