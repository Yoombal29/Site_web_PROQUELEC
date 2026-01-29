import React, { useState } from 'react';
import { GraphNode } from '@/stores/GraphStore';
import { appStore } from '@/app/AppStore';

interface NodeParameterEditorProps {
  node: GraphNode;
  onClose: () => void;
}

export const NodeParameterEditor: React.FC<NodeParameterEditorProps> = ({ node, onClose }) => {
  const [values, setValues] = useState(node.properties || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    // Vérifier que le nœud existe toujours
    if (!appStore.nodeExists(node.id)) {
      alert(`Erreur: Le nœud ${node.type} (${node.id}) n'existe plus.\nIl a peut-être été supprimé par une autre action.`);
      onClose();
      return;
    }

    // Confirmation avant sauvegarde
    const confirmed = window.confirm(
      `Confirmer la sauvegarde des paramètres du nœud ${node.type} ?\n\n` +
      `Identifiant: ${values.id || node.id}\n` +
      `Type: ${node.type}\n\n` +
      `Cette action mettra à jour les calculs automatiquement.`
    );

    if (!confirmed) return;

    setIsSaving(true);
    try {
      // Sauvegarder via AppStore
      appStore.updateNodeProperties(node.id, values);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Le nœud n\'existe plus ou a été modifié.');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    // Vérifier que le nœud existe toujours
    if (!appStore.nodeExists(node.id)) {
      alert(`Erreur: Le nœud ${node.type} (${node.id}) n'existe plus.\nIl a peut-être déjà été supprimé.`);
      onClose();
      return;
    }

    // Confirmation de suppression
    const confirmed = window.confirm(
      `⚠️ ATTENTION: Suppression définitive du nœud !\n\n` +
      `Nœud: ${node.type} (${values.id || node.id})\n` +
      `Position: (${node.position.x}, ${node.position.y})\n\n` +
      `Cette action supprimera:\n` +
      `• Le nœud et tous ses paramètres\n` +
      `• Toutes les connexions câblées\n` +
      `• Les calculs associés\n\n` +
      `Cette action est IRRÉVERSIBLE.\n\n` +
      `Confirmer la suppression ?`
    );

    if (!confirmed) return;

    // Deuxième confirmation pour les nœuds critiques
    if (node.type === 'SOURCE') {
      const doubleConfirmed = window.confirm(
        `🚨 SUPPRESSION D'UNE SOURCE ÉLECTRIQUE 🚨\n\n` +
        `Vous êtes sur le point de supprimer une SOURCE électrique !\n` +
        `Cela peut rendre le schéma électrique incohérent.\n\n` +
        `DERNIÈRE CHANCE: Êtes-vous absolument certain ?`
      );
      if (!doubleConfirmed) return;
    }

    setIsDeleting(true);
    try {
      // Supprimer via AppStore
      appStore.removeNode(node.id);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression. Le nœud n\'existe plus ou ne peut pas être supprimé.');
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const renderEditor = () => {
    switch (node.type) {
      case 'SOURCE':
        return <SourceEditor values={values} onChange={setValues} />;
      case 'DISTRIBUTION':
        return <DistributionEditor values={values} onChange={setValues} />;
      case 'PROTECTION':
        return <ProtectionEditor values={values} onChange={setValues} />;
      case 'GROUND':
        return <GroundEditor values={values} onChange={setValues} />;
      case 'TRANSFORMATION':
        return <TransformationEditor values={values} onChange={setValues} />;
      default:
        return <GenericEditor values={values} onChange={setValues} />;
    }
  };

  return (
    <div className="space-y-4">
      {renderEditor()}

      {/* Bouton de suppression */}
      <div className="pt-2 border-t border-red-600">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all"
        >
          {isDeleting ? '⏳ Suppression...' : '🗑️ Supprimer le nœud'}
        </button>
      </div>

      {/* Boutons principaux */}
      <div className="flex gap-2 pt-2 border-t border-slate-600">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all"
        >
          {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-lg transition-all"
        >
          ❌ Annuler
        </button>
      </div>
    </div>
  );
};

// Éditeur pour les nœuds SOURCE
const SourceEditor: React.FC<{ values: any; onChange: (v: any) => void }> = ({ values, onChange }) => (
  <div className="space-y-3">
    <div>
      <label className="text-slate-300 text-sm font-medium">Identifiant source</label>
      <input
        type="text"
        value={values.id || ''}
        onChange={(e) => onChange({ ...values, id: e.target.value })}
        placeholder="SRC-01"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Type de source</label>
      <select
        value={values.sourceType || 'public'}
        onChange={(e) => onChange({ ...values, sourceType: e.target.value })}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="public">Réseau public</option>
        <option value="generator">Groupe électrogène</option>
        <option value="ups">Onduleur / UPS</option>
        <option value="substation">Poste BT</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Tension nominale</label>
      <select
        value={values.voltage || 230}
        onChange={(e) => onChange({ ...values, voltage: parseInt(e.target.value) })}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value={230}>230 V</option>
        <option value={400}>400 V</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Type de réseau</label>
      <select
        value={values.networkType || 'single'}
        onChange={(e) => onChange({ ...values, networkType: e.target.value })}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="single">Monophasé</option>
        <option value="three">Triphasé</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Régime de neutre</label>
      <select
        value={values.neutralRegime || 'TT'}
        onChange={(e) => onChange({ ...values, neutralRegime: e.target.value })}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="TT">TT</option>
        <option value="TN-S">TN-S</option>
        <option value="TN-C">TN-C</option>
        <option value="IT">IT</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Puissance disponible (kVA)</label>
      <input
        type="number"
        value={values.maxPower || 100}
        onChange={(e) => onChange({ ...values, maxPower: parseFloat(e.target.value) })}
        placeholder="100"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="hasGround"
        checked={values.hasGround || true}
        onChange={(e) => onChange({ ...values, hasGround: e.target.checked })}
        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
      />
      <label htmlFor="hasGround" className="text-slate-300 text-sm">Terre associée</label>
    </div>
  </div>
);

// Éditeur pour les nœuds DISTRIBUTION
const DistributionEditor: React.FC<{ node: GraphNode }> = ({ node }) => (
  <div className="space-y-3">
    <div>
      <label className="text-slate-300 text-sm font-medium">Nom du tableau</label>
      <input
        type="text"
        defaultValue={node.params.name || ''}
        placeholder="TGBT-01"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Type</label>
      <select
        defaultValue={node.params.distributionType || 'tgbt'}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="tgbt">TGBT</option>
        <option value="division">Tableau divisionnaire</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Tension assignée (V)</label>
      <input
        type="number"
        defaultValue={node.params.assignedVoltage || 230}
        placeholder="230"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="hasGroundConnection"
        defaultChecked={node.params.hasGroundConnection !== false}
        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
      />
      <label htmlFor="hasGroundConnection" className="text-slate-300 text-sm">Liaison à la terre</label>
    </div>
  </div>
);

// Éditeur pour les nœuds PROTECTION
const ProtectionEditor: React.FC<{ node: GraphNode }> = ({ node }) => (
  <div className="space-y-3">
    <div>
      <label className="text-slate-300 text-sm font-medium">Type de protection</label>
      <select
        defaultValue={node.params.protectionType || 'breaker'}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="breaker">Disjoncteur</option>
        <option value="fuse">Fusible</option>
        <option value="rcd">Différentiel</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Calibre (A)</label>
      <input
        type="number"
        defaultValue={node.params.calibre || 16}
        placeholder="16"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Courbe</label>
      <select
        defaultValue={node.params.curve || 'C'}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Pouvoir de coupure (kA)</label>
      <input
        type="number"
        defaultValue={node.params.breakCapacity || 6}
        placeholder="6"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  </div>
);

// Éditeur pour les nœuds GROUND
const GroundEditor: React.FC<{ node: GraphNode }> = ({ node }) => (
  <div className="space-y-3">
    <div>
      <label className="text-slate-300 text-sm font-medium">Type de terre</label>
      <select
        defaultValue={node.params.groundType || 'main'}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="main">Terre principale</option>
        <option value="local">Terre locale</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Résistance de terre (Ω)</label>
      <input
        type="number"
        step="0.1"
        defaultValue={node.params.resistance || 10}
        placeholder="10"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Nœuds reliés</label>
      <input
        type="text"
        defaultValue={node.params.connectedNodes || ''}
        placeholder="SRC-01, TGBT-01"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  </div>
);

// Éditeur pour les nœuds TRANSFORMATION
const TransformationEditor: React.FC<{ node: GraphNode }> = ({ node }) => (
  <div className="space-y-3">
    <div>
      <label className="text-slate-300 text-sm font-medium">Type de transformation</label>
      <select
        defaultValue={node.params.transformationType || 'transformer'}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="transformer">Transformateur</option>
        <option value="rectifier">Redresseur</option>
        <option value="variator">Variateur</option>
      </select>
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Tension amont (V)</label>
      <input
        type="number"
        defaultValue={node.params.inputVoltage || 400}
        placeholder="400"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Tension aval (V)</label>
      <input
        type="number"
        defaultValue={node.params.outputVoltage || 230}
        placeholder="230"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Rendement (%)</label>
      <input
        type="number"
        step="0.1"
        defaultValue={node.params.efficiency || 95}
        placeholder="95"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  </div>
);

// Éditeur générique pour les types non implémentés
const GenericEditor: React.FC<{ node: GraphNode }> = ({ node }) => (
  <div className="space-y-3">
    <div className="text-yellow-400 text-sm bg-yellow-900/20 p-3 rounded-lg border border-yellow-600/30">
      ⚠️ Éditeur pour le type <strong>{node.type}</strong> en cours de développement
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Nom</label>
      <input
        type="text"
        defaultValue={node.params.name || ''}
        placeholder="Nom du composant"
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>

    <div>
      <label className="text-slate-300 text-sm font-medium">Description</label>
      <textarea
        defaultValue={node.params.description || ''}
        placeholder="Description du composant"
        rows={3}
        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  </div>
);