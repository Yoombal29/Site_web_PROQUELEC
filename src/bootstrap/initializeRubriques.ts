/**
 * 🚀 BOOTSTRAP — Initialisation des rubriques
 * 
 * À appeler une fois au démarrage de l'application pour enregistrer toutes les rubriques disponibles.
 */

import { rubriqueRegistry } from '@/services/RubriqueRegistry';
import { RUBRIQUE_VOLTAGE_DROP } from '@/rubriques/VoltageDropRubrique';

/**
 * Initialiser toutes les rubriques
 */
export function initializeRubriques(): void {
  console.log('🚀 Initialisation des rubriques...');

  try {
    // RUBRIQUE 1 — Calcul de chute de tension (STABLE)
    rubriqueRegistry.register(RUBRIQUE_VOLTAGE_DROP);

    // RUBRIQUE 2+ — À ajouter ultérieurement
    // rubriqueRegistry.register(RUBRIQUE_UNIFILAIRE);
    // rubriqueRegistry.register(RUBRIQUE_PROTECTION);
    // ... etc

    const allRubriques = rubriqueRegistry.getAll();
    console.log(`✅ ${allRubriques.length} rubrique(s) enregistrée(s)`);
    allRubriques.forEach((r) => {
      console.log(`   - ${r.icon} ${r.name} (${r.maturity})`);
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des rubriques :', error);
    throw error;
  }
}

export default initializeRubriques;
