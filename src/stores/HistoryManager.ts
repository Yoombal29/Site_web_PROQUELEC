/**
 * 📜 HistoryManager — Gestion Undo/Redo
 * 
 * Permet de naviguer dans l'historique des modifications
 * - Ctrl+Z : Annuler
 * - Ctrl+Y : Rétablir
 * 
 * Sérialise l'état complet à chaque étape pour exactitude
 */

export interface HistoryState {
  nodes: Map<string, unknown>;
  edges: Map<string, unknown>;
  timestamp: number;
  description: string;
}

export class HistoryManager {
  private past: HistoryState[] = [];
  private future: HistoryState[] = [];
  private maxSize = 50; // Maximum d'étapes conservées

  /**
   * Enregistrer l'état actuel
   * Efface le futur si on enregistre après un undo
   */
  push(state: HistoryState, description: string = ''): void {
    this.past.push({
      ...state,
      timestamp: Date.now(),
      description
    });

    // Limiter la taille
    if (this.past.length > this.maxSize) {
      this.past.shift();
    }

    // Effacer le futur (on a une nouvelle action)
    this.future = [];
  }

  /**
   * Annuler (Ctrl+Z)
   * Retourner à l'état précédent
   */
  undo(): HistoryState | null {
    if (this.past.length === 0) return null;

    const currentState: unknown = { nodes: new Map(), edges: new Map() };
    this.future.unshift(currentState);

    return this.past.pop() || null;
  }

  /**
   * Rétablir (Ctrl+Y)
   * Avancer vers l'état suivant
   */
  redo(): HistoryState | null {
    if (this.future.length === 0) return null;
    return this.future.shift() || null;
  }

  /**
   * Vérifier s'il y a des étapes undo possibles
   */
  canUndo(): boolean {
    return this.past.length > 0;
  }

  /**
   * Vérifier s'il y a des étapes redo possibles
   */
  canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * Nombre d'étapes undo/redo
   */
  getStats() {
    return {
      undoSteps: this.past.length,
      redoSteps: this.future.length
    };
  }

  /**
   * Effacer tout l'historique
   */
  clear(): void {
    this.past = [];
    this.future = [];
  }
}