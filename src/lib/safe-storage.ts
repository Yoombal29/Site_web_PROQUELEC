/**
 * Utilitaire pour manipuler localStorage de manière sécurisée.
 * Gère les erreurs de quota dépassé et les corruptions de données.
 */
export const SafeStorage = {
  set: (key: string, value: unknown): boolean => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`[SafeStorage] Erreur d'écriture pour ${key}:`, error);
      return false;
    }
  },

  get: <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[SafeStorage] Erreur de lecture pour ${key}, retour à la valeur par défaut.`, error);
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[SafeStorage] Erreur de suppression pour ${key}:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`[SafeStorage] Échec lors du clear:`, error);
    }
  }
};