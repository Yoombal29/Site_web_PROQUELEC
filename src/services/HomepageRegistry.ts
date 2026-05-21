/**
 * 🏭 HOMEPAGE REGISTRY
 * 
 * Le registre central qui gouverne la composition de la page d'accueil.
 * C'est le "Cerveau" de la Home.
 */



class HomepageRegistryImpl {
  private modules: Map<HomepageModuleId, HomepageModuleSchema> = new Map();

  /**
   * Enregistre un module dans le système
   */
  register(module: HomepageModuleSchema): void {
    if (this.modules.has(module.id)) {
      console.warn(`⚠️ Module Homepage ${module.id} remplacé.`);
    }
    this.modules.set(module.id, module);

  }

  /**
   * Récupère un module par son ID
   */
  get(id: HomepageModuleId): HomepageModuleSchema | undefined {
    return this.modules.get(id);
  }

  /**
   * Retourne tous les modules triés par priorité
   */
  getAllSorted(): HomepageModuleSchema[] {
    return Array.from(this.modules.values()).
    sort((a, b) => a.defaultPriority - b.defaultPriority);
  }

  /**
   * Retourne uniquement les modules actifs (filtrables plus tard via settings admin)
   */
  getActiveModules(): HomepageModuleSchema[] {
    // TODO: Connecter ici avec le `useLiveSettings` ou un store global pour vérifier si désactivé par l'admin
    return this.getAllSorted().filter((m) => m.isEnabledByDefault);
  }
}

export const homepageRegistry = new HomepageRegistryImpl();