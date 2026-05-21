import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings,
  Save,
  RotateCcw,

  Shield,




  Cpu,


  Binary,
  Palette,
  Eye,
  Check,

  Lock,
  Unlock,
  Download,
  Upload,



  RefreshCw } from
"lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

export default function ConfigPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const expertPass = "Touba28";
  const { toast } = useToast();

  const [config, setConfig] = useState({
    activeNorm: "NF C 15-100",
    calculationEngine: "UTE C 15-105",
    ambientTemp: "30",
    exportFormat: "IFC 4.0",
    includeMetadata: true,
    enginePriority: "Accuracy",
    expertMode: true,
    trainingInstructions: ""
  });

  // --- INTERFACE DESIGNER STATE ---
  const [theme, setTheme] = useState({
    adminColor: "#061010",
    adminOpacity: 0.9,
    chatColor: "#060a12",
    chatOpacity: 0.9,
    calcColor: "#121006",
    calcOpacity: 0.9,
    docsColor: "#0a0612",
    docsOpacity: 0.9,
    globalGlass: 0.85
  });

  // --- MASTER THEME PRESETS ---
  const THEME_PRESETS = [
  { id: "ELECTRIC_EMERALD", label: "Electric Emerald", desc: "Noyau Pulse & Électrique", colors: { adminColor: "#050a0a", chatColor: "#05080f", calcColor: "#0a0a05", docsColor: "#08050a", adminOpacity: 0.9, chatOpacity: 0.9, calcOpacity: 0.9, docsOpacity: 0.9, globalGlass: 0.9 }, preview: "bg-gradient-to-br from-blue-500 to-emerald-500" },
  { id: "EMERALD_LAB", label: "Émeraude Industriel", desc: "Stable & Industriel", colors: { adminColor: "#061010", chatColor: "#060a12", calcColor: "#121006", docsColor: "#0a0612", adminOpacity: 0.9, chatOpacity: 0.9, calcOpacity: 0.9, docsOpacity: 0.9, globalGlass: 0.85 }, preview: "bg-emerald-500" },
  { id: "PURE_LIGHT", label: "Industrial Light", desc: "Clair & Épuré", colors: { adminColor: "#f4f4f5", chatColor: "#ffffff", calcColor: "#f8fafc", docsColor: "#f1f5f9", adminOpacity: 0.95, chatOpacity: 1, calcOpacity: 1, docsOpacity: 1, globalGlass: 0.4 }, preview: "bg-zinc-100" },
  { id: "ZENITH_GRADIENT", label: "Zénith Dégradé", desc: "Moderne & Fluide", colors: { adminColor: "#0f172a", chatColor: "#1e1b4b", calcColor: "#312e81", docsColor: "#1e293b", adminOpacity: 0.8, chatOpacity: 0.8, calcOpacity: 0.8, docsOpacity: 0.8, globalGlass: 0.9 }, preview: "bg-indigo-600" },
  { id: "ZINC_MODERN", label: "Zinc Semi-Sombre", desc: "Pro & Épuré", colors: { adminColor: "#18181b", chatColor: "#27272a", calcColor: "#09090b", docsColor: "#1c1c1c", adminOpacity: 0.9, chatOpacity: 0.9, calcOpacity: 0.9, docsOpacity: 0.9, globalGlass: 0.75 }, preview: "bg-zinc-600" },
  { id: "CYBER_NEON", label: "Cyber Néon", desc: "Électrique & Contrasté", colors: { adminColor: "#0a0610", chatColor: "#060e12", calcColor: "#120610", docsColor: "#061210", adminOpacity: 0.95, chatOpacity: 0.95, calcOpacity: 0.95, docsOpacity: 0.95, globalGlass: 0.7 }, preview: "bg-pink-500" },
  { id: "GOLDEN_REACTOR", label: "Réacteur Ambre", desc: "Chaleur & Puissance", colors: { adminColor: "#100a06", chatColor: "#151008", calcColor: "#100805", docsColor: "#0d0a08", adminOpacity: 0.9, chatOpacity: 0.9, calcOpacity: 0.9, docsOpacity: 0.9, globalGlass: 0.8 }, preview: "bg-amber-600" },
  { id: "VOID_MONOLITH", label: "Vide Monolithique", desc: "Furtif & Absolu", colors: { adminColor: "#020202", chatColor: "#050505", calcColor: "#030303", docsColor: "#040404", adminOpacity: 1, chatOpacity: 1, calcOpacity: 1, docsOpacity: 1, globalGlass: 0.6 }, preview: "bg-black" }];


  const applyTheme = (t: typeof theme) => {
    const root = document.documentElement;
    root.style.setProperty('--admin-bg', t.adminColor);
    root.style.setProperty('--admin-opacity', t.adminOpacity.toString());
    root.style.setProperty('--chat-bg', t.chatColor);
    root.style.setProperty('--chat-opacity', t.chatOpacity.toString());
    root.style.setProperty('--calc-bg', t.calcColor);
    root.style.setProperty('--calc-opacity', t.calcOpacity.toString());
    root.style.setProperty('--docs-bg', t.docsColor);
    root.style.setProperty('--docs-opacity', t.docsOpacity.toString());
    root.style.setProperty('--glass-opacity', t.globalGlass.toString());
  };

  const handlePresetChange = (preset: typeof THEME_PRESETS[0]) => {
    const nextTheme = { ...theme, ...preset.colors };
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setIsDirty(true);
    toast({ title: `Univers ${preset.label} Activé`, description: "Le noyau visuel a pivoté vers le nouveau profil." });
  };

  // Load saved theme & config
  useEffect(() => {
    const savedTheme = localStorage.getItem("yeai_theme_config");
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      setTheme(parsed);
      applyTheme(parsed);
    }
    const savedConfig = localStorage.getItem("yeai_general_config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleThemeChange = (key: keyof typeof theme, value: unknown) => {
    const next = { ...theme, [key]: value };
    setTheme(next);
    applyTheme(next);
    setIsDirty(true);
  };

  const unlockTraining = () => {
    if (password === expertPass) {
      setIsUnlocked(true);
      toast({ title: "Accès Maître Autorisé", description: "Le noyau d'entraînement est désormais ouvert." });
    } else {
      toast({ title: "Code Erroné", variant: "destructive" });
    }
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("yeai_theme_config", JSON.stringify(theme));
    localStorage.setItem("yeai_general_config", JSON.stringify(config));

    setTimeout(() => {
      toast({
        title: "⚙️ PROTOCOLE DE SYNCHRONISATION TERMINÉ",
        description: "Le noyau neural et les shaders industriels ont été injectés avec succès.",
        className: "glass border-primary/50 text-primary font-black uppercase text-[10px]"
      });
      setIsDirty(false);
      setIsSaving(false);
    }, 800);
  };

  const exportTraining = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      version: "7.5",
      timestamp: new Date().toISOString(),
      directives: config.trainingInstructions,
      cognitiveMode: config.enginePriority
    }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "yeai_neural_core_v7.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Noyau Exporté", description: "Le fichier 'yeai_neural_core_v7.json' a été généré." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.directives) {
          handleConfigChange("trainingInstructions", json.directives);
          toast({ title: "Noyau Importé", description: "Les directives maîtres ont été chargées avec succès." });
        }
      } catch (err) {
        toast({ title: "Échec de l'Import", description: "Le fichier semble corrompu ou invalide.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetTheme = () => {
    handlePresetChange(THEME_PRESETS[0]);
    localStorage.removeItem("yeai_theme_config");
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden pb-32">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass border-primary/40 rounded-2xl flex items-center justify-center glow-emerald">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Configuration <span className="text-primary tracking-normal">Système</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Binary className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Accès Maître Autorisé</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetTheme} className="glass border-primary/10 hover:border-primary/40 text-[10px] uppercase font-bold h-12 px-6">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Design
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="bg-primary text-black font-black uppercase tracking-widest h-12 px-10 glow-emerald border-0 transition-all active:scale-95 disabled:opacity-30">
            
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Synchronisation..." : "Appliquer les changements"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">

        {/* 🎨 PRESETS GLOBAUX */}
        <Card className="glass border-primary/20 bg-primary/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-primary">
              <Palette className="w-6 h-6" /> Univers Visuels Maîtres
            </CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase text-zinc-400">Chiffrement esthétique global - Sélectionnez votre environnement de monitoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {THEME_PRESETS.map((p) =>
              <button
                key={p.id}
                onClick={() => handlePresetChange(p)}
                className={`relative p-4 rounded-2xl border transition-all flex flex-col items-start gap-4 h-full text-left group
                    ${theme.adminColor === p.colors.adminColor ? 'border-primary ring-2 ring-primary/20 bg-primary/10' : 'border-white/5 bg-black/40 hover:border-white/20'}`} aria-label="Action">
                
                  <div className={`w-10 h-10 rounded-xl ${p.preview} shadow-lg`} />
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-tight">{p.label}</h3>
                    <p className="text-[9px] opacity-40 leading-tight mt-1 group-hover:opacity-70 transition-opacity">{p.desc}</p>
                  </div>
                  {theme.adminColor === p.colors.adminColor && <Check className="absolute top-4 right-4 w-4 h-4 text-primary" />}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 🎨 INTERFACE DESIGNER (AJUSTEMENTS FINS) */}
        <Card className="glass border-primary/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2 opacity-50">
              Ajustements Précis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* ADMIN */}
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <Label className="text-[10px] font-black uppercase opacity-40">Cœur Admin</Label>
                <Input type="color" value={theme.adminColor} onChange={(e) => handleThemeChange("adminColor", e.target.value)} className="h-10 bg-transparent border-white/5 p-1" />
                <Slider value={[theme.adminOpacity]} min={0.2} max={1} step={0.05} onValueChange={([v]) => handleThemeChange("adminOpacity", v)} />
              </div>
              {/* CHAT */}
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <Label className="text-[10px] font-black uppercase opacity-40">Terminal Chat</Label>
                <Input type="color" value={theme.chatColor} onChange={(e) => handleThemeChange("chatColor", e.target.value)} className="h-10 bg-transparent border-white/5 p-1" />
                <Slider value={[theme.chatOpacity]} min={0.2} max={1} step={0.05} onValueChange={([v]) => handleThemeChange("chatOpacity", v)} />
              </div>
              {/* CALC */}
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <Label className="text-[10px] font-black uppercase opacity-40">Calculateurs BE</Label>
                <Input type="color" value={theme.calcColor} onChange={(e) => handleThemeChange("calcColor", e.target.value)} className="h-10 bg-transparent border-white/5 p-1" />
                <Slider value={[theme.calcOpacity]} min={0.2} max={1} step={0.05} onValueChange={([v]) => handleThemeChange("calcOpacity", v)} />
              </div>
              {/* DOCS */}
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <Label className="text-[10px] font-black uppercase opacity-40">Biblio Normative</Label>
                <Input type="color" value={theme.docsColor} onChange={(e) => handleThemeChange("docsColor", e.target.value)} className="h-10 bg-transparent border-white/5 p-1" />
                <Slider value={[theme.docsOpacity]} min={0.2} max={1} step={0.05} onValueChange={([v]) => handleThemeChange("docsOpacity", v)} />
              </div>
            </div>

            <div className="mt-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Label className="text-[11px] font-black uppercase text-zinc-400 flex items-center gap-2 mb-2"><Eye className="w-4 h-4" /> Translucidité Globale (Glassmorphism)</Label>
                <p className="text-[10px] text-zinc-600 uppercase italic">Ajuste le flou d'arrière-plan et la densité des composants vitrés standard.</p>
              </div>
              <div className="w-64">
                <Slider value={[theme.globalGlass]} min={0.1} max={1} step={0.05} onValueChange={([v]) => handleThemeChange("globalGlass", v)} />
                <div className="flex justify-between mt-2 text-[8px] font-mono opacity-40 uppercase"><span>Cristallin (10%)</span><span>Opaque (100%)</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NORMATIVE CORE */}
        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-primary">
              <Shield className="w-6 h-6" /> Noyau Normatif
            </CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase">Référentiels de calcul et standards industriels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Norme Active</Label>
                <Select value={config.activeNorm} onValueChange={(v) => handleConfigChange("activeNorm", v)}>
                  <SelectTrigger className="glass h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="NF C 15-100">NF C 15-100 (FR)</SelectItem>
                    <SelectItem value="RGIE">RGIE (BE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Moteur de Calcul</Label>
                <Select value={config.calculationEngine} onValueChange={(v) => handleConfigChange("calculationEngine", v)}>
                  <SelectTrigger className="glass h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass"><SelectItem value="UTE C 15-105">UTE C 15-105</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold opacity-50">Température de référence (°C)</Label>
              <Input type="number" value={config.ambientTemp} onChange={(e) => handleConfigChange("ambientTemp", e.target.value)} className="glass h-11" />
            </div>
          </CardContent>
        </Card>

        {/* AI ENGINE LOAD */}
        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-purple-500">
              <Cpu className="w-6 h-6" /> Moteur d'Inférence Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold opacity-50">Priorité Inférence</Label>
              <Select value={config.enginePriority} onValueChange={(v) => handleConfigChange("enginePriority", v)}>
                <SelectTrigger className="glass h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="Accuracy">PRÉCISION ABSOLUE</SelectItem>
                  <SelectItem value="Speed">VITESSE TURBO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
              <Label className="text-[10px] uppercase font-bold">Terminal Expert Mode</Label>
              <Switch checked={config.expertMode} onCheckedChange={(c) => handleConfigChange("expertMode", c)} />
            </div>
            {!isUnlocked ?
            <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] uppercase font-black text-primary">
                  <Lock className="w-4 h-4" /> Accès Restreint : Directives Maîtres
                </div>
                <div className="flex gap-2">
                  <Input
                  type="password"
                  placeholder="CODE_ROOT..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass h-10 border-primary/20 text-xs" />
                
                  <Button onClick={unlockTraining} className="bg-primary text-black font-black uppercase text-[10px] h-10 px-4 glow-emerald">DÉVERROUILLER</Button>
                </div>
              </div> :

            <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
                    <Unlock className="w-3 h-3 text-primary" /> Fichier d'entraînement (Directives Maîtres)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportTraining} className="glass text-[8px] h-7 border-primary/20 hover:border-primary/50 px-2 glow-emerald-soft">
                      <Download className="w-3 h-3 mr-1" /> EXPORTER CORE
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="glass text-[8px] h-7 border-primary/20 hover:border-primary/50 px-2">
                      <Upload className="w-3 h-3 mr-1" /> IMPORTER .JSON
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                    <Badge variant="outline" className="text-[8px] border-primary/40 text-primary">SYNC_ACTIF</Badge>
                  </div>
                </div>

                <Textarea
                value={config.trainingInstructions}
                onChange={(e) => handleConfigChange("trainingInstructions", e.target.value)}
                placeholder="Insérez ici les directives spécifiques pour entraîner le comportement de YEAI..."
                className="glass-admin min-h-[160px] text-xs font-mono border-primary/30 focus:border-primary transition-all shadow-inner" />
              

                <div className="flex items-center justify-between gap-4">
                  <p className="text-[9px] opacity-40 uppercase italic flex-1">
                    Ces instructions seront injectées dans le signal neural prioritaire.
                  </p>
                  <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary/20 hover:bg-primary text-primary hover:text-black border border-primary/50 text-[10px] font-black h-10 px-6 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] min-w-[180px]">
                  
                    {isSaving ?
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> :

                  <RefreshCw className="w-3 h-3 mr-2" />
                  }
                    {isSaving ? "INJECTION DU SIGNAL..." : "SYNCHRONISER LE NOYAU"}
                  </Button>
                </div>
              </div>
            }
          </CardContent>
        </Card>

        {/* SYSTEM STATUS WIDGET */}
        <div className="glass p-8 rounded-3xl border-primary/20 flex items-center gap-6 animate-pulse lg:col-span-2">
          <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#10b981]" />
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary italic">Signal Noyau : Nominal</p>
            <p className="text-xs opacity-60">Toutes les modifications sont appliquées instantanément aux clusters de calcul de l'Industrial OS.</p>
          </div>
        </div>
      </div>
    </div>);

}