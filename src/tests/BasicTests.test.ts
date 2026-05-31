/**
 * 🧪 Tests de Base — Tests essentiels du système
 *
 * Tests simples et fiables pour valider le cœur du système :
 * - Calculs électriques de base
 * - Logique métier sans dépendances UI complexes
 */

import { describe, test, expect } from 'vitest';
import { TronçonEngine } from '@/engines/TronçonEngine';
import { GraphStore } from '@/stores/GraphStore';

// ========== TESTS DE BASE ==========

describe('Système Électrique - Tests de Base', () => {
  test('calcul chute de tension basique', () => {
    const tronçon = {
      id: 'test-1',
      name: 'Test Basique',
      from: 'source',
      to: 'load',
      longueur: 10,
      section: 2.5,
      materiau: 'Cu' as const,
      courant: 20,
      modeInstallation: 'Apparent'
    };

    const result = TronçonEngine.calculate(tronçon);

    expect(result.resultats).toBeDefined();
    expect(typeof result.resultats?.chuteTension).toBe('number');
    expect(typeof result.resultats?.resistance).toBe('number');
    expect(result.resultats?.chuteTension).toBeGreaterThan(0);
    expect(result.resultats?.resistance).toBeGreaterThan(0);
  });

  test('calculs conformes NF C 15-100', () => {
    const tronçonConforme = {
      id: 'conforme',
      name: 'Conforme',
      from: 'source',
      to: 'load',
      longueur: 5,
      section: 2.5,
      materiau: 'Cu' as const,
      courant: 16,
      modeInstallation: 'Apparent'
    };

    const result = TronçonEngine.calculate(tronçonConforme);
    expect(result.resultats?.conformity).toBeDefined();
  });

  test('résistance aux données invalides', () => {
    const tronçonInvalide = {
      id: 'invalid',
      name: 'Invalid',
      from: 'source',
      to: 'load',
      longueur: -10, // Négatif
      section: 0,    // Zéro
      materiau: 'Cu' as const,
      courant: -5,   // Négatif
      modeInstallation: 'Apparent'
    };

    // Le système devrait gérer les erreurs gracieusement
    expect(() => {
      TronçonEngine.calculate(tronçonInvalide);
    }).not.toThrow();
  });

  test('calculs multiples', () => {
    const tronçons = [
      {
        id: 't1',
        name: 'Tronçon 1',
        from: 's1',
        to: 'l1',
        longueur: 10,
        section: 2.5,
        materiau: 'Cu' as const,
        courant: 20,
        modeInstallation: 'Apparent'
      },
      {
        id: 't2',
        name: 'Tronçon 2',
        from: 's2',
        to: 'l2',
        longueur: 20,
        section: 4,
        materiau: 'Cu' as const,
        courant: 25,
        modeInstallation: 'Apparent'
      }
    ];

    const results = TronçonEngine.calculateAll(tronçons);

    expect(results.tronçons).toHaveLength(2);
    expect(typeof results.chuteMax).toBe('number');
    expect(typeof results.puissanceMax).toBe('number');
    expect(typeof results.verdict).toBe('string');
  });

  test('matériaux différents', () => {
    const cuivre = {
      id: 'cu',
      name: 'Cuivre',
      from: 'source',
      to: 'load',
      longueur: 10,
      section: 2.5,
      materiau: 'Cu' as const,
      courant: 20,
      modeInstallation: 'Apparent'
    };

    const aluminium = {
      id: 'al',
      name: 'Aluminium',
      from: 'source',
      to: 'load',
      longueur: 10,
      section: 2.5,
      materiau: 'Al' as const,
      courant: 20,
      modeInstallation: 'Apparent'
    };

    const resultCu = TronçonEngine.calculate(cuivre);
    const resultAl = TronçonEngine.calculate(aluminium);

    expect(resultCu.resultats?.resistance).not.toBe(resultAl.resultats?.resistance);
  });

  test('gestion des charges électriques', () => {
    const graphStore = new GraphStore();

    // Ajouter un nœud récepteur
    graphStore.addNode({
      id: 'receptor-1',
      type: 'RECEPTOR',
      position: { x: 100, y: 100 },
      params: {},
      metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
    });

    // Ajouter une charge
    graphStore.addCharge('receptor-1', {
      nom: 'Éclairage Bureau',
      puissance: 100, // 100W
      tension: 230,   // 230V
      cosPhi: 1.0,    // Facteur de puissance
      type: 'MONOPHASE',
      categorie: 'ECLAIRAGE'
    });

    // Vérifier que la charge a été ajoutée
    const charges = graphStore.getCharges('receptor-1');
    expect(charges).toHaveLength(1);
    expect(charges[0].nom).toBe('Éclairage Bureau');
    expect(charges[0].courantNominal).toBeCloseTo(100/230, 2); // 0.43A

    // Vérifier le courant total
    const totalCurrent = graphStore.getTotalCurrent('receptor-1');
    expect(totalCurrent).toBeCloseTo(0.43, 2);

    // Ajouter une deuxième charge
    graphStore.addCharge('receptor-1', {
      nom: 'Prise Informatique',
      puissance: 500, // 500W
      tension: 230,   // 230V
      cosPhi: 0.9,    // Facteur de puissance
      type: 'MONOPHASE',
      categorie: 'FORCE'
    });

    // Vérifier le courant total mis à jour
    const updatedTotalCurrent = graphStore.getTotalCurrent('receptor-1');
    const expectedCurrent = (100/230) + (500/(230 * 0.9)); // cosφ affecte le calcul
    expect(updatedTotalCurrent).toBeCloseTo(expectedCurrent, 2);
  });
});
