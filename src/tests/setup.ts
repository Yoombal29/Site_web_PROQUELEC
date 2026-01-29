/**
 * 🛠️ Setup Tests — Configuration globale des tests
 *
 * Configuration commune pour tous les tests :
 * - Polyfills pour l'environnement de test
 * - Mocks globaux
 * - Extensions Jest
 * - Configuration React Testing Library
 */

import '@testing-library/jest-dom';

// ========== POLYFILLS ==========

// Polyfill pour ResizeObserver (utilisé par certains composants)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill pour matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Polyfill pour IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// ========== MOCKS GLOBAUX ==========

// Mock pour les APIs Web
global.fetch = jest.fn();

// Mock pour localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock pour sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock pour les APIs Canvas 2D
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  canvas: {},
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  clip: jest.fn(),
})) as any;

// ========== EXTENSIONS JEST ==========

// Extension pour les tests asynchrones
expect.extend({
  toBeValidCalculation(received) {
    const pass = received &&
                 typeof received === 'object' &&
                 'resultats' in received &&
                 received.resultats &&
                 typeof received.resultats.chuteTension === 'number';

    return {
      message: () => `expected ${received} to be a valid calculation result`,
      pass,
    };
  },

  toBeValidValidation(received) {
    const pass = received &&
                 Array.isArray(received) &&
                 received.every(v =>
                   typeof v === 'object' &&
                   'ruleId' in v &&
                   'severity' in v &&
                   'message' in v
                 );

    return {
      message: () => `expected ${received} to be a valid validation result`,
      pass,
    };
  },

  toBeValidComponent(received) {
    const pass = received &&
                 typeof received === 'object' &&
                 'id' in received &&
                 'type' in received &&
                 'electrical' in received;

    return {
      message: () => `expected ${received} to be a valid component`,
      pass,
    };
  },
});

// ========== CONFIGURATION REACT TESTING LIBRARY ==========

// Configuration par défaut pour React Testing Library
import { configure } from '@testing-library/react';

// Configuration globale
configure({
  testIdAttribute: 'data-testid',
});

// ========== UTILITAIRES DE TEST ==========

// Fonction utilitaire pour créer un GraphStore de test
export const createTestGraphStore = () => {
  const { GraphStore } = require('@/stores/GraphStore');
  return new GraphStore();
};

// Fonction utilitaire pour créer un EditorManager de test
export const createTestEditorManager = (graphStore?: any) => {
  const { EditorManager } = require('@/managers/EditorManager');
  return new EditorManager(graphStore || createTestGraphStore());
};

// Fonction utilitaire pour créer un schéma de test simple
export const createSimpleTestSchema = (graphStore?: any) => {
  const store = graphStore || createTestGraphStore();

  store.addNode({
    id: 'source1',
    type: 'SOURCE',
    position: { x: 0, y: 0 },
    params: { tension: 230, courant: 63 },
    metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
  });

  store.addNode({
    id: 'breaker1',
    type: 'BREAKER',
    position: { x: 100, y: 0 },
    params: { courant: 20, curve: 'C' },
    metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
  });

  store.addNode({
    id: 'load1',
    type: 'RECEPTOR',
    position: { x: 200, y: 0 },
    params: { puissance: 3000 },
    metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
  });

  store.addEdge({
    id: 'cable1',
    from: 'source1',
    to: 'breaker1',
    type: 'CABLE_CU',
    properties: {
      section: 6,
      length: 5,
      courant: 40,
      materiau: 'Cu'
    }
  });

  store.addEdge({
    id: 'cable2',
    from: 'breaker1',
    to: 'load1',
    type: 'CABLE_CU',
    properties: {
      section: 2.5,
      length: 10,
      courant: 16,
      materiau: 'Cu'
    }
  });

  return store;
};

// Fonction utilitaire pour attendre les mises à jour React
export const waitForNextUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

// ========== CLEANUP ==========

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});