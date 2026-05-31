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
import { vi } from 'vitest';

// Ensure a DOM is available when running under Node (vitest environment fallback)
if (typeof document === 'undefined' || typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  (global as unknown).window = dom.window;
  (global as unknown).document = dom.window.document;
  (global as unknown).navigator = dom.window.navigator;
}

// Make `jest` helpers available when running under Vitest
if (!(global as unknown).jest && (global as unknown).vi) {
  (global as unknown).jest = (global as unknown).vi;
}

// ========== POLYFILLS ==========

// Polyfill pour ResizeObserver (utilisé par certains composants)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill for Blob.prototype.text in environments where it is missing
if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(this);
    });
  };
}

// Polyfill for Pointer Capture APIs which are missing in JSDOM but required by modern UI libraries like Radix
if (typeof window !== 'undefined' && window.Element) {
  if (!window.Element.prototype.hasPointerCapture) {
    window.Element.prototype.hasPointerCapture = function() { return false; };
  }
  if (!window.Element.prototype.setPointerCapture) {
    window.Element.prototype.setPointerCapture = function() {};
  }
  if (!window.Element.prototype.releasePointerCapture) {
    window.Element.prototype.releasePointerCapture = function() {};
  }
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = function() {};
  }
}

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
    dispatchEvent: () => {}
  })
});

// Polyfill pour IntersectionObserver
global.IntersectionObserver = (global as unknown).vi ? (global as unknown).vi.fn().mockImplementation(() => ({
  observe: (global as unknown).vi.fn(),
  unobserve: (global as unknown).vi.fn(),
  disconnect: (global as unknown).vi.fn()
})) : function () {return { observe() {}, unobserve() {}, disconnect() {} };}();

// ========== MOCKS GLOBAUX ==========

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => {
  const React = require('react');
  return {
    default: (props: unknown) => {
      return React.createElement('textarea', {
        'data-testid': props['data-testid'] || 'monaco-editor',
        value: props.value,
        onChange: (e: unknown) => props.onChange(e.target.value),
        className: props.className
      });
    },
    loader: {
      init: () => Promise.resolve(),
      config: () => {}
    }
  };
});

// Mock useLiveSettings globally to avoid QueryClientProvider requirements in component tests
vi.mock('@/hooks/useLiveSettings', () => ({
  useLiveSettings: () => ({
    settings: {
      site_name: "PROQUELEC SENEGAL",
      slogan: "Sécurité · Qualité · Formation",
      contact_email: "contact@proquelec.sn",
      phone_number: "+221 XX XXX XX XX",
      address: "Dakar, Sénégal",
      primary_color: "#2376df",
      secondary_color: "#054393",
      accent_color: "#1a73e8",
      background_color: "#f8f9fa",
      text_color: "#333333",
      font_family: "Roboto",
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock Radix Tooltip component globally to render inline for reliable testing in JSDOM
vi.mock('@/components/ui/tooltip', () => {
  const React = require('react');
  return {
    TooltipProvider: ({ children }: any) => children,
    Tooltip: ({ children }: any) => children,
    TooltipTrigger: ({ children }: any) => children,
    TooltipContent: ({ children }: any) => React.createElement('div', {}, children),
  };
});

// Mock Radix Select component globally to render inline with context for robust testing in JSDOM
vi.mock('@radix-ui/react-select', () => {
  const React = require('react');
  const SelectContext = React.createContext(null);

  const Root = ({ children, value, onValueChange }: any) => {
    return React.createElement(
      SelectContext.Provider,
      { value: { value, onValueChange } },
      React.createElement('div', {}, children)
    );
  };
  Root.displayName = 'Select';

  const Trigger = ({ children, id }: any) => {
    return React.createElement('button', { id, type: 'button' }, children);
  };
  Trigger.displayName = 'Trigger';

  const Value = ({ placeholder, children }: any) => children || placeholder || null;
  Value.displayName = 'Value';

  const Content = ({ children }: any) => {
    return React.createElement('div', {}, children);
  };
  Content.displayName = 'Content';

  const Item = ({ children, value }: any) => {
    const context = React.useContext(SelectContext) as any;
    return React.createElement('button', {
      type: 'button',
      onClick: () => {
        if (context && context.onValueChange) {
          context.onValueChange(value);
        }
      }
    }, children);
  };
  Item.displayName = 'Item';

  const Group = ({ children }: any) => children;
  Group.displayName = 'Group';

  const Label = ({ children }: any) => children;
  Label.displayName = 'Label';

  const Separator = () => null;
  Separator.displayName = 'Separator';

  const ScrollUpButton = () => null;
  ScrollUpButton.displayName = 'ScrollUpButton';

  const ScrollDownButton = () => null;
  ScrollDownButton.displayName = 'ScrollDownButton';

  const Viewport = ({ children }: any) => children;
  Viewport.displayName = 'Viewport';

  const Icon = ({ children }: any) => children || null;
  Icon.displayName = 'Icon';

  const Portal = ({ children }: any) => children;
  Portal.displayName = 'Portal';

  const ItemIndicator = ({ children }: any) => children || null;
  ItemIndicator.displayName = 'ItemIndicator';

  const ItemText = ({ children }: any) => children;
  ItemText.displayName = 'ItemText';

  return {
    Root,
    Trigger,
    Value,
    Content,
    Item,
    Group,
    Label,
    Separator,
    ScrollUpButton,
    ScrollDownButton,
    Viewport,
    Icon,
    Portal,
    ItemIndicator,
    ItemText
  };
});

// Ensure DOMParser exists in JSDOM
if (!(window as unknown).DOMParser) {
  class DOMParserPolyfill {
    parseFromString(str: string) {
      const { JSDOM } = require('jsdom');
      return new JSDOM(str).window.document;
    }
  }
  (window as unknown).DOMParser = DOMParserPolyfill as unknown;
}

// Mock pour les APIs Web
global.fetch = vi.fn().mockImplementation(() =>
Promise.resolve({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  blob: () => Promise.resolve(new Blob())
})
);

// Mock pour localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock as unknown;

// Mock pour sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.sessionStorage = sessionStorageMock as unknown;

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
  clip: jest.fn()
})) as unknown;

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
      pass
    };
  },

  toBeValidValidation(received) {
    const pass = received &&
    Array.isArray(received) &&
    received.every((v) =>
    typeof v === 'object' &&
    'ruleId' in v &&
    'severity' in v &&
    'message' in v
    );

    return {
      message: () => `expected ${received} to be a valid validation result`,
      pass
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
      pass
    };
  }
});

// ========== CONFIGURATION REACT TESTING LIBRARY ==========

// Configuration par défaut pour React Testing Library


// Configuration globale (testIdAttribute has been deprecated)
// configure({
//   testIdAttribute: 'data-testid',
// });

// ========== UTILITAIRES DE TEST ==========

// Fonction utilitaire pour créer un GraphStore de test
export const createTestGraphStore = () => {
  const { GraphStore } = require('@/stores/GraphStore');
  return new GraphStore();
};

// Fonction utilitaire pour créer un EditorManager de test
export const createTestEditorManager = (graphStore?: unknown) => {
  const { EditorManager } = require('@/managers/EditorManager');
  return new EditorManager(graphStore || createTestGraphStore());
};

// Fonction utilitaire pour créer un schéma de test simple
export const createSimpleTestSchema = (graphStore?: unknown) => {
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
export const waitForNextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

// ========== CLEANUP ==========

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});