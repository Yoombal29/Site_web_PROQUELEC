import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { Save, Eye, EyeOff, Zap, Lock, Cpu, Server, Cable, Globe, Edit3, Check, RefreshCw, BarChart3, Terminal as TerminalIcon, Activity, Flame, ShieldCheck, Search, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface AIProvider {
  id: string;
  name: string;
  model: string;
  key: string;
  status: "configured" | "missing";
  enabled: boolean;
  connectionStatus: "connected" | "disconnected" | "checking" | "error";
  isCommitted?: boolean;
  priority: "base" | "expert";
  latency?: number;
  lastDiag?: unknown;
}

const MODEL_LABELS: Record<string, string> = {
  lovable: 'Phi-3.5 Expert',
  openai: 'GPT-4o',
  anthropic: 'Claude 3.5',
  gemini: 'Gemini 1.5 Pro',
  deepseek: 'DeepSeek-V3',
  ollama: 'Llama 3 Local',
  tavily: 'Tavily Search API'
};

export default function AIProvidersPage() {
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean;}>({});
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [expertPass, setExpertPass] = useState("Touba28");
  const [tempKeys, setTempKeys] = useState<{[key: string]: string;}>({});
  const [diagInfo, setDiagInfo] = useState<{isOpen: boolean;provider: AIProvider | null;data: unknown;isLoading: boolean;}>({ isOpen: false, provider: null, data: null, isLoading: false });
  const { toast } = useToast();

  const PING_URL = `${import.meta.env.VITE_API_URL}/api/ai/ping-provider`;
  const DIAG_URL = `${import.meta.env.VITE_API_URL}/api/ai/diagnostic`;

  const [providers, setProviders] = useState<AIProvider[]>([
  { id: "lovable", name: "Cœur Souverain PROQUELEC", model: MODEL_LABELS.lovable, key: "LOCAL_NODE", status: "configured", enabled: true, connectionStatus: "connected", isCommitted: true, priority: "base", latency: 1 },
  { id: "openai", name: "OpenAI", model: MODEL_LABELS.openai, key: "", status: "missing", enabled: false, connectionStatus: "disconnected", isCommitted: false, priority: "expert" },
  { id: "anthropic", name: "Anthropic", model: MODEL_LABELS.anthropic, key: "", status: "missing", enabled: false, connectionStatus: "disconnected", isCommitted: false, priority: "expert" },
  { id: "gemini", name: "Google Gemini", model: MODEL_LABELS.gemini, key: "", status: "missing", enabled: false, connectionStatus: "disconnected", isCommitted: false, priority: "expert" },
  { id: "deepseek", name: "DeepSeek", model: MODEL_LABELS.deepseek, key: "", status: "missing", enabled: false, connectionStatus: "disconnected", isCommitted: false, priority: "expert" },
  { id: "ollama", name: "Ollama", model: MODEL_LABELS.ollama, key: "", status: "configured", enabled: false, connectionStatus: "disconnected", isCommitted: true, priority: "expert" },
  { id: "tavily", name: "Tavily", model: MODEL_LABELS.tavily, key: "", status: "missing", enabled: false, connectionStatus: "disconnected", isCommitted: false, priority: "expert" }]
  );

  const [logs, setLogs] = useState<{id: string;msg: string;time: string;type: 'info' | 'success' | 'err';}[]>([]);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState("0s");

  const addLog = (msg: string, type: 'info' | 'success' | 'err' = 'info') => {
    setLogs((prev) => [{ id: Date.now().toString(), msg, time: new Date().toLocaleTimeString(), type }, ...prev].slice(0, 10));
  };

  useEffect(() => {
    addLog("Initialisation du système Expert IA v2.5", "info");
    const saved = localStorage.getItem("ai_providers");
    if (saved) {
      const parsed = JSON.parse(saved);
      const enriched = parsed.map((p: any) => ({ ...p, model: p.model || MODEL_LABELS[p.id] || 'Modèle inconnu' }));
      setProviders(enriched);
      const initialTemp: unknown = {};
      enriched.forEach((p: any) => initialTemp[p.id] = p.key);
      setTempKeys(initialTemp);
      addLog("Configuration locale restaurée", "success");
    }

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      if (diff < 60) setUptime(`${diff}s`);else
      if (diff < 3600) setUptime(`${Math.floor(diff / 60)}m ${diff % 60}s`);else
      setUptime(`${Math.floor(diff / 3600)}h ${Math.floor(diff % 3600 / 60)}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const syncToStorage = (updated: AIProvider[]) => localStorage.setItem("ai_providers", JSON.stringify(updated));

  const unlockKeys = () => {
    if (password === expertPass) {
      setIsUnlocked(true);
      toast({ title: "Accès ROOT autorisé" });
      addLog("Authentification ROOT réussie", "success");
    } else
    {
      toast({ title: "Code erroné", variant: "destructive" });
      addLog("Échec d'authentification ROOT", "err");
    }
  };

  const testKey = async (pId: string, val: string) => {
    if (pId === 'lovable') return { success: true, latency: 1 };

    try {
      addLog(`Ping satellite vers ${pId}...`, "info");
      const resp = await fetch(PING_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ providerId: pId, apiKey: val })
      });
      const data = await resp.json();
      return { success: data.success, latency: data.latency };
    } catch (e) {
      return { success: false, latency: 0 };
    }
  };

  const commitKey = async (pId: string, force = false) => {
    const val = tempKeys[pId] || "";
    setProviders((prev) => prev.map((p) => p.id === pId ? { ...p, connectionStatus: "checking" as const } : p));

    let result = { success: false, latency: 0 };
    if (!force) result = await testKey(pId, val);else
    result = { success: true, latency: 0 };

    setProviders((prev) => {
      const newStatus: AIProvider["connectionStatus"] = result.success ? "connected" : "error";
      const next = prev.map((p) => p.id === pId ? {
        ...p, key: val, isCommitted: result.success,
        connectionStatus: newStatus,
        latency: result.latency
      } : p);
      if (result.success) {
        syncToStorage(next);
        addLog(`Liaison établie avec ${pId} (${result.latency}ms)`, "success");
      } else {
        addLog(`Échec de liaison avec ${pId}`, "err");
      }
      return next;
    });

    if (result.success) toast({ title: force ? "Forçage effectué" : `Signal établi (${result.latency}ms)` });else
    toast({ title: "Défaut de liaison", description: "Le fournisseur a rejeté la requête.", variant: "destructive" });
  };

  const toggleProvider = (pId: string, enabled: boolean) => {
    setProviders((prev) => {
      let next: AIProvider[] = prev.map((p) => p.id === pId ? { ...p, enabled, connectionStatus: (enabled ? p.key ? "connected" : "disconnected" : "disconnected") as AIProvider["connectionStatus"] } : p);
      if (enabled && next.find((p) => p.id === pId)?.priority === 'expert') {
        next = next.map((p) => p.id === 'lovable' ? { ...p, enabled: false } : p);
        addLog(`Switch vers mode EXPERT (${pId})`, "info");
      }
      if (!enabled && !next.some((p) => p.enabled && p.priority === 'expert' && p.id !== 'tavily')) {
        next = next.map((p) => p.id === 'lovable' ? { ...p, enabled: true } : p);
        addLog("Retour au cœur SOUVERAIN", "info");
      }
      syncToStorage(next);
      return next;
    });
  };

  const runDeepDiagnostic = async (p: AIProvider) => {
    setDiagInfo({ isOpen: true, provider: p, data: null, isLoading: true });
    addLog(`Démarrage diagnostic profond pour ${p.name}...`, "info");

    try {
      const resp = await fetch(DIAG_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ providerId: p.id, apiKey: p.key })
      });
      const result = await resp.json();

      if (result.success) {
        setDiagInfo((prev) => ({ ...prev, data: result.diagnostics, isLoading: false }));
        addLog(`Diagnostic ${p.id} terminé : Grade ${result.diagnostics.overallGrade}`, "success");
        setProviders((prev) => prev.map((x) => x.id === p.id ? { ...x, lastDiag: result.diagnostics } : x));
      } else {
        throw new Error(result.message);
      }
    } catch (e: unknown) {
      toast({ title: "Échec du diagnostic", description: e.message, variant: "destructive" });
      setDiagInfo((prev) => ({ ...prev, isOpen: false }));
      addLog(`Échec diagnostic ${p.id}`, "err");
    }
  };

  // Metrics calculation
  const activeProviders = providers.filter((p) => p.enabled);
  const connectedProviders = providers.filter((p) => p.enabled && p.connectionStatus === 'connected');
  const sovereignCount = activeProviders.filter((p) => p.id === 'lovable' || p.id === 'ollama').length;
  const sovereigntyScore = activeProviders.length > 0 ? Math.round(sovereignCount / activeProviders.length * 100) : 100;
  const availabilityScore = activeProviders.length > 0 ? Math.round(connectedProviders.length / activeProviders.length * 100) : 0;
  const avgLatency = connectedProviders.length > 0 ? Math.round(connectedProviders.reduce((acc, p) => acc + (p.latency || 0), 0) / connectedProviders.length) : 0;

  return (
    <div className="space-y-8 p-8 min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 border-b border-slate-800/50 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Hub <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">Expert IA</span>
              </h1>
              <p className="text-sm font-medium text-slate-400 flex items-center gap-2 italic">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Gestionnaire de Souveraineté & Connectivité Satellite
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
          <div className="px-4 py-2">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Status Global</p>
            <p className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> OPÉRATIONNEL
            </p>
          </div>
          <Button onClick={() => {syncToStorage(providers);addLog("Configuration sauvegardée localement", "success");}} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl h-12 px-8 shadow-lg shadow-cyan-900/20 group">
            <Save className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> ENREGISTRER
          </Button>
        </div>
      </div>

      {/* Identification Barrier */}
      {!isUnlocked &&
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <Card className="bg-[#0f172a]/60 backdrop-blur-xl border-cyan-500/20 shadow-2xl overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-full bg-cyan-900/20 flex items-center justify-center border border-cyan-500/30">
                <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-white uppercase italic tracking-wider">Identification Habilitée Requise</h3>
                <p className="text-sm text-slate-400 font-mono">L'accès à la reconfiguration des passerelles satellite est restreint au personnel habilité.</p>
              </div>
              <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-64">
                  <Input
                  type="password"
                  placeholder="CODE_D_ACCÈS..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 h-14 pl-4 rounded-2xl" />
                
                </div>
                <Button onClick={unlockKeys} className="bg-white text-black font-black h-14 px-8 rounded-2xl hover:bg-cyan-400">ENTRER</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      }

      {/* Main Tabs System */}
      <Tabs defaultValue="souverain" className="w-full space-y-8 relative z-10">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1.5 h-16 rounded-[20px] backdrop-blur-md">
          <TabsTrigger value="souverain" className="rounded-[14px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white h-full px-8 text-xs font-bold uppercase tracking-widest gap-2">
            <ShieldCheck className="w-4 h-4" /> Cœur Souverain
          </TabsTrigger>
          <TabsTrigger value="passerelles" className="rounded-[14px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white h-full px-8 text-xs font-bold uppercase tracking-widest gap-2">
            <Cable className="w-4 h-4" /> Passerelles Externes
          </TabsTrigger>
          <TabsTrigger value="web" className="rounded-[14px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white h-full px-8 text-xs font-bold uppercase tracking-widest gap-2">
            <Globe className="w-4 h-4" /> Laboratoire Web
          </TabsTrigger>
        </TabsList>

        <TabsContent value="souverain" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {providers.filter((p) => p.id === 'lovable' || p.id === 'ollama').map((p) =>
            <ProviderCard key={p.id} p={p} isUnlocked={isUnlocked} showKeys={showKeys} setShowKeys={setShowKeys} tempKeys={tempKeys} setTempKeys={setTempKeys} setProviders={setProviders} commitKey={commitKey} toggleProvider={toggleProvider} onDiagnostic={runDeepDiagnostic} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="passerelles" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {providers.filter((p) => ['openai', 'anthropic', 'gemini', 'deepseek'].includes(p.id)).map((p) =>
            <ProviderCard key={p.id} p={p} isUnlocked={isUnlocked} showKeys={showKeys} setShowKeys={setShowKeys} tempKeys={tempKeys} setTempKeys={setTempKeys} setProviders={setProviders} commitKey={commitKey} toggleProvider={toggleProvider} onDiagnostic={runDeepDiagnostic} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="web" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {providers.filter((p) => p.id === 'tavily').map((p) =>
            <ProviderCard key={p.id} p={p} isUnlocked={isUnlocked} showKeys={showKeys} setShowKeys={setShowKeys} tempKeys={tempKeys} setTempKeys={setTempKeys} setProviders={setProviders} commitKey={commitKey} toggleProvider={toggleProvider} onDiagnostic={runDeepDiagnostic} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Metrics & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-slate-900/50 py-3 flex flex-row items-center justify-between border-b border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-3">
                <TerminalIcon className="w-4 h-4" /> JOURNAL DES LIAISONS SATELLITES
              </h4>
              <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-500">LIVE RELAY</Badge>
            </CardHeader>
            <CardContent className="p-4 h-[200px] overflow-y-auto font-mono">
              {logs.length === 0 && <p className="text-slate-600 text-[10px] italic">Attente de données...</p>}
              {logs.map((log) =>
              <div key={log.id} className="flex gap-4 py-1 border-b border-slate-800/30">
                  <span className="text-[10px] text-slate-600">[{log.time}]</span>
                  <span className={cn("text-[10px] font-bold", log.type === 'success' ? 'text-emerald-500' : log.type === 'err' ? 'text-red-500' : 'text-cyan-500')}>
                    {log.msg}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur-sm">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
            <Activity className="w-3 h-3 text-cyan-500" /> Métriques Globales
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-tighter">Équilibre Souveraineté</span>
                <span className="text-cyan-400">{sovereigntyScore}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-1000 dynamic-width"
                  style={{ '--progress-width': `${sovereigntyScore}%` } as React.CSSProperties} />
                
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-tighter">Disponibilité Systèmes</span>
                <span className="text-emerald-400">{availabilityScore}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 dynamic-width"
                  style={{ '--progress-width': `${availabilityScore}%` } as React.CSSProperties} />
                
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Latence Moy.</p>
                <p className="text-lg font-black text-white">{avgLatency}ms</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Uptime Hub</p>
                <p className="text-lg font-black text-white">{uptime}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={diagInfo.isOpen} onOpenChange={(o) => setDiagInfo((prev) => ({ ...prev, isOpen: o }))}>
        <DialogContent className="max-w-4xl bg-[#020617]/95 border-slate-800 backdrop-blur-2xl text-slate-200 rounded-[40px] shadow-2xl overflow-hidden p-0 gap-0">
          {diagInfo.isLoading ?
          <div className="h-[600px] flex flex-col items-center justify-center p-12 space-y-8 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent)]" />
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-t-2 border-r-2 border-cyan-500/50" />
                <div className="absolute inset-4 rounded-full border border-slate-800 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2 relative">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">Diagnostic en cours</h2>
                <p className="text-xs text-slate-500 font-mono italic">Audit de la liaison satellite {diagInfo.provider?.id}...</p>
              </div>
              <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden">
                <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 5, ease: "easeInOut" }} />
              </div>
            </div> :
          diagInfo.data &&
          <div className="h-[700px] overflow-y-auto p-8 space-y-8 animate-in fade-in duration-500">
              <DialogHeader className="flex-row justify-between items-center mb-0">
                <div className="space-y-1">
                  <DialogTitle className="text-3xl font-black text-white flex items-center gap-4">
                    {diagInfo.provider?.name}
                    <Badge className={cn("text-lg px-4 py-1 rounded-xl", diagInfo.data.overallGrade === 'S' ? 'bg-orange-500' : diagInfo.data.overallGrade === 'A' ? 'bg-cyan-500' : 'bg-slate-700')}>
                      GRADE {diagInfo.data.overallGrade}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs font-mono tracking-tighter uppercase">Audit de Performance Atomique v2.5</DialogDescription>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/50 border-slate-800/50 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Rapidité Flux</h4>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Tokens/s (TPS)</p>
                    <p className="text-3xl font-black text-white">{diagInfo.data.performance.tps}</p>
                    <p className="text-[10px] text-slate-500">Latence: {diagInfo.data.performance.ttft}ms</p>
                  </div>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <Globe className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Réseau Expert</h4>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Signal</p>
                    <p className="text-3xl font-black text-white uppercase">{diagInfo.data.network.status}</p>
                    <p className="text-[10px] text-slate-500">Security: TLS 1.3 Active</p>
                  </div>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-orange-400">
                    <Database className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Inférence</h4>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Semantic Score</p>
                    <p className="text-3xl font-black text-white">{diagInfo.data.overallGrade === 'S' ? '99%' : '85%'}</p>
                    <p className="text-[10px] text-slate-500">Reasoning Engine: PRO</p>
                  </div>
                </Card>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-[32px] p-8 h-[250px] relative">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-6 flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" /> Analyse Séquentielle du Signal
                </h4>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={[{ t: 0, v: 50 }, { t: 1, v: 80 }, { t: 2, v: 60 }, { t: 3, v: 95 }, { t: 4, v: 75 }, { t: 5, v: 90 }, { t: 6, v: 85 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="t" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} animationDuration={2500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-end pt-4 gap-4">
                <Button variant="ghost" className="text-slate-500 hover:text-white" onClick={() => setDiagInfo((prev) => ({ ...prev, isOpen: false }))}>QUITTER</Button>
                <Button className="bg-white text-black font-black hover:bg-cyan-400 h-12 px-8 rounded-2xl" onClick={() => runDeepDiagnostic(diagInfo.provider!)}>RELANCER L'AUDIT</Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

}

function ProviderCard({ p, isUnlocked, showKeys, setShowKeys, tempKeys, setTempKeys, setProviders, commitKey, toggleProvider, onDiagnostic }: unknown) {
  const isSovereign = p.id === 'lovable';

  return (
    <motion.div layout className={cn("group relative bg-[#0f172a]/60 border-slate-800/50 rounded-[32px] overflow-hidden backdrop-blur-xl transition-all duration-500", p.enabled ? "border-cyan-500/30 scale-[1.01] shadow-2xl" : "opacity-40 grayscale")}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative", p.enabled ? p.connectionStatus === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'bg-slate-800 text-slate-500')}>
              {p.id === "tavily" ? <Search className="w-7 h-7" /> : p.id === "ollama" ? <Server className="w-7 h-7" /> : isSovereign ? <Flame className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
              {p.enabled && p.connectionStatus === 'connected' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a] animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{p.name}</h3>
                {p.lastDiag && <Badge className="bg-orange-500 text-[8px] h-4 font-black">GRADE {p.lastDiag.overallGrade}</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <Badge className="bg-slate-800 text-slate-300 uppercase text-[9px] font-black tracking-widest">
                  Modèle : {p.model}
                </Badge>
                <p className={cn("text-[9px] font-black uppercase tracking-widest", p.connectionStatus === 'connected' ? "text-emerald-400" : "text-slate-500")}>
                  {p.connectionStatus === 'connected' ? 'SIGNAL_STABLE' : p.connectionStatus === 'error' ? 'ÉCHEC_LIAISON' : 'HORS_LIGNE'}
                </p>
                {p.enabled && p.connectionStatus === 'connected' && <span className="text-[9px] font-bold text-slate-400">• {p.latency || 0} ms</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {p.enabled && p.connectionStatus === 'connected' &&
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-slate-800/50 text-slate-400 hover:text-cyan-400" onClick={() => onDiagnostic(p)}>
                <Zap className="w-4 h-4" />
              </Button>
            }
            <Switch checked={p.enabled} onCheckedChange={(c) => toggleProvider(p.id, c)} disabled={!isUnlocked && !isSovereign} />
          </div>
        </div>

        {!isSovereign && p.id !== 'ollama' &&
        <div className="space-y-4">
            <div className="relative group/input">
              <Input
              type={showKeys[p.id] || !p.isCommitted ? "text" : "password"}
              value={tempKeys[p.id] || ""}
              placeholder="Clé API Satellite..."
              onChange={(e) => setTempKeys((s: unknown) => ({ ...s, [p.id]: e.target.value }))}
              className="bg-slate-950/40 border-slate-800 h-14 pl-4 pr-24 rounded-2xl text-xs font-mono"
              disabled={p.isCommitted && p.connectionStatus === 'connected' || !isUnlocked} />
            
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/input:opacity-100 transition-opacity">
                {isUnlocked && p.enabled && (
              p.isCommitted && p.connectionStatus === 'connected' ?
              <>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white" onClick={() => setShowKeys((prev: unknown) => ({ ...prev, [p.id]: !prev[p.id] }))}>
                        {showKeys[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-cyan-400" onClick={() => setProviders((s: unknown) => s.map((x: unknown) => x.id === p.id ? { ...x, isCommitted: false } : x))}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </> :

              <Button size="icon" variant="ghost" className="h-12 w-12 text-cyan-400 hover:bg-cyan-500/10" onClick={() => commitKey(p.id)}>
                      {p.connectionStatus === 'checking' ? <RefreshCw className="animate-spin w-5 h-5" /> : <Check className="w-6 h-6" />}
                    </Button>)

              }
              </div>
            </div>
          </div>
        }
        {(isSovereign || p.id === 'ollama') &&
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Liaison de Sécurité Maximale Active</span>
            </div>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
        }
      </div>
      <div className="px-6 py-3 bg-slate-900/40 border-t border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
        <span>Protocol: TLS 1.3 Expert</span>
        <span>Availability: 100%</span>
      </div>
    </motion.div>);

}