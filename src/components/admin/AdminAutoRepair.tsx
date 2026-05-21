
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, ShieldCheck, Zap, AlertTriangle, CheckCircle2, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

interface ErrorFixEntry {
  signature: string;
  errorMessage: string;
  context: string;
  applied_fix: string;
  learned_from: string;
  success_count: number;
  last_applied: string;
}

interface ScanResult {
  id: string; // generated from file + issue
  file: string;
  issue: string;
  type: string;
  confidence: number;
  isApplying?: boolean;
  isDone?: boolean;
}

export const AdminAutoRepair: React.FC = () => {
  const [memory, setMemory] = useState<ErrorFixEntry[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stabilityScore, setStabilityScore] = useState(92);

  // Initial load
  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const data = await apiFetch<ErrorFixEntry[]>('/api/engine/memory');
      if (data) setMemory(data);
    } catch (error) {
      console.error("Failed to fetch memory:", error);
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    const toastId = toast.loading("Analyse réelle du code source en cours...");
    try {
      const data = await apiFetch<unknown>('/api/engine/scan', { method: 'POST' });

      if (data && data.issues) {
        // Filtrer pour ne garder que les problèmes actionnables
        const actionableIssues = data.issues.filter((iss: unknown) => iss.type !== 'DEBUG');

        const mappedResults: ScanResult[] = actionableIssues.map((iss: unknown, idx: number) => ({
          id: `${iss.file}-${idx}`,
          file: iss.file,
          issue: iss.issue,
          type: iss.type,
          confidence: 0.90
        }));
        setScanResults(mappedResults);

        // Score basé uniquement sur les vulnérabilités réelles
        const newScore = Math.max(0, 100 - actionableIssues.length * 2);
        setStabilityScore(newScore);

        toast.success(`Scan terminé. ${actionableIssues.length} points d'attention.`, { id: toastId });
      } else {
        setScanResults([]);
        setStabilityScore(100);
        toast.success("Tout est en ordre ! Aucun problème détecté.", { id: toastId });
      }
    } catch (error) {
      toast.error("Erreur lors du scan du serveur.", { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  const [isRepairingAll, setIsRepairingAll] = useState(false);

  const applyFix = async (id: string) => {
    const result = scanResults.find((r) => r.id === id);
    if (!result) return;

    setScanResults((prev) => prev.map((res) => res.id === id ? { ...res, isApplying: true } : res));
    const toastId = toast.info(`Réparation réelle de ${result.file}...`);

    try {
      const data = await apiFetch<unknown>('/api/engine/repair', {
        method: 'POST',
        body: JSON.stringify({ file: result.file, issue: result.issue })
      });

      if (data && data.success) {
        setScanResults((prev) => prev.map((res) =>
        res.id === id ? { ...res, isApplying: false, isDone: true } : res
        ));

        toast.success(`Patch appliqué avec succès !`, { id: toastId });

        // Rafraîchir la mémoire après un court délai
        setTimeout(() => {
          fetchMemory();
          setScanResults((prev) => prev.filter((res) => res.id !== id));
          setStabilityScore((prev) => Math.min(prev + 2, 100));
        }, 1500);
      } else {
        throw new Error(data?.message || "Échec de la réparation");
      }
    } catch (error: unknown) {
      toast.error(`Erreur : ${error.message}`, { id: toastId });
      setScanResults((prev) => prev.map((res) => res.id === id ? { ...res, isApplying: false } : res));
    }
  };

  const applyAllFixes = async () => {
    if (scanResults.length === 0) return;

    setIsRepairingAll(true);
    const toastId = toast.loading(`Patch global en cours sur ${scanResults.length} fichiers...`);

    try {
      const data = await apiFetch<unknown>('/api/engine/repair', {
        method: 'POST',
        body: JSON.stringify({ mode: 'global' }) // Triggers repair on everything
      });

      if (data && data.success) {
        toast.success(`Réparation globale terminée avec succès !`, { id: toastId });
        setScanResults([]);
        setStabilityScore(100);
        fetchMemory();
      } else {
        throw new Error(data?.message || "Échec de la réparation globale");
      }
    } catch (error: unknown) {
      toast.error(`Erreur globale : ${error.message}`, { id: toastId });
    } finally {
      setIsRepairingAll(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            Ultra-AI Repair Engine
          </h1>
          <p className="text-slate-500 italic">Mode Réel : Connexion active au système de fichiers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score de Stabilité</div>
            <div className={`text-3xl font-black ${stabilityScore > 90 ? 'text-green-600' : 'text-orange-600'}`}>
              {stabilityScore}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Moteur de Scan */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" /> Scanner Runtime & Source
            </CardTitle>
            <div className="flex items-center gap-2">
              {scanResults.length > 0 &&
              <Button
                size="sm"
                onClick={applyAllFixes}
                disabled={isRepairingAll || isScanning}
                className="bg-green-600 hover:bg-green-700 text-white">

                  {isRepairingAll ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Patch Tout ({scanResults.length})
                </Button>
              }
              <Button size="sm" onClick={runScan} disabled={isScanning || isRepairingAll} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isScanning ? 'Scan en cours...' : 'Lancer le Scan Réel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {scanResults.length > 0 ?
              <div className="divide-y">
                  {scanResults.map((res) =>
                <div key={res.id} className={`p-4 hover:bg-slate-50 transition-all flex items-center justify-between ${res.isDone ? 'opacity-50 bg-green-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${res.isDone ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {res.isDone ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div className="max-w-md">
                          <div className="text-sm font-bold text-slate-900">{res.issue}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate break-all">{res.file}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] uppercase">Conf.: {Math.round(res.confidence * 100)}%</Badge>
                        <Button
                      size="sm"
                      variant={res.isDone ? "ghost" : "outline"}
                      disabled={res.isApplying || res.isDone}
                      onClick={() => applyFix(res.id)}
                      className={`h-8 text-xs font-bold ${res.isDone ? 'text-green-600' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>

                          {res.isApplying ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                          {res.isDone ? 'Appliqué ✓' : 'Appliquer Patch'}
                        </Button>
                      </div>
                    </div>
                )}
                </div> :

              <div className="flex flex-col items-center justify-center h-full text-slate-300 p-8 space-y-4">
                  <ShieldCheck className="w-16 h-16 opacity-20" />
                  <p className="font-medium text-slate-400">Prêt pour l'analyse réelle du serveur.</p>
                </div>
              }
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 2. Mémoire d'Apprentissage */}
        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" /> Base de Connaissances
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {memory.length > 0 ?
              memory.slice(0, 10).map((entry) =>
              <div key={entry.signature} className="p-3 rounded bg-slate-800 border-l-4 border-blue-500">
                    <div className="text-xs font-bold text-blue-400 mb-1">{entry.errorMessage}</div>
                    <div className="text-[10px] text-slate-400 mb-2 truncate">File: {entry.learned_from}</div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className="bg-blue-900 text-blue-200 text-[9px]">{entry.success_count} réussites</Badge>
                      <div className="text-[9px] text-slate-500">{entry.last_applied}</div>
                    </div>
                  </div>
              ) :

              <div className="text-xs text-slate-600 text-center py-8">Mémoire vide. Lancez une réparation pour apprendre.</div>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* validation bar */}
      <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-sm font-medium">Protection Git Guard Active : Tous les patchs créent un commit de sécurité.</div>
        </div>
        <div className="text-xs text-slate-400 font-mono">Repairs Logged in: ./src/engine/logs/scans.log</div>
      </div>
    </div>);

};