import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GraphStore } from '@/stores/GraphStore';
import { EditorManager } from '@/managers/EditorManager';
import { TronçonEngine } from '@/engines/TronçonEngine';
import ValidationEngine, { ValidationResult } from '@/engines/ValidationEngine';
import { SchematicCanvas } from '@/components/canvas/SchematicCanvas';
import { rubriqueRegistry } from '@/services/RubriqueRegistry';
import type { RubriqueSchema } from '@/types/Rubrique';
import { ChevronDown, AlertCircle, CheckCircle2, Zap, RotateCcw, RotateCw } from 'lucide-react';
import { ChargeEditor } from '@/components/tools/ChargeEditor';
import { PhaseBalanceDisplay } from '@/components/tools/PhaseBalanceDisplay';
import { CableRecommendationsDisplay } from '@/components/tools/CableRecommendationsDisplay';

/**
 * SchemaBuilder Page - Phase 1 Graphical Schema Editor
 * 
 * Futuristic, robust, elegant editor for electrical schemas.
 * Rubrique-aware with real-time validation and calculation engine.
 */
export default function SchemaBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize the centralized graph store (state management)
  const [graphStore] = useState(() => new GraphStore());
  const [editorManager] = useState(() => new EditorManager(graphStore));
  const [undoRedoState, setUndoRedoState] = useState({ canUndo: false, canRedo: false });
  
  // Rubrique state
  const [rubrique, setRubrique] = useState<RubriqueSchema | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [rubriqueError, setRubriqueError] = useState<string | null>(null);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [lastAction, setLastAction] = useState<'validate' | 'calculate' | null>(null);
  
  // Validation temps réel
  const [realTimeValidations, setRealTimeValidations] = useState<ValidationResult[]>([]);

  // Nœud sélectionné pour l'édition des charges
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Load rubrique from URL parameter
  useEffect(() => {
    const rubriqueParam = searchParams.get('rubrique');
    
    if (rubriqueParam) {
      const selectedRubrique = rubriqueRegistry.get(rubriqueParam as any);
      if (selectedRubrique) {
        setRubrique(selectedRubrique);
        setRubriqueError(null);
      } else {
        setRubriqueError(`Rubrique "${rubriqueParam}" non trouvée`);
        setRubrique(null);
      }
    }
  }, [searchParams]);

  // Subscribe to EditorManager changes to update Undo/Redo state
  useEffect(() => {
    const unsubscribe = editorManager.subscribe((event) => {
      setUndoRedoState({
        canUndo: editorManager.canUndo(),
        canRedo: editorManager.canRedo()
      });
      
      // Mettre à jour les validations temps réel
      const validations = ValidationEngine.validateGraph(graphStore);
      setRealTimeValidations(validations);
    });

    return () => {
      unsubscribe();
    };
  }, [editorManager, graphStore]);

  // Validation temps réel initiale
  useEffect(() => {
    const validations = ValidationEngine.validateGraph(graphStore);
    setRealTimeValidations(validations);
  }, [graphStore]);

  // Gestion des charges
  const handleAddCharge = (nodeId: string, chargeData: any) => {
    graphStore.addCharge(nodeId, chargeData);
  };

  const handleUpdateCharge = (nodeId: string, chargeId: string, updates: any) => {
    graphStore.updateCharge(nodeId, chargeId, updates);
  };

  const handleRemoveCharge = (nodeId: string, chargeId: string) => {
    graphStore.removeCharge(nodeId, chargeId);
  };

  const selectedNode = selectedNodeId ? graphStore.nodes.get(selectedNodeId) : null;
  const isReceptorSelected = selectedNode?.type === 'RECEPTOR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/40 border-b border-slate-700/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          {/* Top Navigation Bar */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Éditeur Schéma Graphique
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Phase 1 • NF C 15-100 Conforme</p>
              </div>
            </div>
            
            {/* Undo/Redo Buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => editorManager.undo()}
                disabled={!undoRedoState.canUndo}
                className="p-2 text-slate-300 hover:text-white bg-slate-700/40 hover:bg-slate-600/60 border border-slate-600/40 rounded-lg transition-all duration-200 hover:border-slate-500/60 disabled:opacity-30 disabled:cursor-not-allowed group"
                title="Annuler (Ctrl+Z)"
              >
                <RotateCcw className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => editorManager.redo()}
                disabled={!undoRedoState.canRedo}
                className="p-2 text-slate-300 hover:text-white bg-slate-700/40 hover:bg-slate-600/60 border border-slate-600/40 rounded-lg transition-all duration-200 hover:border-slate-500/60 disabled:opacity-30 disabled:cursor-not-allowed group"
                title="Rétablir (Ctrl+Y)"
              >
                <RotateCw className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/rubrique-selector')}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/40 hover:bg-slate-600/60 border border-slate-600/40 rounded-lg transition-all duration-200 hover:border-slate-500/60 group"
                title="Retour au sélecteur de rubrique"
              >
                <span className="group-hover:scale-110 inline-block transition-transform">🔄</span> Changer
              </button>
              <button
                onClick={() => navigate('/outils')}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/40 hover:bg-slate-600/60 border border-slate-600/40 rounded-lg transition-all duration-200 hover:border-slate-500/60"
                title="Retourner à la page des outils"
              >
                ← Outils
              </button>
            </div>
            
            {/* Alertes de validation temps réel */}
            {realTimeValidations.length > 0 && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">
                    {ValidationEngine.getValidationStats(realTimeValidations).errors} erreurs, 
                    {ValidationEngine.getValidationStats(realTimeValidations).warnings} avertissements
                  </span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {realTimeValidations.slice(0, 5).map((validation, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        validation.severity === 'error' ? 'bg-red-500' :
                        validation.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-slate-300 flex-1">{validation.message}</span>
                      {validation.fixable && (
                        <button 
                          onClick={() => {
                            ValidationEngine.applyFix(graphStore, validation);
                            // Rafraîchir les validations
                            const newValidations = ValidationEngine.validateGraph(graphStore);
                            setRealTimeValidations(newValidations);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          Corriger
                        </button>
                      )}
                    </div>
                  ))}
                  {realTimeValidations.length > 5 && (
                    <div className="text-xs text-slate-400">
                      ... et {realTimeValidations.length - 5} autres problèmes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rubrique Info Bar - Glassmorphic */}
          {rubrique && !rubriqueError && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rubrique.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-green-300">
                      {rubrique.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      v{rubrique.version} • <span className="text-green-400 font-mono">{rubrique.maturity}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-300">📦</span> {graphStore.nodes.size} objets
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-300">🔌</span> {graphStore.edges.size} liens
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {rubriqueError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{rubriqueError}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Guide - Minimal Design */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div>
              <p className="text-sm text-slate-300 font-medium">Glissez les objets • Liez les connexions • Validez avec un clic</p>
              <p className="text-xs text-slate-500 mt-1">Clic droit + drag pour connexion • Double-clic pour éditer</p>
            </div>
          </div>
        </div>

        {/* Canvas and Properties Panel - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Canvas - Main Area */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl bg-slate-900/30 backdrop-blur-sm">
            <SchematicCanvas
              graphStore={graphStore}
              width={1400}
              height={700}
              onNodeSelect={setSelectedNodeId}
              onEdgeSelect={() => setSelectedNodeId(null)} // Désélectionner quand on clique sur une arête
            />
          </div>

          {/* Properties Panel - Right Side */}
          <div className="rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl bg-slate-900/30 backdrop-blur-sm">
            <div className="p-6 h-full overflow-y-auto">
              {isReceptorSelected && selectedNode ? (
                <ChargeEditor
                  nodeId={selectedNodeId!}
                  charges={selectedNode.charges || []}
                  onAddCharge={(chargeData) => handleAddCharge(selectedNodeId!, chargeData)}
                  onUpdateCharge={(chargeId, updates) => handleUpdateCharge(selectedNodeId!, chargeId, updates)}
                  onRemoveCharge={(chargeId) => handleRemoveCharge(selectedNodeId!, chargeId)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 rounded-full bg-slate-800/50 mb-4">
                    <Zap className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    Éditeur de Charges
                  </h3>
                  <p className="text-sm text-slate-500">
                    Sélectionnez un nœud récepteur pour définir ses charges électriques
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Panel */}
          <div className="rounded-xl border border-slate-700/50 p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-slate-600/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Statistiques</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
                <span>Objets</span>
                <span className="text-green-400 font-mono font-semibold">{graphStore.nodes.size}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
                <span>Connexions</span>
                <span className="text-blue-400 font-mono font-semibold">{graphStore.edges.size}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
                <span>Hash VCNG</span>
                <span className="text-cyan-400 font-mono text-xs">{graphStore.getHash().substring(0, 6)}...</span>
              </div>
            </div>
          </div>

          {/* Capabilities Panel */}
          <div className="rounded-xl border border-slate-700/50 p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-slate-600/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <span className="text-xl">📦</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Capacités</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/30 border border-slate-700/30">
                <span className="text-orange-400">●</span>
                <span><span className="text-orange-300 font-semibold">6 catégories</span> d'objets</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/30 border border-slate-700/30">
                <span className="text-purple-400">●</span>
                <span><span className="text-purple-300 font-semibold">22 objets</span> normatifs</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/30 border border-slate-700/30">
                <span className="text-cyan-400">●</span>
                <span>Norme <span className="text-cyan-300 font-semibold">NF C 15-100</span></span>
              </div>
            </div>
          </div>
          
          {/* Rubrique Actions - Primary CTA */}
          <div className="rounded-xl border border-blue-500/30 p-5 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-blue-300">Analyse Rubrique</h3>
            </div>
            <div className="space-y-2 flex flex-col">
              <button
                onClick={() => {
                  if (rubrique) {
                    const validation = rubrique.validateGraph({
                      nodes: graphStore.nodes,
                      edges: graphStore.edges,
                      getHash: () => graphStore.getHash()
                    });
                    setValidationResult(validation);
                    setLastAction('validate');
                    setShowResultsPanel(true);
                  }
                }}
                disabled={!rubrique}
                className="w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                style={{
                  background: rubrique ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' : '#475569',
                  color: rubrique ? 'white' : '#94a3b8',
                  cursor: rubrique ? 'pointer' : 'not-allowed',
                  opacity: rubrique ? 1 : 0.5
                }}
              >
                <span className="group-hover:scale-125 transition-transform">🔍</span> Valider
              </button>
              <button
                onClick={() => {
                  if (rubrique) {
                    // Récupérer et calculer les tronçons avec EditorManager
                    const results = editorManager.calculateTronçons();
                    
                    if (results && results.tronçons && results.tronçons.length > 0) {
                      setCalculationResult({
                        tronçons: results.tronçons,
                        verdict: results.verdict,
                        chuteMax: results.chuteMax,
                        puissanceMax: results.puissanceMax,
                        issues: results.issues,
                        metrics: [
                          {
                            name: 'Chute max (% 230V)',
                            value: results.chuteMax.toFixed(2),
                            unit: '%'
                          },
                          {
                            name: 'Puissance max dissipée',
                            value: results.puissanceMax.toFixed(2),
                            unit: 'W'
                          },
                          {
                            name: 'Tronçons analysés',
                            value: results.tronçons.length,
                            unit: ''
                          },
                          {
                            name: 'Problèmes détectés',
                            value: results.issues.length,
                            unit: ''
                          }
                        ]
                      });
                    } else {
                      setCalculationResult({
                        error: 'Aucun tronçon détecté. Créez au moins une connexion avec paramètres (section, longueur, courant).'
                      });
                    }
                    
                    setLastAction('calculate');
                    setShowResultsPanel(true);
                  }
                }}
                disabled={!rubrique}
                className="w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                style={{
                  background: rubrique ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' : '#475569',
                  color: rubrique ? 'white' : '#94a3b8',
                  cursor: rubrique ? 'pointer' : 'not-allowed',
                  opacity: rubrique ? 1 : 0.5
                }}
              >
                <span className="group-hover:scale-125 transition-transform">📐</span> Calculer (NF C 15-100)
              </button>
            </div>
          </div>
        </div>
          
          {/* Results Panel - Elegant Display */}
          {showResultsPanel && (lastAction === 'validate' && validationResult) && (
            <div className={`mt-8 rounded-xl border backdrop-blur-sm p-6 transition-all duration-300 ${
              validationResult.isValid 
                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30' 
                : 'bg-gradient-to-br from-red-900/20 to-rose-900/20 border-red-500/30'
            }`}>
              <div className="flex items-start gap-4">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-3 ${
                    validationResult.isValid ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {validationResult.isValid ? '✅ Validation réussie' : '⚠️ Erreurs détectées'}
                  </h3>
                  
                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-red-300 mb-2 uppercase tracking-wide">Erreurs</p>
                      <ul className="space-y-1">
                        {validationResult.errors.map((err: any, i: number) => (
                          <li key={i} className="text-xs text-red-200 pl-4 border-l-2 border-red-500/30">
                            {err.message || String(err)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validationResult.warnings && validationResult.warnings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-yellow-300 mb-2 uppercase tracking-wide">Avertissements</p>
                      <ul className="space-y-1">
                        {validationResult.warnings.map((warn: any, i: number) => (
                          <li key={i} className="text-xs text-yellow-200 pl-4 border-l-2 border-yellow-500/30">
                            {warn.message || String(warn)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Calculation Results - Elegant Display */}
          {showResultsPanel && (lastAction === 'calculate' && calculationResult) && (
            <div className="mt-8 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-white">Analyse NF C 15-100 (Articles 523/525)</h3>
                  <p className="text-xs text-slate-400">Calcul normé de chute de tension et thermique</p>
                </div>
              </div>
              
              {calculationResult.error ? (
                <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-300 text-sm mb-6">
                  ⚠️ {calculationResult.error}
                </div>
              ) : (
                <>
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                    {calculationResult.metrics && calculationResult.metrics.map((metric: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                        <p className="text-xs text-slate-400 mb-2 font-medium">{metric.name}</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {metric.value}<span className="text-xs text-slate-400 ml-1">{metric.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Verdict Section */}
                  {calculationResult.verdict && (
                    <div className={`p-5 rounded-lg font-semibold text-center border transition-all mb-6 ${
                      calculationResult.verdict === 'CONFORME'
                        ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/40 text-green-300'
                        : calculationResult.verdict === 'AVERTISSEMENT'
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/40 text-yellow-300'
                        : 'bg-gradient-to-r from-red-900/40 to-rose-900/40 border-red-500/40 text-red-300'
                    }`}>
                      {calculationResult.verdict === 'CONFORME' && '✅ CONFORME — Tous les critères normatifs sont respectés'}
                      {calculationResult.verdict === 'AVERTISSEMENT' && '⚠️ AVERTISSEMENT — Certains critères approchent les limites'}
                      {calculationResult.verdict === 'NON_CONFORME' && '❌ NON CONFORME — Les limites normatives sont dépassées'}
                    </div>
                  )}

                  {/* Tronçons Details */}
                  {calculationResult.tronçons && calculationResult.tronçons.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Détails par tronçon</p>
                      {calculationResult.tronçons.map((tronçon: any, i: number) => (
                        <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-cyan-400 font-semibold">Tronçon {i + 1}: {tronçon.name || tronçon.id}</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              tronçon.resultats?.conformity === 'CONFORME'
                                ? 'bg-green-900/50 text-green-300 border border-green-700'
                                : tronçon.resultats?.conformity === 'AVERTISSEMENT'
                                ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                                : 'bg-red-900/50 text-red-300 border border-red-700'
                            }`}>
                              {tronçon.resultats?.conformity || 'N/A'}
                            </span>
                          </div>
                          
                          {/* Paramètres d'entrée */}
                          <div className="grid grid-cols-2 gap-2 text-slate-400 border-b border-slate-700 pb-2">
                            <div>📏 Longueur: <span className="text-slate-300 font-mono">{tronçon.longueur?.toFixed(1) || '-'} m</span></div>
                            <div>📌 Section: <span className="text-slate-300 font-mono">{tronçon.section || '-'} mm²</span></div>
                            <div>⚡ Courant: <span className="text-slate-300 font-mono">{tronçon.courant?.toFixed(1) || '-'} A</span></div>
                            <div>🔧 Matériau: <span className="text-slate-300 font-mono">{tronçon.materiau || '-'}</span></div>
                          </div>
                          
                          {/* Résultats de calcul */}
                          <div className="grid grid-cols-2 gap-2 text-slate-400">
                            <div>🔄 Chute tension: <span className="text-slate-300 font-mono">{tronçon.resultats?.chuteTension?.toFixed(2) || '-'} V</span></div>
                            <div>📊 Chute %: <span className="text-slate-300 font-mono">{tronçon.resultats?.chuteTensionPercent?.toFixed(2) || '-'} %</span></div>
                            <div>💡 Puissance: <span className="text-slate-300 font-mono">{tronçon.resultats?.puissance?.toFixed(1) || '-'} W</span></div>
                            <div>🧮 Résistance: <span className="text-slate-300 font-mono">{tronçon.resultats?.resistance?.toFixed(4) || '-'} Ω</span></div>
                          </div>
                          
                          {/* Issues si présentes */}
                          {tronçon.resultats?.issues && tronçon.resultats.issues.length > 0 && (
                            <div className="text-red-300 text-xs border-t border-red-800 pt-2">
                              ⚠️ Issues: {tronçon.resultats.issues.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Équilibrage des phases (si disponible) */}
                  {calculationResult.equilibragePhases && (
                    <div className="mt-6">
                      <PhaseBalanceDisplay phaseBalance={calculationResult.equilibragePhases} />
                    </div>
                  )}

                  {/* Recommandations de câbles (si disponibles) */}
                  {calculationResult.recommandationsCables && calculationResult.recommandationsCables.length > 0 && (
                    <div className="mt-6">
                      <CableRecommendationsDisplay recommandations={calculationResult.recommandationsCables} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Debug Console */}
          <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🔧</span>
              <h3 className="text-slate-100 font-semibold text-sm">Console Debug</h3>
            </div>
            <code className="text-xs text-slate-400 block whitespace-pre-wrap font-mono bg-slate-950/50 p-3 rounded-lg border border-slate-700/30">
{`// Accédez au store depuis la console (F12)
window.__graphStore = graphStore;

// Exemples :
window.__graphStore.nodes.size       // Nombre d'objets
window.__graphStore.edges.size       // Nombre de connexions
window.__graphStore.getHash()        // Hash VCNG
window.__graphStore.serialize()      // Export JSON`}
            </code>
          </div>
        </main>
      </div>
    );
  }

