import React from 'react';
import { useEditor } from '@craftjs/core';

export const CraftSettingsPanel = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    const currentNodeId = selectedSet ? Array.from(selectedSet)[0] : null;
    let selected;

    if (currentNodeId && state.nodes[currentNodeId as string]) {
      const node = state.nodes[currentNodeId as string];
      selected = {
        id: currentNodeId,
        name: node.data.name,
        settings: node.related && node.related.settings,
        isDeletable: query.node(currentNodeId as string).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 p-4 h-full flex flex-col overflow-y-auto">
      <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">
        Propriétés {selected?.name ? `(${selected.name})` : ''}
      </h3>
      
      {selected ? (
        <div className="flex flex-col gap-4">
          {selected.settings ? (
            React.createElement(selected.settings)
          ) : (
            <p className="text-sm text-slate-500 italic">Aucune propriété modifiable pour ce bloc.</p>
          )}

          {selected.isDeletable && (
            <button
              onClick={() => {
                actions.delete(selected.id);
              }}
              className="mt-8 py-2 px-4 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 text-sm font-medium"
            >
              Supprimer le bloc
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">Sélectionnez un élément sur le canvas pour modifier ses propriétés.</p>
      )}
    </div>
  );
};
