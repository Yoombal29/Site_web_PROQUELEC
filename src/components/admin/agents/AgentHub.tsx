import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";
import {

  Search,
  Wrench,
  Terminal,
  Play,

  Loader2,


  FileText,


  BrainCircuit,
  Cpu
} from
  'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Types pour les logs
interface AgentLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
  message: string;
  agent: 'researcher' | 'maintainer' | 'system';
}

export function AgentHub() {
  const [activeAgent, setActiveAgent] = useState<'researcher' | 'maintainer'>('researcher');
  const [isResearching, setIsResearching] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [researchGoal, setResearchGoal] = useState('');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: AgentLog['type'] = 'info', agent: AgentLog['agent'] = 'system') => {
    setLogs((prev) => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      message,
      agent
    }]);
  };

  // --- AGENT CHERCHEUR (CONNECTÉ AU CORTEX) ---
  const startResearch = async () => {
    if (!researchGoal.trim()) {
      toast.error("Veuillez définir un objectif de recherche");
      return;
    }

    setIsResearching(true);
    setLogs([]); // Clear logs on start
    addLog(`🚀 Démarrage de la mission : "${researchGoal}"`, 'info', 'researcher');

    try {
      // Step 1: Planning
      addLog("🧠 Sollicitation du Cortex (Phi-3.5) pour analyse...", 'action', 'researcher');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Tu es un Agent Chercheur Expert pour PROQUELEC. Ton but est de produire un plan de recherche détaillé et technique sur le sujet demandé. Réponds en Markdown structuré." },
            { role: "user", content: `Objectif de recherche : ${researchGoal}. Structure une réponse détaillée.` }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Cortex: ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || "Pas de réponse du Cortex.";

      // Step 2: Processing Response
      addLog("✅ Réponse du Cortex reçue. Analyse...", 'success', 'researcher');

      // Simulate "Reviewing" time for effect
      setTimeout(() => {
        addLog("📝 Rédaction du rapport de synthèse...", 'action', 'researcher');

        // Store result in local storage or state to open in editor later (simplified for now)
        localStorage.setItem('last_ai_research', aiContent);

        setIsResearching(false);
        addLog("✅ Mission terminée. Rapport généré avec succès.", 'success', 'researcher');
        toast.success("Recherche terminée !");
      }, 1500);

    } catch (error) {
      console.error("AI Error:", error);
      addLog(`❌ Échec de la mission : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error', 'researcher');
      setIsResearching(false);
      toast.error("Erreur lors de la recherche IA");
    }
  };

  const openResearchResult = () => {
    navigate('/office/document/new');
    toast.info("Ouverture du rapport généré...");
  };

  // --- AGENT MAINTENEUR (SIMULATION) ---
  const startMaintenance = () => {
    setIsFixing(true);
    setLogs([]);
    addLog("Démarrage du scan de maintenance du CMS...", 'info', 'maintainer');

    // Step 1: Scanning
    setTimeout(() => {
      addLog("Analyse statique du code (Linting)...", 'action', 'maintainer');
    }, 1500);

    // Step 2: Detection
    setTimeout(() => {
      addLog("Erreur détectée : Style inline non conforme dans 'ChatPage.tsx'", 'warning', 'maintainer');
    }, 3500);

    // Step 3: Fixing
    setTimeout(() => {
      addLog("Application du correctif : Extraction vers 'index.css'...", 'action', 'maintainer');
    }, 5500);

    setTimeout(() => {
      addLog("Vérification post-correctif...", 'action', 'maintainer');
    }, 7500);

    // Finalization
    setTimeout(() => {
      setIsFixing(false);
      addLog("Maintenance terminée. 1 correctif appliqué, système stable.", 'success', 'maintainer');
      toast.success("Maintenance effectuée avec succès");
    }, 9000);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-proqblue to-cyan-500 bg-clip-text text-transparent flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-proqblue" />
            Agents Autonomes
          </h2>
          <p className="text-slate-500 mt-2">
            Centre de contrôle des intelligences artificielles du CMS PROQUELEC.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isResearching || isFixing ? "default" : "secondary"} className="text-sm py-1 px-3">
            {isResearching || isFixing ?
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Actif
              </span> :

              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                En attente
              </span>
            }
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Left Panel: Agent Selection */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${activeAgent === 'researcher' ? 'border-proqblue bg-blue-50/50' : 'border-transparent'}`}
            onClick={() => setActiveAgent('researcher')}>

            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-blue-500" />
                Agent Chercheur
              </CardTitle>
              <CardDescription>
                Expert en veille normative et rédaction technique.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-white">Veille NF C 15-100</Badge>
                <Badge variant="outline" className="bg-white">Rédaction Blog</Badge>
              </div>
              {activeAgent === 'researcher' &&
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-500">Objectif de la mission</label>
                    <Input
                      placeholder="Ex: Rapport sur les bornes IRVE..."
                      value={researchGoal}
                      onChange={(e) => setResearchGoal(e.target.value)}
                      disabled={isResearching}
                      className="bg-white" />

                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={startResearch}
                    disabled={isResearching}>

                    {isResearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    {isResearching ? 'Analyse en cours...' : 'Lancer la recherche'}
                  </Button>
                  {!isResearching && logs.length > 0 && logs[logs.length - 1].agent === 'researcher' &&
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={openResearchResult}>
                      <FileText className="mr-2 h-4 w-4" /> Ouvrir le résultat
                    </Button>
                  }
                </div>
              }
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${activeAgent === 'maintainer' ? 'border-emerald-500 bg-emerald-50/50' : 'border-transparent'}`}
            onClick={() => setActiveAgent('maintainer')}>

            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-emerald-600" />
                Agent Mainteneur
              </CardTitle>
              <CardDescription>
                Détection et correction automatique des bugs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-white">Auto-Fix Lint</Badge>
                <Badge variant="outline" className="bg-white">Optimisation CSS</Badge>
              </div>
              {activeAgent === 'maintainer' &&
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="p-3 bg-slate-950 text-slate-300 rounded text-xs font-mono">
                    Scan cible: /src/**/* <br />
                    Mode: Auto-Apply <br />
                    Sécurité: High
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={startMaintenance}
                    disabled={isFixing}>

                    {isFixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    {isFixing ? 'Correction en cours...' : 'Scanner et Réparer'}
                  </Button>
                </div>
              }
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Live Terminal / Visualization */}
        <Card className="lg:col-span-2 bg-slate-950 text-slate-200 font-mono shadow-2xl border-slate-800 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold">Console Système - {activeAgent === 'researcher' ? 'Agent Chercheur' : 'Agent Maintenance'}</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 mix-blend-screen animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 mix-blend-screen" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 mix-blend-screen" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            {/* Background Matrix/Grid Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none matrix-grid-bg" />

            <ScrollArea className="h-full p-4">
              <div className="space-y-2">
                {logs.length === 0 &&
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 mt-20 gap-4">
                    <Cpu className="h-16 w-16 opacity-20" />
                    <p>En attente d'instructions...</p>
                  </div>
                }
                {logs.map((log) =>
                  <div key={log.id} className="flex gap-3 text-sm font-mono animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-500 min-w-[80px]">[{log.timestamp.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]</span>
                    <span className={
                      log.type === 'error' ? 'text-red-400 font-bold' :
                        log.type === 'warning' ? 'text-yellow-400' :
                          log.type === 'success' ? 'text-green-400 font-bold' :
                            log.type === 'action' ? 'text-cyan-400' :
                              'text-slate-300'
                    }>
                      {log.type === 'action' && '> '}
                      {log.message}
                    </span>
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>);

}

export default AgentHub;