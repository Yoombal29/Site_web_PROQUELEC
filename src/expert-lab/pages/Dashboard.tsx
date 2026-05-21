import {
  Zap,
  Activity,
  ShieldCheck,
  FileText,
  Binary,
  BarChart3,
  RefreshCw,
  Bot,
  FileCode
} from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

interface DashboardStats {
  totalAiRequests: number;
  totalDocuments: number;
}

interface ServiceStatus {
  service: string;
  status: 'online' | 'offline';
  url: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLaunching, setIsLaunching] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalAiRequests: 0, totalDocuments: 0 });
  const [aiStatuses, setAiStatuses] = useState<ServiceStatus[]>([]);

  useEffect(() => {
    fetchStats();
    checkAiStatus();
    const interval = setInterval(checkAiStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiFetch<DashboardStats>('/api/admin/stats');
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const checkAiStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setAiStatuses(data);
      }
    } catch (error) {
      console.error("Failed to check AI status", error);
    }
  };

  const isServiceOnline = (name: string) => {
    const s = aiStatuses.find(s => s.service.includes(name));
    return s?.status === 'online';
  };

  const handleLaunchTechnicalSuite = () => {
    setIsLaunching(true);
    toast({
      title: "Initialisation",
      description: "Chargement de l'environnement expert..."
    });

    setTimeout(() => {
      navigate('/expert/chat');
    }, 800);
  };

  const adminMetrics = [
    { title: "Indice de Souveraineté", value: "100%", detail: "Handshake Local OK", icon: ShieldCheck, color: "text-primary" },
    { title: "Articles Normatifs", value: "4.2k", detail: "Base NS 01-001 (Titres 4 & 5)", icon: FileText, color: "text-primary" },
    { title: "Statut Serveur", value: "EN LIGNE", detail: "Proquelec-Core v7.4", icon: Activity, color: "text-emerald-600" },
    { title: "Requêtes IA", value: stats.totalAiRequests || "0", detail: "Moteur Hybride Actif", icon: RefreshCw, color: "text-primary" }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden animate-in fade-in duration-700">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_hsl(var(--primary))_0%,_transparent_70%)]"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">

        {/* BARRE DE STATUT SUPÉRIEURE */}
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                EXPERT_<span className="text-primary">LAB</span> <span className="text-[10px] uppercase font-bold opacity-30 mt-1 ml-2 tracking-widest text-muted-foreground">Console de Gestion Souveraine</span>
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Services Opérationnels</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleLaunchTechnicalSuite}
              disabled={isLaunching}
              size="lg"
              className="px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase shadow-md transition-all active:scale-95 disabled:opacity-70">
              {isLaunching ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isLaunching ? "Connexion..." : "Ouvrir l'Espace Expert"}
            </Button>
          </div>
        </div>

        {/* MÉTRIQUES PRINCIPALES (NAVIGABLES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Custom Interactive Cards using Dashboard Data */}
          <Card
            className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50 cursor-pointer"
            onClick={() => navigate('/expert/docs')}
          >
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <FileText className="w-3 h-3 text-primary/40 group-hover:text-primary" /> Documents GED
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-indigo-400">{stats.totalDocuments}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">fichiers archivés</span>
                <Activity className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50">
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-primary/40" /> Souveraineté
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-primary">100%</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">Local Handshake OK</span>
                <ShieldCheck className="w-3 h-3 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50">
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary/40" /> Statut Serveur
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-emerald-600">ONLINE</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">Proquelec-Core v7.4</span>
                <Activity className="w-3 h-3 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50 cursor-pointer"
            onClick={() => navigate('/expert/chat')}
          >
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <RefreshCw className="w-3 h-3 text-primary/40 group-hover:text-primary" /> Requêtes IA
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-cyan-400">{stats.totalAiRequests}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">Analyses Générées</span>
                <Activity className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- AI COMMAND CENTER (NOUVEAU TABLEAU CENTRAL) --- */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-500/80">Centre de Commandement IA</h2>
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Accès direct aux modules du Cortex Souverain.</p>
          </div>

          <Card className="border-border bg-card/40 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Module IA</th>
                    <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Rôle & Fonction</th>
                    <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Technologie</th>
                    <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">État</th>
                    <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">

                  {/* 1. EXPERT HYBRIDE */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 transition-all">
                          <Bot className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">Expert Hybride</div>
                          <div className="text-[10px] text-cyan-500/60 uppercase font-bold tracking-wider">Phi-3.5 + RAG</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      Assistant généraliste, explications techniques, recherche normative.
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-cyan-950/30 border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/50">LLM Local</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isServiceOnline('Cerveau') ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">En Ligne</span>
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-red-500 uppercase">Hors Ligne</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" onClick={() => navigate('/expert/chat')} className="bg-cyan-600 hover:bg-cyan-500 text-white h-8 text-xs font-bold uppercase tracking-wide">
                        Discuter <Activity className="w-3 h-3 ml-2" />
                      </Button>
                    </td>
                  </tr>

                  {/* 2. KEBE (NORMATIF) */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">KEBE (Le Rigoureux)</div>
                          <div className="text-[10px] text-emerald-500/60 uppercase font-bold tracking-wider">Moteur Logique</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      Calculs certifiés (Chute de tension, câbles), validation binaire.
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-emerald-950/30 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/50">Python Hardcoded</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Actif</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" onClick={() => navigate('/expert/calculators')} className="bg-slate-700 hover:bg-slate-600 text-white h-8 text-xs font-bold uppercase tracking-wide border border-slate-600">
                        Calculer <Binary className="w-3 h-3 ml-2" />
                      </Button>
                    </td>
                  </tr>

                  {/* 3. ARTISTE (MAGE) */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-all">
                          <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">L'Artiste (Mage)</div>
                          <div className="text-[10px] text-purple-500/60 uppercase font-bold tracking-wider">SDXL Turbo</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      Génération de schémas, visualisations 3D, concepts techniques.
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-purple-950/30 border-purple-500/20 text-purple-400 hover:bg-purple-950/50">Diffu. Stable</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isServiceOnline('Image') ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-purple-500 uppercase">Prêt à Créer</span>
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-500 uppercase">Initialisation...</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" onClick={() => navigate('/expert/chat')} disabled={!isServiceOnline('Image')} className="bg-purple-900/50 hover:bg-purple-800 border border-purple-500/30 text-purple-100 h-8 text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
                        Générer <Zap className="w-3 h-3 ml-2" />
                      </Button>
                    </td>
                  </tr>

                  {/* 4. OBSERVATEUR (VISION) */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-all">
                          <FileCode className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">Observateur</div>
                          <div className="text-[10px] text-amber-500/60 uppercase font-bold tracking-wider">Moondream2</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      Analyse de photos chantier, détection automatique d'anomalies.
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-amber-950/30 border-amber-500/20 text-amber-400 hover:bg-amber-950/50">Vision IA</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isServiceOnline('Vision') ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-500 uppercase">En Veille</span>
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Hors Ligne (DL)</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" onClick={() => navigate('/expert/scanner')} disabled={!isServiceOnline('Vision')} className="bg-slate-800 text-slate-200 hover:bg-slate-700 h-8 text-xs font-bold uppercase tracking-wide border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Scanner <Bot className="w-3 h-3 ml-2" />
                      </Button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SANTÉ SYSTÈME & AUDIT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Activités Récentes & Audit</h2>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">Suivi en temps réel des interactions avec la base normative et l'IA.</p>
            </div>
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-primary">Journal des Événements</span>
                <Badge variant="outline" className="text-[8px] border-primary/20 text-primary uppercase">Direct</Badge>
              </div>
              <div className="p-6 space-y-4 text-xs font-medium uppercase">
                {[
                  { time: "09:42", log: "Analyse Normative: Titre 4 - Protections [COMPLÉTÉ]", type: "success" },
                  { time: "09:38", log: "Mise à jour Base de Connaissances NS 01-001 v2.0", type: "info" },
                  { time: "09:12", log: "Alerte: Requête hors périmètre technique bloquée", type: "warning" },
                  { time: "08:55", log: "Handshake API IA : Session Authentifiée", type: "info" }].
                  map((l, i) =>
                    <div key={i} className="flex gap-4 items-center border-b border-border pb-2 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                      <span className="text-primary font-bold">[{l.time}]</span>
                      <span className={l.type === 'warning' ? 'text-amber-600' : 'text-foreground'}>{l.log}</span>
                    </div>
                  )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card onClick={() => navigate('/expert/ai-providers')} className="p-6 bg-primary/5 border-border hover:border-primary/20 cursor-pointer transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Configuration IA</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Gestion des modèles et clés API</p>
                  </div>
                </div>
              </Card>
              <Card onClick={() => navigate('/expert/logs')} className="p-6 bg-emerald-500/5 border-border hover:border-emerald-500/20 cursor-pointer transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Logs Techniques</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Historique des calculs et audits</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* TÉLÉMÉTRIE & CONSTANTES SYSTÈME */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Paramètres Experts</h2>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">Constantes normatives injectées dans les calculs.</p>
            </div>

            <Card className="border-border bg-card/50 p-1 relative overflow-hidden">
              <div className="p-6 space-y-6">
                {[
                  { label: "Tension Nominale", value: "230V / 400V", icon: Activity, color: "text-primary" },
                  { label: "Température Réf.", value: "30°C UTE", icon: Binary, color: "text-primary" },
                  { label: "Standard de Calcul", value: "UTE C 15-105", icon: Zap, color: "text-primary" }].
                  map((item, i) =>
                    <div key={i} className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-60">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </div>
                      <p className={`text-xl font-bold ${item.color || 'text-foreground'}`}>{item.value}</p>
                    </div>
                  )}

                <div className="pt-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-emerald-600">Sécurité Active</p>
                      <p className="text-[9px] text-muted-foreground font-medium">Handshake Base de Données OK</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* PIED DE PAGE SYSTÈME */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[9px] uppercase font-bold tracking-[0.2em] opacity-30 pt-10 border-t border-border">
          <span>Expert Lab v7.5 // PROQUELEC INDUSTRIAL</span>
          <div className="flex gap-6">
            <span>Environnement Sécurisé</span>
            <span>Uptime Stable</span>
            <span>Souveraineté Validée</span>
          </div>
        </div>
      </div>
    </div >);

}