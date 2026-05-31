/**
 * SchematicSidebar.tsx
 * Barre latérale du moteur schématique.
 *
 * Utilise @dnd-kit/core pour glisser des éléments depuis la liste HTML
 * vers le canvas Konva. La communication avec le canvas se fait via
 * l'événement personnalisé "schema:drop" pour éviter tout couplage React.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { SYMBOL_CATALOG, SymbolCatalogItem } from './symbols/electricalSymbols';
import { useSchematicStore } from '@/stores/useSchematicStore';
import type { ElementType } from '@/stores/useSchematicStore';

/* =========================================================
   ITEM DRAGGABLE (depuis la sidebar)
========================================================= */

interface DraggableSymbolItemProps {
  item: SymbolCatalogItem;
}

const TYPE_COLORS: Record<string, string> = {
  rect: 'bg-blue-500',
  circle: 'bg-purple-500',
  text: 'bg-gray-500',
  image: 'bg-gray-300',
  wire: 'bg-gray-800',
  switch: 'bg-amber-500',
  breaker: 'bg-red-500',
  socket: 'bg-emerald-500',
  light: 'bg-yellow-400',
  motor: 'bg-indigo-500',
  transformer: 'bg-pink-500',
  capacitor: 'bg-cyan-500',
  resistor: 'bg-lime-500',
  ground: 'bg-gray-400',
  bus: 'bg-blue-800',
};

const TYPE_ICONS: Record<string, string> = {
  rect: '▭', circle: '◯', text: 'T', image: '🖼', wire: '〰',
  switch: 'SW', breaker: '⚡', socket: '🔌', light: '💡',
  motor: 'M', transformer: 'TR', capacitor: '⊣', resistor: 'R',
  ground: '⏚', bus: '═',
};

const DraggableSymbolItem: React.FC<DraggableSymbolItemProps> = React.memo(({ item }) => {
  const data = useMemo(() => ({ type: item.type, catalogItem: item }), [item.type, item]);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data,
  });

  if (process.env.NODE_ENV === 'development') console.count(`DraggableSymbolItem ${item.type}`);

  const colorClass = TYPE_COLORS[item.type] ?? 'bg-slate-400';
  const icon = TYPE_ICONS[item.type] ?? '?';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab select-none
        border border-transparent hover:border-slate-200 hover:bg-slate-50
        transition-all duration-150 group
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
      `}
    >
      <div className={`
        w-9 h-9 rounded-md ${colorClass} flex items-center justify-center
        text-white text-sm font-bold flex-shrink-0
        shadow-sm group-hover:shadow-md transition-shadow
      `}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{item.label}</p>
        <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
      </div>
    </div>
  );
});

/* =========================================================
   SIDEBAR PRINCIPALE
========================================================= */

export const SchematicSidebar: React.FC = React.memo(() => {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(SYMBOL_CATALOG.map((c) => [c.name, true]))
  );

  const elementCount = useSchematicStore((state) => Object.keys(state.elements).length);
  const clearAll = useSchematicStore((state) => state.clearAll);
  const undo = useSchematicStore((state) => state.undo);
  const redo = useSchematicStore((state) => state.redo);
  const past = useSchematicStore((state) => state.past);
  const future = useSchematicStore((state) => state.future);

  const toggleCategory = useCallback((name: string) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const filteredCatalog = SYMBOL_CATALOG.map((cat) => ({
    ...cat,
    items: search
      ? cat.items.filter(
          (item) =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        )
      : cat.items,
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 w-[220px] flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Bibliothèque</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">{elementCount} élément{elementCount > 1 ? 's' : ''} sur le canvas</p>
      </div>

      {/* Recherche */}
      <div className="px-3 py-2 border-b border-slate-100">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 
                     focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
        />
      </div>

      {/* Actions undo/redo */}
      <div className="flex gap-1 px-3 py-2 border-b border-slate-100">
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="flex-1 text-xs py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 
                     disabled:cursor-not-allowed transition-colors font-medium text-slate-600"
          title="Annuler (Ctrl+Z)"
        >
          ↩ Annuler
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="flex-1 text-xs py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 
                     disabled:cursor-not-allowed transition-colors font-medium text-slate-600"
          title="Rétablir (Ctrl+Y)"
        >
          ↪ Rétablir
        </button>
      </div>

      {/* Catalogue */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredCatalog.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-8">Aucun résultat</p>
        ) : (
          filteredCatalog.map((category) => (
            <div key={category.name} className="mb-1">
              {/* En-tête catégorie */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left
                           hover:bg-slate-50 transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>{category.icon}</span>
                  {category.name}
                </span>
                <span className="text-slate-300 text-xs">
                  {expandedCategories[category.name] ? '▴' : '▾'}
                </span>
              </button>

              {/* Items */}
              {expandedCategories[category.name] && (
                <div className="px-1">
                  {category.items.map((item) => (
                    <DraggableSymbolItem key={item.type} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer — Tout effacer */}
      {elementCount > 0 && (
        <div className="px-3 py-2 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm(`Effacer les ${elementCount} éléments ?`)) clearAll();
            }}
            className="w-full text-xs py-1.5 rounded-md border border-red-200 text-red-500
                       hover:bg-red-50 transition-colors"
          >
            🗑 Tout effacer
          </button>
        </div>
      )}
    </div>
  );
});

SchematicSidebar.displayName = 'SchematicSidebar';
