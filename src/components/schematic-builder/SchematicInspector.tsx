/**
 * SchematicInspector.tsx
 * Panneau de configuration (droite) de l'éditeur schématique.
 *
 * ⚡ PERFORMANCE : souscrit UNIQUEMENT à l'élément sélectionné via
 * sélecteur granulaire Zustand. Le canvas et la sidebar ne re-rendent
 * pas quand l'utilisateur tape dans un champ ici.
 */

import React, { useCallback } from 'react';
import { useSchematicStore } from '@/stores/useSchematicStore';
import type { SchematicElement } from '@/stores/useSchematicStore';

const TYPE_LABELS: Record<string, string> = {
  rect: 'Rectangle',
  circle: 'Cercle',
  text: 'Texte',
  switch: 'Interrupteur',
  breaker: 'Disjoncteur',
  socket: 'Prise de courant',
  light: 'Luminaire',
  motor: 'Moteur',
  transformer: 'Transformateur',
  capacitor: 'Condensateur',
  resistor: 'Résistance',
  ground: 'Terre',
  bus: 'Jeu de barres',
};

/* =========================================================
   FIELD COMPONENTS
========================================================= */

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const TextInput: React.FC<{
  value: string | number;
  onChange: (v: string) => void;
  type?: 'text' | 'number' | 'color';
  min?: number;
  max?: number;
  step?: number;
}> = ({ value, onChange, type = 'text', min, max, step }) => (
  <input
    type={type}
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white
               focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100
               transition-colors"
  />
);

/* =========================================================
   MAIN INSPECTOR
========================================================= */

export const SchematicInspector: React.FC = React.memo(() => {
  const selectedId = useSchematicStore((s) => s.selectedId);
  const elements = useSchematicStore((s) => s.elements);
  const updateElementProps = useSchematicStore((s) => s.updateElementProps);
  const removeElement = useSchematicStore((s) => s.removeElement);
  const selectElement = useSchematicStore((s) => s.selectElement);

  const element = selectedId ? elements[selectedId] : null;

  const update = useCallback(
    (field: keyof SchematicElement, value: unknown) => {
      if (!selectedId) return;
      updateElementProps(selectedId, { [field]: value });
    },
    [selectedId, updateElementProps]
  );

  const updateProp = useCallback(
    (key: string, value: unknown) => {
      if (!selectedId || !element) return;
      updateElementProps(selectedId, {
        props: { ...(element.props ?? {}), [key]: value },
      });
    },
    [selectedId, element, updateElementProps]
  );

  if (!element) {
    return (
      <div className="h-full flex flex-col bg-white border-l border-slate-200 w-[240px] flex-shrink-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Propriétés</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <span className="text-2xl">🖱</span>
          </div>
          <p className="text-xs text-slate-400">Sélectionnez un élément sur le canvas pour modifier ses propriétés.</p>
        </div>
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[element.type] ?? element.type;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 w-[240px] flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">{typeLabel}</h2>
          <p className="text-[10px] text-slate-400 font-mono">{element.id.slice(0, 8)}...</p>
        </div>
        <button
          onClick={() => { removeElement(element.id); selectElement(null); }}
          className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
          title="Supprimer l'élément"
        >
          🗑
        </button>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">

        {/* Identité */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2 pt-1">Identité</p>
          <Field label="Libellé">
            <TextInput
              value={element.label ?? ''}
              onChange={(v) => update('label', v)}
            />
          </Field>
        </section>

        {/* Géométrie */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2 pt-2">Géométrie</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="X">
              <TextInput type="number" value={Math.round(element.x)} step={20}
                onChange={(v) => update('x', parseFloat(v))} />
            </Field>
            <Field label="Y">
              <TextInput type="number" value={Math.round(element.y)} step={20}
                onChange={(v) => update('y', parseFloat(v))} />
            </Field>
            <Field label="Largeur">
              <TextInput type="number" value={element.width} min={20} step={10}
                onChange={(v) => update('width', parseFloat(v))} />
            </Field>
            <Field label="Hauteur">
              <TextInput type="number" value={element.height} min={20} step={10}
                onChange={(v) => update('height', parseFloat(v))} />
            </Field>
          </div>
          <Field label="Rotation (°)">
            <TextInput type="number" value={element.rotation ?? 0} min={0} max={360} step={45}
              onChange={(v) => update('rotation', parseFloat(v))} />
          </Field>
        </section>

        {/* Apparence */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2 pt-2">Apparence</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Couleur">
              <TextInput type="color" value={element.color ?? '#3b82f6'}
                onChange={(v) => update('color', v)} />
            </Field>
            <Field label="Contour">
              <TextInput type="color" value={element.strokeColor ?? '#1e3a5f'}
                onChange={(v) => update('strokeColor', v)} />
            </Field>
          </div>
          <Field label="Épaisseur contour">
            <TextInput type="number" value={element.strokeWidth ?? 1} min={0} max={10} step={0.5}
              onChange={(v) => update('strokeWidth', parseFloat(v))} />
          </Field>
        </section>

        {/* Propriétés électriques spécifiques */}
        {element.props && Object.keys(element.props).length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2 pt-2">
              Caractéristiques électriques
            </p>
            {Object.entries(element.props).map(([key, val]) => (
              <Field key={key} label={key}>
                <TextInput
                  value={String(val ?? '')}
                  onChange={(v) => updateProp(key, v)}
                />
              </Field>
            ))}
          </section>
        )}
      </div>

      {/* Footer — touches rapides */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
        <p className="text-[9px] text-slate-300 text-center">
          Suppr = effacer • Ctrl+Z = annuler
        </p>
      </div>
    </div>
  );
});

SchematicInspector.displayName = 'SchematicInspector';
