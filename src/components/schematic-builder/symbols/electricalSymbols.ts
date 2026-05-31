/**
 * electricalSymbols.ts
 * Catalogue des symboles électriques disponibles (NF C 15-100 / IEC 60617).
 * Retourne null si aucun symbole SVG personnalisé n'est disponible pour ce type
 * (dans ce cas, DraggableShape affiche une icône générique).
 */

import type { ElementType } from '@/stores/useSchematicStore';

// Chemins SVG simplifiés pour les symboles électriques courants
// Format: [M x y L x y ...] (SVG path data)
const SYMBOL_PATHS: Partial<Record<ElementType, string>> = {
  switch:
    'M 10 25 L 30 25 M 30 20 L 50 30 M 50 25 L 70 25',
  breaker:
    'M 10 25 L 25 25 M 25 20 L 50 30 M 50 25 L 75 25 M 37 10 L 37 20',
  socket:
    'M 25 15 L 25 35 M 35 15 L 35 35 M 10 25 L 25 25 M 35 25 L 50 25',
  light:
    'M 25 10 A 15 15 0 1 1 25 40 A 15 15 0 1 1 25 10 M 25 10 L 45 30 M 25 40 L 45 20',
  ground:
    'M 25 10 L 25 35 M 10 35 L 40 35 M 15 42 L 35 42 M 20 49 L 30 49',
  motor:
    'M 25 10 A 15 15 0 1 1 25 40',
  transformer:
    'M 10 15 A 8 8 0 0 1 10 35 M 40 15 A 8 8 0 0 0 40 35',
};

/**
 * Retourne le chemin SVG du symbole électrique pour un type donné,
 * ou null si aucun symbole spécifique n'est défini.
 */
export function getElectricalSymbolPath(type: ElementType): string | null {
  return SYMBOL_PATHS[type] ?? null;
}

/**
 * Catalogue complet des éléments disponibles dans la sidebar,
 * regroupés par catégories.
 */
export interface SymbolCatalogItem {
  type: ElementType;
  label: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultProps?: Record<string, unknown>;
}

export interface SymbolCategory {
  name: string;
  icon: string;
  items: SymbolCatalogItem[];
}

export const SYMBOL_CATALOG: SymbolCategory[] = [
  {
    name: 'Formes',
    icon: '▭',
    items: [
      { type: 'rect', label: 'Rectangle', description: 'Bloc générique', defaultWidth: 100, defaultHeight: 60 },
      { type: 'circle', label: 'Cercle', description: 'Forme circulaire', defaultWidth: 60, defaultHeight: 60 },
      { type: 'text', label: 'Texte', description: 'Zone de texte', defaultWidth: 120, defaultHeight: 40 },
    ],
  },
  {
    name: 'Commande',
    icon: '⚡',
    items: [
      {
        type: 'switch',
        label: 'Interrupteur',
        description: 'Section 771 NF C 15-100',
        defaultWidth: 80,
        defaultHeight: 50,
        defaultProps: { reference: 'S1', courant: '16A' },
      },
      {
        type: 'breaker',
        label: 'Disjoncteur',
        description: 'Protection surintensité',
        defaultWidth: 80,
        defaultHeight: 50,
        defaultProps: { reference: 'CB1', calibre: '20A', courbe: 'C' },
      },
    ],
  },
  {
    name: 'Alimentation',
    icon: '🔌',
    items: [
      {
        type: 'socket',
        label: 'Prise de courant',
        description: '2P+T 16A 250V',
        defaultWidth: 70,
        defaultHeight: 50,
        defaultProps: { voltage: '230V', current: '16A' },
      },
      {
        type: 'transformer',
        label: 'Transformateur',
        description: 'Abaisseur de tension',
        defaultWidth: 90,
        defaultHeight: 70,
        defaultProps: { ratio: '230/24V' },
      },
      {
        type: 'ground',
        label: 'Terre',
        description: 'Liaison équipotentielle',
        defaultWidth: 60,
        defaultHeight: 55,
      },
    ],
  },
  {
    name: 'Charges',
    icon: '💡',
    items: [
      {
        type: 'light',
        label: 'Luminaire',
        description: 'Point lumineux',
        defaultWidth: 70,
        defaultHeight: 60,
        defaultProps: { puissance: '15W', tension: '230V' },
      },
      {
        type: 'motor',
        label: 'Moteur',
        description: 'Moteur électrique',
        defaultWidth: 80,
        defaultHeight: 70,
        defaultProps: { puissance: '2.2kW', tension: '400V' },
      },
    ],
  },
  {
    name: 'Passifs',
    icon: '⊣',
    items: [
      { type: 'resistor', label: 'Résistance', description: 'Résistance électrique', defaultWidth: 80, defaultHeight: 40 },
      { type: 'capacitor', label: 'Condensateur', description: 'Condensateur électrique', defaultWidth: 60, defaultHeight: 50 },
    ],
  },
  {
    name: 'Jeu de barres',
    icon: '═',
    items: [
      {
        type: 'bus',
        label: 'Jeu de barres',
        description: 'Bus d\'alimentation',
        defaultWidth: 200,
        defaultHeight: 20,
        defaultProps: { tension: '400V', courant: '125A' },
      },
    ],
  },
];
