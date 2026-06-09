import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { registerSiteConfig, getSiteConfig, DEFAULT_SITE_ID } from '@/services/BuilderConfigService';
import { initializeHomepageModules } from '@/bootstrap/initializeHomepage';
import { Download, Upload, RotateCcw, Trash2, HelpCircle, Check, AlertCircle, Copy, Zap, Clock, BarChart3, Search } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: number;
  content: string;
  label: string;
}

export default function BuilderConfigAdmin() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('builderConfigHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ size: 0, keys: 0, depth: 0 });

  // Valider JSON temps réel
  useEffect(() => {
    if (!text.trim()) {
      setValidationError(null);
      setStats({ size: 0, keys: 0, depth: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setValidationError(null);
      
      // Calculer les stats
      const size = new Blob([text]).size;
      const keys = Object.keys(parsed).length;
      const depth = getDepth(parsed);
      setStats({ size, keys, depth });
    } catch (e: any) {
      setValidationError(e.message);
    }
  }, [text]);

  const getDepth = (obj: any, maxDepth = 0): number => {
    if (typeof obj !== 'object' || obj === null) return maxDepth;
    return Math.max(...Object.values(obj).map((v: any) => getDepth(v, maxDepth + 1)));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (validationError) {
      setMessage('✗ JSON invalide. Veuillez corriger les erreurs.');
      setMessageType('error');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      registerSiteConfig(DEFAULT_SITE_ID, parsed);
      initializeHomepageModules();
      
      // Ajouter à l'historique
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        content: text,
        label: `Config - ${new Date().toLocaleTimeString('fr-FR')}`
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('builderConfigHistory', JSON.stringify(newHistory));

      setMessage('✓ Configuration importée et appliquée. Rechargez la page pour voir les changements.');
      setMessageType('success');
      setTimeout(() => setMessage(null), 5000);
    } catch (e: any) {
      setMessage('✗ Erreur: ' + (e?.message || String(e)));
      setMessageType('error');
    }
  };

  const handleExport = () => {
    const cfg = getSiteConfig(DEFAULT_SITE_ID) || {};
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-config-${DEFAULT_SITE_ID}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const loadCurrent = () => {
    const cfg = getSiteConfig(DEFAULT_SITE_ID);
    setText(cfg ? JSON.stringify(cfg, null, 2) : '');
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setMessage('✓ JSON formaté');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setValidationError(e.message);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('✓ Copié au presse-papiers');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('✗ Erreur lors de la copie');
      setMessageType('error');
    }
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setText(item.content);
    setMessage(`✓ Configuration restaurée: ${item.label}`);
    setMessageType('success');
    setTimeout(() => setMessage(null), 3000);
  };

  const searchInJSON = () => {
    if (!searchTerm) return;
    try {
      const parsed = JSON.parse(text);
      const results = findInObject(parsed, searchTerm);
      if (results.length > 0) {
        setMessage(`✓ ${results.length} correspondance(s) trouvée(s): ${results.join(', ')}`);
        setMessageType('success');
      } else {
        setMessage('✗ Aucune correspondance trouvée');
        setMessageType('error');
      }
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      setValidationError(e.message);
    }
  };

  const findInObject = (obj: any, term: string, path = ''): string[] => {
    const results: string[] = [];
    const term_lower = term.toLowerCase();

    for (const key in obj) {
      const val = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (key.toLowerCase().includes(term_lower)) {
        results.push(currentPath);
      } else if (typeof val === 'string' && val.toLowerCase().includes(term_lower)) {
        results.push(`${currentPath}: "${val}"`);
      } else if (typeof val === 'object' && val !== null) {
        results.push(...findInObject(val, term, currentPath));
      }
    }

    return results;
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed));
      setMessage('✓ JSON minifié');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setValidationError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowHelp(!showHelp)}
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Comment utiliser cette configuration ?</h4>
          </div>
          <span className="text-blue-600">{showHelp ? '−' : '+'}</span>
        </div>
        
        {showHelp && (
          <div className="mt-3 text-sm text-blue-800 space-y-2 border-t border-blue-200 pt-3">
            <p><strong>📥 Charger config courante :</strong> Affiche la configuration actuelle du site en JSON</p>
            <p><strong>📤 Exporter config :</strong> Télécharge la configuration en fichier .json sur votre ordinateur</p>
            <p><strong>📋 Importer et appliquer :</strong> Charge le JSON modifié et l'applique immédiatement au site</p>
            <p><strong>🎨 Format/Minify :</strong> Formate ou compresse votre JSON</p>
            <p><strong>📋 Copier :</strong> Copie le JSON en presse-papiers</p>
            <p><strong>🔍 Recherche :</strong> Cherche dans les clés et valeurs du JSON</p>
            <p><strong>⏰ Historique :</strong> Restaure les 10 dernières configurations</p>
            <p className="text-blue-700 italic mt-3">💡 Conseil : Exportez d'abord, modifiez le JSON localement, puis importez-le.</p>
          </div>
        )}
      </div>

      {/* Panneau principal */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4">
        {/* Boutons d'action rapide */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
          <label className="inline-block">
            <input 
              type="file" 
              accept="application/json" 
              onChange={handleFile}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition font-medium text-sm">
              <Upload className="w-4 h-4" />
              Charger fichier
            </span>
          </label>
          
          <Button 
            onClick={loadCurrent}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Charger courant
          </Button>
          
          <Button 
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </Button>

          <Button 
            onClick={formatJSON}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Format
          </Button>

          <Button 
            onClick={minifyJSON}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Minify
          </Button>

          <Button 
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copier
          </Button>
        </div>

        {/* Statistiques et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-slate-600">Taille: <strong>{(stats.size / 1024).toFixed(2)} KB</strong> | Clés: <strong>{stats.keys}</strong> | Profondeur: <strong>{stats.depth}</strong></p>
            </div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchInJSON()}
              placeholder="Chercher une clé ou valeur..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
            <Button 
              onClick={searchInJSON}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Éditeur JSON */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Configuration JSON</label>
          <div className="relative">
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              rows={14}
              placeholder="Collez ou modifiez la configuration JSON ici..."
              className={`w-full p-4 border rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition ${
                validationError ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {validationError && (
              <div className="absolute bottom-2 right-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                Erreur JSON
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">Validez votre JSON avant d'importer</p>
          {validationError && (
            <p className="text-xs text-red-600">Erreur: {validationError}</p>
          )}
        </div>

        {/* Historique */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <details className="group">
              <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                <Clock className="w-4 h-4" />
                Historique ({history.length})
              </summary>
              <div className="mt-3 space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => restoreFromHistory(item)}
                    className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm transition border border-slate-200"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-slate-500 text-xs block">{(item.content.length / 1024).toFixed(1)} KB</span>
                  </button>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={handleImport}
            disabled={!!validationError || !text.trim()}
            className="gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Importer et appliquer
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => { setText(''); setMessage(null); setSearchTerm(''); }}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </Button>
        </div>

        {/* Message de feedback */}
        {message && (
          <div className={`flex items-start gap-3 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              messageType === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
