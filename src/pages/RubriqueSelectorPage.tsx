/**
 * 📋 PAGE DE SÉLECTION DE RUBRIQUE
 * 
 * Point d'entrée pour choisir le type de schéma à créer.
 * Cette page s'affiche avant l'éditeur de schéma.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rubriqueRegistry } from '@/services/RubriqueRegistry';
import { RubriqueSchema } from '@/types/Rubrique';

export default function RubriqueSelectorPage() {
  const navigate = useNavigate();
  const [rubriques, setRubriques] = useState<RubriqueSchema[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Charger les rubriques disponibles
    const actives = rubriqueRegistry.getActive();
    setRubriques(actives);
    if (actives.length > 0) {
      setSelectedId(actives[0].id);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleStart = () => {
    if (selectedId) {
      // Passer le type de rubrique en paramètre
      navigate(`/schema-builder?rubrique=${selectedId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">⚡ PROQUELEC Schema</h1>
          <p className="text-xl text-slate-400">Plateforme de schématisation électrique modulaire</p>
          <p className="text-sm text-slate-500 mt-2">Choisissez le type de schéma à créer</p>
        </div>

        {/* Grille de rubriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {rubriques.map((rubrique) => (
            <div
              key={rubrique.id}
              onClick={() => handleSelect(rubrique.id)}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-105 ${
                selectedId === rubrique.id
                  ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/30'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
            >
              {/* Icône */}
              <div className="text-4xl mb-4">{rubrique.icon}</div>

              {/* Nom */}
              <h3 className="text-lg font-bold text-white mb-2">{rubrique.name}</h3>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-4">{rubrique.description}</p>

              {/* Badge de statut */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                  v{rubrique.version}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold ${
                    rubrique.maturity === 'STABLE'
                      ? 'bg-green-900/30 text-green-300'
                      : rubrique.maturity === 'BETA'
                      ? 'bg-yellow-900/30 text-yellow-300'
                      : 'bg-red-900/30 text-red-300'
                  }`}
                >
                  {rubrique.maturity}
                </span>
              </div>

              {/* Checkmark si sélectionné */}
              {selectedId === rubrique.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              )}
            </div>
          ))}

          {/* Card vide pour rubriques futures */}
          {rubriques.length < 6 && (
            <div className="p-6 rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-center">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm text-slate-400">Rubriques additionnelles à venir</p>
              <p className="text-xs text-slate-500 mt-2">Extension en cours de développement</p>
            </div>
          )}
        </div>

        {/* Informations sur la rubrique sélectionnée */}
        {selectedId && (
          <div className="mb-8 p-6 rounded-lg bg-slate-800 border border-slate-700">
            {rubriques
              .filter((r) => r.id === selectedId)
              .map((rubrique) => (
                <div key={rubrique.id}>
                  <h4 className="text-lg font-bold text-white mb-3">📋 Détails de la rubrique</h4>

                  {/* Références normatives */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-300 mb-2">🏛️ Références normatives :</p>
                    <ul className="text-xs text-slate-400 space-y-1 pl-4">
                      {rubrique.normativeReferences.map((ref, idx) => (
                        <li key={idx}>
                          <strong>{ref.standard}</strong> - Articles {ref.articles.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Moteur */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-300 mb-2">⚙️ Moteur métier :</p>
                    <p className="text-xs text-slate-400">{rubrique.engine.name} v{rubrique.engine.version}</p>
                  </div>

                  {/* Capacités */}
                  <div>
                    <p className="text-sm font-semibold text-slate-300 mb-2">✨ Capacités :</p>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>
                        ✓ Calculs : {rubrique.engine.properties.supportsBatchCalculation ? 'Batch' : 'Simple'}
                      </li>
                      <li>✓ Scénarios : {rubrique.engine.properties.supportsScenarios ? 'Oui' : 'Non'}</li>
                      <li>
                        ✓ Comparaison : {rubrique.engine.properties.supportsComparison ? 'Oui' : 'Non'}
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Bouton d'action */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleStart}
            disabled={!selectedId}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              selectedId
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 cursor-pointer'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            🚀 Démarrer l'éditeur
          </button>

          <button
            onClick={() => navigate('/outils')}
            className="px-8 py-4 rounded-lg font-bold text-lg bg-slate-700 hover:bg-slate-600 text-white transition-all"
            title="Retourner à la page des outils"
          >
            ← Retour aux outils
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-lg font-bold text-lg bg-slate-700 hover:bg-slate-600 text-white transition-all"
          >
            🏠 Accueil
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500">
            🔧 Plateforme modulaire PROQUELEC | Une rubrique = Un moteur métier indépendant
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Chaque rubrique peut être étendue sans impacter les autres. Créez votre propre rubrique en
            respectant le contrat <code className="text-slate-400">RubriqueSchema</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
