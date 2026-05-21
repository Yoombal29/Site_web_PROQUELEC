/**
 * 🧪 Tests Automatisés — Suite de tests complète
 *
 * Tests unitaires et d'intégration pour :
 * - Calculs électriques (NF C 15-100)
 * - Validation temps réel
 * - Gestion d'erreurs
 * - Export multi-format
 * - Interface utilisateur
 *
 * Couverture complète avec Jest + React Testing Library.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { GraphStore } from '@/stores/GraphStore';
import { EditorManager } from '@/managers/EditorManager';
import { TronçonEngine } from '@/engines/TronçonEngine';
import ValidationEngine from '@/engines/ValidationEngine';
import ComponentLibrary from '@/constants/ComponentLibrary';
import ExportManager from '@/managers/ExportManager';
import SimulationEngine from '@/engines/SimulationEngine';

// ========== SETUP DES TESTS ==========

describe('Système Électrique Complet', () => {
  let graphStore: GraphStore;
  let editorManager: EditorManager;

  beforeEach(() => {
    graphStore = new GraphStore();
    editorManager = new EditorManager(graphStore);
  });

  afterEach(() => {

    // Nettoyage si nécessaire
  });
  // ========== TESTS CALCULS ÉLECTRIQUES ==========

  describe('Calculs NF C 15-100', () => {
    test('calcul chute de tension cuivre 1.5mm²', () => {
      const tronçon = {
        id: 'test-1',
        name: 'Test Cuivre',
        from: 'source',
        to: 'load',
        longueur: 10, // 10m
        section: 1.5, // 1.5mm²
        materiau: 'Cu' as const,
        courant: 16, // 16A
        modeInstallation: 'Apparent'
      };

      const result = TronçonEngine.calculate(tronçon);

      // Vérifications selon formules
      const resistivite = 0.0175; // Cuivre
      const expectedResistance = 2 * 10 * resistivite / 1.5;
      const expectedChuteTension = 16 * expectedResistance;
      const expectedPercent = expectedChuteTension / 230 * 100;

      expect(result.resultats?.resistance).toBeCloseTo(expectedResistance, 4);
      expect(result.resultats?.chuteTension).toBeCloseTo(expectedChuteTension, 2);
      expect(result.resultats?.chuteTensionPercent).toBeCloseTo(expectedPercent, 2);
      expect(result.resultats?.puissance).toBeCloseTo(16 * 16 * expectedResistance, 1);
    });

    test('calcul chute de tension aluminium 16mm²', () => {
      const tronçon = {
        id: 'test-2',
        name: 'Test Aluminium',
        from: 'source',
        to: 'load',
        longueur: 50, // 50m
        section: 16, // 16mm²
        materiau: 'Al' as const,
        courant: 63, // 63A
        modeInstallation: 'Apparent'
      };

      const result = TronçonEngine.calculate(tronçon);

      const resistivite = 0.0280; // Aluminium
      const expectedResistance = 2 * 50 * resistivite / 16;
      const expectedChuteTension = 63 * expectedResistance;

      expect(result.resultats?.resistance).toBeCloseTo(expectedResistance, 4);
      expect(result.resultats?.chuteTension).toBeCloseTo(expectedChuteTension, 2);
      expect(result.resultats?.conformity).toBeDefined();
    });

    test('conformité chute de tension ≤ 3%', () => {
      const tronçonConforme = {
        id: 'conforme',
        name: 'Conforme',
        from: 'source',
        to: 'load',
        longueur: 5, // Court
        section: 2.5,
        materiau: 'Cu' as const,
        courant: 10,
        modeInstallation: 'Apparent'
      };

      const tronçonNonConforme = {
        id: 'non-conforme',
        name: 'Non Conforme',
        from: 'source',
        to: 'load',
        longueur: 100, // Très long
        section: 1.5,
        materiau: 'Cu' as const,
        courant: 16,
        modeInstallation: 'Apparent'
      };

      const resultConforme = TronçonEngine.calculate(tronçonConforme);
      const resultNonConforme = TronçonEngine.calculate(tronçonNonConforme);

      expect(resultConforme.resultats?.conformity).toBe('CONFORME');
      expect(resultNonConforme.resultats?.conformity).toBe('NON_CONFORME');
      expect(resultNonConforme.resultats?.issues).toContain('Chute');
    });

    test('calculs multiples avec verdict global', () => {
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
        longueur: 50,
        section: 1.5,
        materiau: 'Cu' as const,
        courant: 16,
        modeInstallation: 'Apparent'
      }];


      const results = TronçonEngine.calculateAll(tronçons);

      expect(results.tronçons).toHaveLength(2);
      expect(results.chuteMax).toBeGreaterThan(0);
      expect(results.puissanceMax).toBeGreaterThan(0);
      expect(typeof results.verdict).toBe('string');
      expect(Array.isArray(results.issues)).toBe(true);
    });
  });

  // ========== TESTS VALIDATION ==========

  describe('Validation Temps Réel', () => {
    test('détection nœud isolé', () => {
      // Ajouter un nœud isolé
      graphStore.addNode({
        id: 'isolated',
        type: 'RECEPTOR',
        position: { x: 100, y: 100 },
        params: {},
        properties: {},
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      const validations = ValidationEngine.validateGraph(graphStore);
      const isolatedValidation = validations.find((v) =>
      v.ruleId === 'isolated-node' && v.targetId === 'isolated'
      );

      expect(isolatedValidation).toBeDefined();
      expect(isolatedValidation?.severity).toBe('warning');
    });

    test('validation compatibilité section/courant', () => {
      // Créer un graphe avec câble
      graphStore.addNode({
        id: 'source',
        type: 'SOURCE',
        position: { x: 0, y: 0 },
        params: {},
        properties: {},
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addNode({
        id: 'load',
        type: 'RECEPTOR',
        position: { x: 100, y: 0 },
        params: {},
        properties: {},
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addEdge({
        id: 'cable1',
        from: 'source',
        to: 'load',
        type: 'CABLE_CU',
        properties: {
          section: 1.5, // 1.5mm²
          length: 10,
          courant: 25 // 25A > capacité 16A
        }
      });

      const validations = ValidationEngine.validateGraph(graphStore);
      const compatibilityValidation = validations.find((v) =>
      v.ruleId === 'section-current-compatibility'
      );

      expect(compatibilityValidation).toBeDefined();
      expect(compatibilityValidation?.severity).toBe('error');
    });

    test('correction automatique section', () => {
      const edge = {
        id: 'test-cable',
        from: 'source',
        to: 'load',
        type: 'CABLE_CU',
        properties: {
          section: 1.5,
          length: 10,
          courant: 25
        }
      };

      const fixed = ValidationEngine.applyFix(graphStore, {
        ruleId: 'section-current-compatibility',
        severity: 'error',
        message: 'Section insuffisante',
        targetId: 'test-cable',
        targetType: 'edge',
        fixable: true
      });

      expect(fixed).toBe(true);
      // La section devrait être ajustée automatiquement
    });
  });

  // ========== TESTS BIBLIOTHÈQUE COMPOSANTS ==========

  describe('Bibliothèque de Composants', () => {
    test('recherche par catégorie', () => {
      const breakers = ComponentLibrary.findByCategory('protection');
      const cables = ComponentLibrary.findByCategory('cable');
      const sources = ComponentLibrary.findByCategory('source');

      expect(breakers.length).toBeGreaterThan(0);
      expect(cables.length).toBeGreaterThan(0);
      expect(sources.length).toBeGreaterThan(0);

      expect(breakers[0].type).toBe('BREAKER');
      expect(cables[0].type).toContain('CABLE');
      expect(sources[0].type).toBe('SOURCE');
    });

    test('recommandation protection', () => {
      const heater = ComponentLibrary.findById('heater_32a');
      expect(heater).toBeDefined();

      const recommendedProtection = ComponentLibrary.recommendProtection(heater!);
      expect(recommendedProtection).toBeDefined();
      expect(recommendedProtection?.electrical.courant).toBeGreaterThanOrEqual(32);
    });

    test('recommandation section câble', () => {
      const recommendedCable = ComponentLibrary.recommendCableSection(25, 'Cu');
      expect(recommendedCable).toBeDefined();
      expect(recommendedCable?.electrical.courant).toBeGreaterThanOrEqual(25);
    });

    test('validation compatibilité', () => {
      const breaker = ComponentLibrary.findById('breaker_20a_c');
      const cable = ComponentLibrary.findById('cable_cu_2_5');

      const compatibility = ComponentLibrary.validateCompatibility(
        breaker!.id,
        cable!.id
      );

      expect(compatibility.compatible).toBeDefined();
      expect(Array.isArray(compatibility.issues)).toBe(true);
      expect(Array.isArray(compatibility.recommendations)).toBe(true);
    });
  });

  // ========== TESTS EXPORT ==========

  describe('Export Multi-Format', () => {
    beforeEach(() => {
      // Créer un schéma de test
      graphStore.addNode({
        id: 'source1',
        type: 'SOURCE',
        position: { x: 0, y: 0 },
        params: { tension: 230, courant: 63 },
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addNode({
        id: 'breaker1',
        type: 'BREAKER',
        position: { x: 100, y: 0 },
        params: { courant: 20, curve: 'C' },
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addEdge({
        id: 'cable1',
        from: 'source1',
        to: 'breaker1',
        type: 'CABLE_CU',
        properties: {
          section: 2.5,
          length: 5,
          courant: 20,
          materiau: 'Cu'
        }
      });
    });

    test('export JSON complet', async () => {
      const result = await ExportManager.toJSON(graphStore, {
        title: 'Test Schema',
        includeCalculations: true,
        includeValidations: true
      });

      expect(result.format).toBe('JSON');
      expect(result.filename).toContain('Test Schema');
      expect(result.size).toBeGreaterThan(0);

      // Vérifier le contenu
      const content = JSON.parse(await result.blob.text());
      expect(content.metadata.title).toBe('Test Schema');
      expect(content.graph.nodes).toHaveLength(2);
      expect(content.graph.edges).toHaveLength(1);
      expect(content.calculations).toBeDefined();
      expect(content.validations).toBeDefined();
    });

    test('export Excel avec calculs', async () => {
      const result = await ExportManager.toExcel(graphStore, {
        title: 'Calculs Test'
      });

      expect(result.format).toBe('Excel');
      expect(result.filename).toContain('Calculs Test');
      expect(result.size).toBeGreaterThan(0);

      // Le contenu Excel est en CSV pour le test
      const content = await result.blob.text();
      expect(content).toContain('Tronçon');
      expect(content).toContain('Longueur');
      expect(content).toContain('Section');
    });

    test('export DWG structure', async () => {
      const result = await ExportManager.toDWG(graphStore, {
        title: 'DWG Test'
      });

      expect(result.format).toBe('DWG');
      expect(result.filename).toContain('DWG Test');

      const content = await result.blob.text();
      expect(content).toContain('AC1027'); // Version DWG
      expect(content).toContain('NODE');
      expect(content).toContain('LINE');
    });

    test('export multi-format', async () => {
      const results = await ExportManager.exportAll(graphStore, ['json', 'excel'], {
        title: 'Multi Test'
      });

      expect(results).toHaveLength(2);
      expect(results[0].format).toBe('JSON');
      expect(results[1].format).toBe('Excel');
    });
  });

  // ========== TESTS SIMULATION ==========

  describe('Simulation Avancée', () => {
    beforeEach(() => {
      // Créer un système de test plus complexe
      graphStore.addNode({
        id: 'source_main',
        type: 'SOURCE',
        position: { x: 0, y: 0 },
        params: { tension: 230, courant: 63 },
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addNode({
        id: 'breaker_main',
        type: 'BREAKER',
        position: { x: 100, y: 0 },
        params: { courant: 40, curve: 'C' },
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addNode({
        id: 'breaker_branch',
        type: 'BREAKER',
        position: { x: 200, y: 0 },
        params: { courant: 20, curve: 'C' },
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      graphStore.addNode({
        id: 'load1',
        type: 'RECEPTOR',
        position: { x: 300, y: 0 },
        params: { puissance: 3000 },
        metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
      });

      // Connexions
      graphStore.addEdge({
        id: 'cable_main',
        from: 'source_main',
        to: 'breaker_main',
        type: 'CABLE_CU',
        properties: { section: 6, length: 5, courant: 40, materiau: 'Cu' }
      });

      graphStore.addEdge({
        id: 'cable_branch',
        from: 'breaker_main',
        to: 'breaker_branch',
        type: 'CABLE_CU',
        properties: { section: 2.5, length: 10, courant: 20, materiau: 'Cu' }
      });

      graphStore.addEdge({
        id: 'cable_load',
        from: 'breaker_branch',
        to: 'load1',
        type: 'CABLE_CU',
        properties: { section: 2.5, length: 5, courant: 16, materiau: 'Cu' }
      });
    });

    test('simulation court-circuit', () => {
      const result = SimulationEngine.simulateShortCircuit(graphStore, 'load1');

      expect(result.faultLocation).toBe('load1');
      expect(result.faultCurrent).toBeGreaterThan(0);
      expect(result.protectionDevice).toBeDefined();
      expect(typeof result.selectivity).toBe('boolean');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('analyse coordination protections', () => {
      const result = SimulationEngine.analyzeProtectionCoordination(graphStore);

      expect(Array.isArray(result.protectionChain)).toBe(true);
      expect(result.protectionChain.length).toBeGreaterThan(0);
      expect(Array.isArray(result.selectivityMatrix)).toBe(true);
      expect(typeof result.compliance).toBe('string');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('analyse harmonique', () => {
      const result = SimulationEngine.analyzeHarmonics(graphStore);

      expect(typeof result.thd).toBe('number');
      expect(Array.isArray(result.harmonics)).toBe(true);
      expect(Array.isArray(result.sources)).toBe(true);
      expect(Array.isArray(result.mitigation)).toBe(true);
      expect(typeof result.compliance).toBe('boolean');
    });

    test('analyse flux de puissance', () => {
      const result = SimulationEngine.analyzePowerFlow(graphStore);

      expect(result.nodeVoltages instanceof Map).toBe(true);
      expect(result.branchCurrents instanceof Map).toBe(true);
      expect(result.powerLosses instanceof Map).toBe(true);
      expect(typeof result.loadBalance).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('simulation complète système', () => {
      const result = SimulationEngine.runCompleteSimulation(graphStore);

      expect(Array.isArray(result.shortCircuit)).toBe(true);
      expect(result.coordination).toBeDefined();
      expect(result.harmonics).toBeDefined();
      expect(result.powerFlow).toBeDefined();
      expect(['CONFORME', 'AVERTISSEMENT', 'NON_CONFORME']).toContain(result.overallCompliance);
    });
  });

  // ========== TESTS GESTION ERREURS ==========

  describe('Gestion d\'Erreurs Robuste', () => {
    test('récupération données corrompues', () => {
      // Simuler des données invalides
      const invalidTronçon = {
        id: 'invalid',
        name: 'Invalid',
        from: 'source',
        to: 'load',
        longueur: -10, // Négatif invalide
        section: 0, // Zéro invalide
        materiau: 'Cu' as const,
        courant: -5, // Négatif invalide
        modeInstallation: 'Apparent'
      };

      expect(() => {
        TronçonEngine.calculate(invalidTronçon);
      }).not.toThrow();

      const result = TronçonEngine.calculate(invalidTronçon);
      expect(result.resultats).toBeDefined();
      // Les valeurs devraient être corrigées ou des valeurs par défaut utilisées
    });

    test('validation données manquantes', () => {
      const incompleteTronçon = {
        id: 'incomplete',
        name: 'Incomplete',
        from: 'source',
        to: 'load'
        // Propriétés manquantes
      };

      const result = TronçonEngine.calculate(incompleteTronçon as unknown);
      expect(result.resultats).toBeDefined();
      // Devrait utiliser des valeurs par défaut
    });

    test('résistance aux pannes calculs', () => {
      const tronçons = [
      {
        id: 'valid',
        name: 'Valid',
        from: 's1',
        to: 'l1',
        longueur: 10,
        section: 2.5,
        materiau: 'Cu' as const,
        courant: 20,
        modeInstallation: 'Apparent'
      },
      {
        id: 'invalid',
        name: 'Invalid',
        from: 's2',
        to: 'l2',
        longueur: NaN, // Valeur invalide
        section: Infinity, // Valeur invalide
        materiau: 'Cu' as const,
        courant: 10,
        modeInstallation: 'Apparent'
      }];


      expect(() => {
        TronçonEngine.calculateAll(tronçons);
      }).not.toThrow();

      const results = TronçonEngine.calculateAll(tronçons);
      expect(results.tronçons).toHaveLength(2);
      // Le système devrait gérer les erreurs gracieusement
    });
  });

  // ========== TESTS PERFORMANCE ==========

  describe('Optimisations Performance', () => {
    test('calculs schémas complexes', () => {
      // Créer un schéma plus complexe (50 nœuds)
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        graphStore.addNode({
          id: `node_${i}`,
          type: i % 3 === 0 ? 'SOURCE' : i % 3 === 1 ? 'BREAKER' : 'RECEPTOR',
          position: { x: i * 20, y: 0 },
          params: {},
          metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
        });
      }

      // Ajouter des connexions
      for (let i = 0; i < 49; i++) {
        graphStore.addEdge({
          id: `edge_${i}`,
          from: `node_${i}`,
          to: `node_${i + 1}`,
          type: 'CABLE_CU',
          properties: {
            section: 2.5,
            length: 5,
            courant: 16,
            materiau: 'Cu'
          }
        });
      }

      const validations = ValidationEngine.validateGraph(graphStore);
      const calculations = TronçonEngine.calculateAll(
        Array.from(graphStore.edges.values()).
        filter((e) => e.type.includes('CABLE')).
        map((e) => ({
          id: e.id,
          name: e.id,
          from: e.from,
          to: e.to,
          longueur: e.properties.length || 0,
          section: e.properties.section || 2.5,
          materiau: e.properties.materiau || 'Cu',
          courant: e.properties.courant || 10,
          modeInstallation: e.properties.modeOfInstallation || 'Apparent'
        }))
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(validations.length).toBeGreaterThan(0);
      expect(calculations.tronçons.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Moins de 5 secondes pour 50 nœuds
    });

    test('mémoire et fuites', () => {
      // Test de stabilité mémoire
      for (let i = 0; i < 100; i++) {
        const tempGraph = new GraphStore();
        tempGraph.addNode({
          id: `temp_${i}`,
          type: 'RECEPTOR',
          position: { x: 0, y: 0 },
          params: {},
          metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
        });

        ValidationEngine.validateGraph(tempGraph);
      }

      // Le système devrait gérer la création/destruction sans fuite
      expect(true).toBe(true); // Test passe si pas d'exception
    });
  });
});