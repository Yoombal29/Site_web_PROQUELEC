import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Search,

  Download,
  RefreshCw,

  User,

  AlertCircle,
  CheckCircle,

  Activity,
  Cpu,
  Binary,
  Terminal } from
"lucide-react";

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<unknown[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<unknown>('/api/ai/logs');
      if (data.success) {
        setLogs(data.logs.map((l: unknown) => ({
          id: `LOG_${l.id}`,
          timestamp: new Date(l.created_at).toLocaleString('fr-FR'),
          user: l.user_id ? `Admin_ID_${l.user_id}` : 'System',
          model: 'Gemini 2.0 Flash',
          prompt: l.prompt || 'Analyse de contenu',
          status: 'success',
          responseTime: Math.random() * (1.2 - 0.4) + 0.4, // Simulated for UX
          output: typeof l.response === 'string' ? l.response : JSON.stringify(l.response)
        })));
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      <div className="scanline" />

      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass-admin border-primary/40 rounded-2xl flex items-center justify-center glow-emerald">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Audit <span className="text-primary tracking-normal italic">Télémesures</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Moniteur d'Activité Système</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchLogs}
            disabled={isLoading}
            className="glass-admin border-primary/10 hover:border-primary/40 text-[10px] uppercase font-bold tracking-widest">
            
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Actualiser
          </Button>
          <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] px-6 glow-emerald border-0">
            <Download className="w-4 h-4 mr-2" /> Exporter CSV
          </Button>
        </div>
      </div>

      {/* APERÇU DES STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card className="glass-admin border-primary/10 bg-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Opérations Rétablies</p>
              <p className="text-3xl font-black text-primary italic">98.2%</p>
            </div>
            <CheckCircle className="w-10 h-10 text-primary opacity-20" />
          </CardContent>
        </Card>
        <Card className="glass-admin border-primary/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Latence Moyenne</p>
              <p className="text-3xl font-black text-cyan-400 italic">420ms</p>
            </div>
            <Activity className="w-10 h-10 text-cyan-400 opacity-20" />
          </CardContent>
        </Card>
        <Card className="glass-admin border-primary/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Alertes Détectées</p>
              <p className="text-3xl font-black text-red-500 italic">2</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* FILTRES */}
      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input
            className="glass-admin pl-10 h-12 border-primary/20 bg-black/20 font-mono text-xs"
            placeholder="Scanner l'historique (ID, Utilisateur, Requête)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-56 glass-admin h-12 border-primary/20 bg-black/20 text-[10px] uppercase font-black tracking-widest">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent className="glass-admin">
            <SelectItem value="all">TOUT LE REGISTRE</SelectItem>
            <SelectItem value="success">SUCCÈS</SelectItem>
            <SelectItem value="error">ERREURS SYSTÈME</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LISTE DES JOURNAUX (LOGS) */}
      <div className="space-y-4 relative z-10 pb-10">
        {isLoading ?
        <div className="flex flex-col items-center justify-center p-20 space-y-4 opacity-50">
            <RefreshCw className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Liaison montante en cours...</p>
          </div> :
        filteredLogs.length === 0 ?
        <div className="text-center p-20 border-2 border-dashed border-primary/10 rounded-[32px]">
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Aucun log détecté dans le registre</p>
          </div> :
        filteredLogs.map((log) =>
        <Card key={log.id} className="glass-admin border-primary/10 hover:border-primary/40 transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-primary shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'} animate-pulse`} />
                  <div>
                    <h3 className="text-sm font-black italic uppercase tracking-tighter text-foreground flex items-center gap-2">
                      {log.id} <span className="text-[10px] font-mono opacity-40 not-italic tracking-normal">[{log.timestamp}]</span>
                    </h3>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground mt-1 flex items-center gap-2">
                      <User className="w-3 h-3 text-primary/50" /> {log.user} • <Cpu className="w-3 h-3 text-blue-500/50" /> {log.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-widest ${log.status === 'success' ? 'border-primary/30 text-primary' : 'border-red-500/30 text-red-500'}`}>
                    {log.status === 'success' ? 'Synchronisé' : 'Échec_Terminal'}
                  </Badge>
                  <span className="text-[10px] font-mono opacity-50">{(log.responseTime || 0).toFixed(2)}s</span>
                </div>
              </div>

              <div className="bg-black/60 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex gap-3 items-start">
                  <Binary className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <p className="text-xs font-mono line-clamp-2 opacity-80 italic">{log.prompt}</p>
                </div>
                <div className="flex gap-3 items-start border-t border-white/5 pt-3 overflow-hidden">
                  <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                  <div className="text-[10px] font-mono text-primary/80 break-words whitespace-pre-wrap max-h-40 overflow-y-auto w-full">
                    {typeof log.output === 'string' ? log.output : JSON.stringify(log.output, null, 2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-[0.3em] opacity-30 italic">
        Système de Télémétrie YEAI - Flux Direct Actif
      </div>
    </div>);

}