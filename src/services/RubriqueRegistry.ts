/**
 * 🏭 REGISTRY ET FACTORY DE RUBRIQUES
 * 
 * Gère l'enregistrement et l'instanciation des rubriques.
 * Responsable : aucune dépendance circulaire, isolement strict.
 */

import { RubriqueSchema, RubriqueRegistry, RubriqueFactory, RubriqueId } from '@/types/Rubrique';

/**
 * Registry singleton pour stocker les rubriques disponibles
 */
class RubriqueRegistryImpl implements RubriqueRegistry {
  private rubriques: Map<RubriqueId, RubriqueSchema> = new Map();

  register(rubrique: RubriqueSchema): void {
    if (this.rubriques.has(rubrique.id)) {
      console.warn(`⚠️ Rubrique ${rubrique.id} déjà enregistrée, remplacement...`);
    }
    this.rubriques.set(rubrique.id, rubrique);

  }

  get(id: RubriqueId): RubriqueSchema | null {
    return this.rubriques.get(id) || null;
  }

  getAll(): RubriqueSchema[] {
    return Array.from(this.rubriques.values());
  }

  getActive(): RubriqueSchema[] {
    return this.getAll().filter((r) => r.maturity !== 'DEPRECATED');
  }

  exists(id: RubriqueId): boolean {
    return this.rubriques.has(id);
  }
}

/**
 * Factory pour créer des instances de rubriques
 */
class RubriqueFactoryImpl implements RubriqueFactory {
  private registry: RubriqueRegistry;

  constructor(registry: RubriqueRegistry) {
    this.registry = registry;
  }

  create(id: RubriqueId): RubriqueSchema {
    const rubrique = this.registry.get(id);
    if (!rubrique) {
      throw new Error(`❌ Rubrique ${id} non trouvée dans la registry`);
    }
    return JSON.parse(JSON.stringify(rubrique)); // Clone profond
  }

  createAndInitialize(id: RubriqueId, config?: unknown): RubriqueSchema {
    const rubrique = this.create(id);

    // Appliquer la configuration si fournie
    if (config) {
      Object.assign(rubrique, config);
    }


    return rubrique;
  }

  clone(rubrique: RubriqueSchema): RubriqueSchema {
    return JSON.parse(JSON.stringify(rubrique));
  }
}

/**
 * Instance singleton globale
 */
export const rubriqueRegistry = new RubriqueRegistryImpl();
export const rubriqueFactory = new RubriqueFactoryImpl(rubriqueRegistry);

/**
 * Exporter les interfaces pour utilisation
 */
export type { RubriqueRegistry, RubriqueFactory };
export type { RubriqueSchema, RubriqueId };