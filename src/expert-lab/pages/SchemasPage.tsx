import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mermaid from "mermaid";
import {
  GitBranch,
  Download,

  Zap,
  Plus,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  Layers,
  FileText,
  Eye } from
"lucide-react";
import { useToast } from "@/hooks/use-toast";

mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose", fontFamily: "Inter, sans-serif" });

type CircuitItem = {
  id: string;
  name: string;
  type: "disjoncteur" | "differentiel" | "prise" | "eclairage" | "chauffe_eau" | "four" | "plaque" | "lave_linge" | "lave_vaisselle" | "vmc" | "autre";
  amperage: string;
  phase: "mono" | "tri";
};

const CIRCUIT_TYPES = [
{ id: "disjoncteur", label: "Disjoncteur Divisionnaire", icon: "⚡" },
{ id: "differentiel", label: "Différentiel 30mA", icon: "🛡️" },
{ id: "prise", label: "Circuit Prises", icon: "🔌" },
{ id: "eclairage", label: "Circuit Éclairage", icon: "💡" },
{ id: "chauffe_eau", label: "Chauffe-eau", icon: "🚿" },
{ id: "four", label: "Four électrique", icon: "🔥" },
{ id: "plaque", label: "Plaque de cuisson", icon: "🍳" },
{ id: "lave_linge", label: "Lave-linge", icon: "🧺" },
{ id: "lave_vaisselle", label: "Lave-vaisselle", icon: "🍽️" },
{ id: "vmc", label: "VMC", icon: "🌀" },
{ id: "autre", label: "Autre", icon: "⚙️" }];


const TEMPLATES = [
{
  id: "residential_simple",
  name: "Résidentiel Simple",
  description: "Tableau T1/T2 standard",
  circuits: [
  { id: "1", name: "Diff. Type A 40A", type: "differentiel", amperage: "40", phase: "mono" },
  { id: "2", name: "Éclairage Salon", type: "eclairage", amperage: "10", phase: "mono" },
  { id: "3", name: "Prises Salon", type: "prise", amperage: "16", phase: "mono" },
  { id: "4", name: "Prises Cuisine", type: "prise", amperage: "16", phase: "mono" },
  { id: "5", name: "Lave-linge", type: "lave_linge", amperage: "20", phase: "mono" }] as
  CircuitItem[]
},
{
  id: "residential_full",
  name: "Résidentiel Complet",
  description: "Tableau T3+ avec spécialisés",
  circuits: [
  { id: "1", name: "Diff. Type A 40A", type: "differentiel", amperage: "40", phase: "mono" },
  { id: "2", name: "Diff. Type AC 40A", type: "differentiel", amperage: "40", phase: "mono" },
  { id: "3", name: "Éclairage", type: "eclairage", amperage: "10", phase: "mono" },
  { id: "4", name: "Prises Séjour", type: "prise", amperage: "16", phase: "mono" },
  { id: "5", name: "Prises Cuisine", type: "prise", amperage: "16", phase: "mono" },
  { id: "6", name: "Four", type: "four", amperage: "20", phase: "mono" },
  { id: "7", name: "Plaque", type: "plaque", amperage: "32", phase: "mono" },
  { id: "8", name: "Lave-linge", type: "lave_linge", amperage: "20", phase: "mono" },
  { id: "9", name: "Lave-vaisselle", type: "lave_vaisselle", amperage: "20", phase: "mono" },
  { id: "10", name: "Chauffe-eau", type: "chauffe_eau", amperage: "20", phase: "mono" },
  { id: "11", name: "VMC", type: "vmc", amperage: "2", phase: "mono" }] as
  CircuitItem[]
},
{
  id: "triphasé",
  name: "Installation Triphasée",
  description: "Tableau triphasé équilibré",
  circuits: [
  { id: "1", name: "AGCP 40A 3P+N", type: "disjoncteur", amperage: "40", phase: "tri" },
  { id: "2", name: "Diff. 40A Type A", type: "differentiel", amperage: "40", phase: "mono" },
  { id: "3", name: "Diff. 63A Type AC", type: "differentiel", amperage: "63", phase: "mono" },
  { id: "4", name: "Éclairage L1", type: "eclairage", amperage: "10", phase: "mono" },
  { id: "5", name: "Prises L2", type: "prise", amperage: "16", phase: "mono" },
  { id: "6", name: "Plaque L3", type: "plaque", amperage: "32", phase: "tri" }] as
  CircuitItem[]
}];


export default function SchemasPage() {
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [mermaidCode, setMermaidCode] = useState("");
  const [tableName, setTableName] = useState("TGBT Principal");
  const [copied, setCopied] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generateMermaidCode = () => {
    if (circuits.length === 0) {
      setMermaidCode("");
      return;
    }

    let code = `graph TD\n`;
    code += `    AGCP[🔌 AGCP<br/>Disjoncteur Abonné] --> TGBT[📦 ${tableName}]\n`;

    // Group by type for better visualization
    const diffs = circuits.filter((c) => c.type === "differentiel");
    const others = circuits.filter((c) => c.type !== "differentiel");

    if (diffs.length > 0) {
      diffs.forEach((diff, i) => {
        code += `    TGBT --> DIFF${i}[🛡️ ${diff.name}<br/>${diff.amperage}A 30mA]\n`;

        // Connect circuits to differentials
        const startIdx = Math.floor(others.length / diffs.length) * i;
        const endIdx = i === diffs.length - 1 ? others.length : Math.floor(others.length / diffs.length) * (i + 1);

        others.slice(startIdx, endIdx).forEach((c) => {
          const typeInfo = CIRCUIT_TYPES.find((t) => t.id === c.type);
          const icon = typeInfo?.icon || "⚡";
          code += `    DIFF${i} --> C${c.id}[${icon} ${c.name}<br/>${c.amperage}A]\n`;
        });
      });
    } else {
      others.forEach((c) => {
        const typeInfo = CIRCUIT_TYPES.find((t) => t.id === c.type);
        const icon = typeInfo?.icon || "⚡";
        code += `    TGBT --> C${c.id}[${icon} ${c.name}<br/>${c.amperage}A]\n`;
      });
    }

    // Add styling
    code += `\n    style AGCP fill:#059669,stroke:#10b981,color:#fff\n`;
    code += `    style TGBT fill:#0891b2,stroke:#06b6d4,color:#fff\n`;
    diffs.forEach((_, i) => {
      code += `    style DIFF${i} fill:#7c3aed,stroke:#a78bfa,color:#fff\n`;
    });

    setMermaidCode(code);
  };

  useEffect(() => {
    generateMermaidCode();
  }, [circuits, tableName]);

  useEffect(() => {
    if (mermaidCode && diagramRef.current) {
      try {
        mermaid.render(`schema-${Date.now()}`, mermaidCode).then(({ svg }) => {
          if (diagramRef.current) diagramRef.current.innerHTML = svg;
        });
      } catch (e) {
        console.error("Mermaid error:", e);
      }
    }
  }, [mermaidCode]);

  const addCircuit = () => {
    const newCircuit: CircuitItem = {
      id: Date.now().toString(),
      name: "Nouveau Circuit",
      type: "prise",
      amperage: "16",
      phase: "mono"
    };
    setCircuits([...circuits, newCircuit]);
  };

  const updateCircuit = (id: string, updates: Partial<CircuitItem>) => {
    setCircuits(circuits.map((c) => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCircuit = (id: string) => {
    setCircuits(circuits.filter((c) => c.id !== id));
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setCircuits(template.circuits);
    toast({ title: "Template Chargé", description: template.name });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié", description: "Code Mermaid copié dans le presse-papier" });
  };

  const exportSVG = () => {
    const svg = diagramRef.current?.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `schema_${tableName.replace(/\s/g, "_")}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export SVG", description: "Schéma téléchargé" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 relative overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
            <GitBranch className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Schémas <span className="text-primary tracking-normal">Unifilaires</span>
            </h1>
            <Badge variant="outline" className="mt-1 border-border text-muted-foreground bg-secondary/30 text-[9px] font-bold uppercase tracking-wider">
              Concepteur Graphique • NF C 15-100
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportSVG} variant="outline" className="h-10 border-border hover:bg-secondary">
            <Download className="w-4 h-4 mr-2 text-primary" />
            <span className="text-[10px] uppercase font-bold">Exporter en SVG</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 relative z-10">
        {/* LEFT: CONFIGURATION */}
        <div className="lg:col-span-5 space-y-4">
          {/* TEMPLATES */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="uppercase font-bold text-[11px]">Modèles Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) =>
                <Button
                  key={t.id}
                  variant="outline"
                  onClick={() => loadTemplate(t)}
                  className="h-auto py-3 px-3 flex flex-col items-center gap-1 border-border hover:bg-secondary">
                  
                    <span className="text-[10px] font-bold uppercase">{t.name}</span>
                    <span className="text-[8px] text-muted-foreground">{t.description}</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TABLE NAME */}
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-4">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nom de l'Installation</Label>
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="h-10 mt-2 border-border bg-secondary/50"
                placeholder="Ex: TGBT Principal" />
              
            </CardContent>
          </Card>

          {/* CIRCUITS LIST */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="uppercase font-bold text-[11px]">Circuits ({circuits.length})</span>
                </CardTitle>
                <Button size="sm" onClick={addCircuit} className="h-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {circuits.length === 0 ?
              <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs uppercase font-medium">Configurez votre premier circuit</p>
                </div> :

              circuits.map((circuit) =>
              <div key={circuit.id} className="p-3 bg-secondary/30 rounded-xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                    value={circuit.name}
                    onChange={(e) => updateCircuit(circuit.id, { name: e.target.value })}
                    className="h-8 text-xs bg-transparent border-none p-0 font-bold" />
                  
                      <Button variant="ghost" size="icon" onClick={() => removeCircuit(circuit.id)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={circuit.type} onValueChange={(v) => updateCircuit(circuit.id, { type: v as unknown })}>
                        <SelectTrigger className="h-8 text-[10px] bg-card border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {CIRCUIT_TYPES.map((t) =>
                      <SelectItem key={t.id} value={t.id} className="text-[10px]">
                              {t.icon} {t.label}
                            </SelectItem>
                      )}
                        </SelectContent>
                      </Select>
                      <Input
                    type="number"
                    value={circuit.amperage}
                    onChange={(e) => updateCircuit(circuit.id, { amperage: e.target.value })}
                    className="h-8 text-[10px] bg-card border-border"
                    placeholder="Ampères" />
                  
                      <Select value={circuit.phase} onValueChange={(v) => updateCircuit(circuit.id, { phase: v as unknown })}>
                        <SelectTrigger className="h-8 text-[10px] bg-card border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="mono">Mono</SelectItem>
                          <SelectItem value="tri">Tri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
              )
              }
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs defaultValue="preview">
            <TabsList className="bg-secondary border border-border p-1">
              <TabsTrigger value="preview" className="text-[10px] uppercase font-bold">
                <Eye className="w-3 h-3 mr-1" /> Aperçu Visuel
              </TabsTrigger>
              <TabsTrigger value="code" className="text-[10px] uppercase font-bold">
                <FileText className="w-3 h-3 mr-1" /> Code Diagramme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <Card className="border-border bg-card shadow-sm min-h-[500px]">
                <CardContent className="p-6">
                  {mermaidCode ?
                  <div ref={diagramRef} className="flex items-center justify-center min-h-[400px] overflow-auto" /> :

                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                      <GitBranch className="w-16 h-16 opacity-10 mb-4" />
                      <p className="text-sm uppercase font-bold tracking-wider">Génération du Schéma...</p>
                    </div>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code">
              <Card className="glass border-teal-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] uppercase font-black text-zinc-400">Code Mermaid</CardTitle>
                    <Button size="sm" variant="outline" onClick={copyCode} className="h-7 glass">
                      {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      <span className="text-[9px]">{copied ? "Copié!" : "Copier"}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={mermaidCode}
                    readOnly
                    className="glass h-[400px] font-mono text-xs text-teal-300" />
                  
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>);

}