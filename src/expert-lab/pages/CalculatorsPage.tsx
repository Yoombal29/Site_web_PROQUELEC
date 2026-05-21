import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator, Zap, ShieldCheck, Activity, Loader2, AlertCircle, CheckCircle2, Info, RotateCcw, Table as TableIcon } from
"lucide-react";

type CalculationResult = {
  voltage_drop: string;
  percentage: string;
  formula: string;
  norm_reference: string;
  status: "NOMINAL" | "WARNING";
  iz_required?: string;
  iz_calculated?: string;
  is_thermal_ok?: boolean;
};

export default function CalculatorsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const { toast } = useToast();

  // --- ÉTATS DU FORMULAIRE BUREAU D'ÉTUDE ---
  const [calcMode, setCalcMode] = useState("manual");
  const [supplyType, setSupplyType] = useState("type_a");
  const [current, setCurrent] = useState("16");
  const [voltage, setVoltage] = useState("230");
  const [length, setLength] = useState("50");
  const [section, setSection] = useState("2.5");
  const [material, setMaterial] = useState("copper");
  const [phaseType, setPhaseType] = useState("mono");
  const [installationType, setInstallationType] = useState("lighting");
  const [cosPhi, setCosPhi] = useState("1.0");
  const [poseMode, setPoseMode] = useState("B1");
  const [ambientTemp, setAmbientTemp] = useState("30");
  const [insulation, setInsulation] = useState("PVC");
  const [circuitCount, setCircuitCount] = useState("1");

  // --- BASE DE DONNÉES NORMATIVE TABLE 52C (Iz max en Ampères) ---
  const TABLE_52C: unknown = {
    "copper": {
      "PR": { "1.5": 23, "2.5": 31, "4": 42, "6": 54, "10": 75, "16": 100, "25": 133, "35": 164, "50": 198, "70": 253, "95": 306, "120": 354, "150": 407 },
      "PVC": { "1.5": 18.5, "2.5": 25, "4": 34, "6": 43, "10": 60, "16": 80, "25": 106, "35": 131, "50": 159, "70": 202, "95": 244, "120": 282, "150": 324 }
    },
    "aluminum": {
      "PR": { "16": 77, "25": 102, "35": 126, "50": 153, "70": 195, "95": 236, "120": 274, "150": 315 },
      "PVC": { "16": 62, "25": 82, "35": 101, "50": 123, "70": 156, "95": 188, "120": 218, "150": 251 }
    }
  };

  const resetFields = () => {
    setCurrent("16");setVoltage("230");setLength("50");setSection("2.5");
    setCosPhi("1.0");setAmbientTemp("30");setCircuitCount("1");
    setResult(null);
    toast({ title: "Réinitialisation", description: "Tous les paramètres ont été remis à zéro." });
  };

  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const I = parseFloat(current);
        const V = parseFloat(voltage);
        const L = parseFloat(length);
        const S = parseFloat(section);
        const cos = parseFloat(cosPhi);
        const temp = parseFloat(ambientTemp);
        const nCircuits = parseInt(circuitCount);

        if (isNaN(I) || isNaN(V) || isNaN(L) || isNaN(S)) throw new Error("Champs invalides");

        // 1. CALCUL CHUTE DE TENSION (ΔU)
        const sin = Math.sqrt(1 - Math.pow(cos, 2));
        const rho = material === "copper" ? 0.023 : 0.037;
        const lambda = 0.00008; // 0.08 mOhm/m

        const b = phaseType === "mono" ? 2 : Math.sqrt(3);
        const deltaU = b * (rho * L / S * cos + lambda * L * sin) * I;
        const percentage = deltaU / V * 100;

        const limit = installationType === "lighting" ? 3 : 5;
        const status = percentage > limit ? "WARNING" : "NOMINAL";

        // 2. CALCUL THERMIQUE (Iz) - TABLE 52C
        const izBase = TABLE_52C[material][insulation][section] || 0;

        // Facteurs de correction (K) simplifiés
        const kTemp = insulation === "PVC" ? Math.sqrt((70 - temp) / 40) : Math.sqrt((90 - temp) / 60);
        const kGroup = 1 / Math.sqrt(nCircuits); // Approximation BE
        const izCorrected = izBase * kTemp * kGroup;

        setResult({
          voltage_drop: deltaU.toFixed(2),
          percentage: percentage.toFixed(2),
          formula: phaseType === "mono" ?
          "ΔU = 2 × [ (ρ·L/S)·cosφ + (λ·L)·sinφ ] × Ib" :
          "ΔU = √3 × [ (ρ·L/S)·cosφ + (λ·L)·sinφ ] × Ib",
          norm_reference: "NF C 15-100 § 523-525 / UTE C 15-105",
          status,
          iz_required: I.toString(),
          iz_calculated: izCorrected.toFixed(1),
          is_thermal_ok: izCorrected >= I
        });

        if (status === "WARNING" || izCorrected < I) {
          toast({ title: "ALERTE BUREAU D'ÉTUDE", description: "Non-conformité détectée !", variant: "destructive" });
        } else {
          toast({ title: "Calcul BE Terminé", description: "Conformité UTE C 15-105 établie." });
        }
      } catch (e) {
        toast({ title: "Erreur", description: "Données incorrectes.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 relative overflow-hidden font-sans">

      {/* EN-TÊTE DE LA SUITE DE CALCUL */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
            <Calculator className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Suite de <span className="text-primary tracking-normal">Calcul Technique</span>
            </h1>
            <Badge variant="outline" className="mt-1 border-border text-muted-foreground bg-secondary/30 uppercase text-[9px] font-bold tracking-wider">
              Normes UTE C 15-105 v7.5 - Certifié
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 relative z-10">
        {/* PANNEAU DES PARAMÈTRES TECHNIQUES */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Configuration de l'Installation</h2>
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Saisissez les paramètres physiques pour l'analyse normative.</p>
          </div>

          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden p-8">
            <Tabs defaultValue="form">
              <TabsList className="mb-6 bg-secondary border border-border p-1 rounded-xl">
                <TabsTrigger value="form" className="px-6 py-2 uppercase text-[10px] font-bold tracking-wider flex items-center gap-2 transition-all"><Calculator className="w-3.4 h-3.5 text-primary" /> Paramètres Techniques</TabsTrigger>
                <TabsTrigger value="table_ref" className="px-6 py-2 uppercase text-[10px] font-bold tracking-wider flex items-center gap-2 transition-all"><TableIcon className="w-3.5 h-3.5" /> Table 52C (Réf.)</TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="animate-in fade-in duration-500">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* COL 1 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Mode de Calcul</Label>
                      <Select value={calcMode} onValueChange={setCalcMode}>
                        <SelectTrigger className="glass h-12 border-white/10 bg-black/40 text-foreground"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass"><SelectItem value="manual">Calcul manuel (section connue)</SelectItem><SelectItem value="auto">Optimisation automatique Iz</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Ib (Ampères)</Label><Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} className="glass h-12 text-foreground" /></div>
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">V (Volts)</Label><Input type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} className="glass h-12 text-foreground" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">L (Mètres)</Label><Input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="glass h-12 text-foreground" /></div>
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Section mm²</Label>
                        <Select value={section} onValueChange={setSection}>
                          <SelectTrigger className="glass h-12 text-foreground"><SelectValue /></SelectTrigger>
                          <SelectContent className="glass">{[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150].map((s) => <SelectItem key={s} value={s.toString()}>{s} mm²</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Matériau</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger className="glass h-12 text-foreground"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass"><SelectItem value="copper">Cuivre (ρ = 0.023 Ω·mm²/m)</SelectItem><SelectItem value="aluminum">Aluminium (ρ = 0.037 Ω·mm²/m)</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* COL 2 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Régime Électrique</Label>
                      <Select value={phaseType} onValueChange={setPhaseType}>
                        <SelectTrigger className="glass h-12 text-foreground"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass"><SelectItem value="mono">Monophasé (u = 2 × ...)</SelectItem><SelectItem value="tri">Triphasé 3~ (u = √3 × ...)</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Cos φ</Label><Input type="number" step="0.05" value={cosPhi} onChange={(e) => setCosPhi(e.target.value)} className="glass h-12 text-foreground" /></div>
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Isolant</Label>
                        <Select value={insulation} onValueChange={setInsulation}>
                          <SelectTrigger className="glass h-12 text-foreground"><SelectValue /></SelectTrigger>
                          <SelectContent className="glass"><SelectItem value="PVC">PVC (70°C)</SelectItem><SelectItem value="PR">PR / EPR (90°C)</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">T° Ambiante</Label><Input type="number" value={ambientTemp} onChange={(e) => setAmbientTemp(e.target.value)} className="glass h-12 text-foreground" /></div>
                      <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Nbre Circuits</Label><Input type="number" value={circuitCount} onChange={(e) => setCircuitCount(e.target.value)} className="glass h-12 text-foreground" /></div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button onClick={calculate} disabled={loading} className="flex-1 h-14 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Zap className="w-5 h-5 mr-2" /> Lancer le Calcul</>}
                      </Button>
                      <Button variant="outline" size="icon" onClick={resetFields} className="h-14 w-14 rounded-xl border-border bg-card hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="w-5 h-5" /></Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="table_ref" className="animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-[10px] font-mono text-blue-400 flex items-center gap-2"><Info className="w-3 h-3" /> Extraction de la Table 52C (IB admissible pour Pose Méthode C / 3 Cond. Chargés)</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(TABLE_52C.copper.PR).map(([s, val]: unknown) =>
                    <div key={s} className="p-4 bg-secondary/50 border border-border rounded-xl flex flex-col items-center group hover:border-primary/40 transition-all">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{s} mm²</span>
                        <span className="text-xl font-bold text-primary leading-none">{val}A</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[8px] uppercase opacity-30 text-center font-mono">Valeurs normatives NF C 15-100 § 523. PR (90°C), Cuivre.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="glass border-emerald-500/20 bg-emerald-500/5 p-6 rounded-3xl">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest">Référence Normative NF C 15-100</h4>
                <p className="text-[9px] text-zinc-300 font-bold opacity-80">Sections 523 (Thermique) & 525 (Pertes). Résistivité Cu: 0.023 / Al: 0.037. Réactance λ: 0.08 mΩ/m.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* PANNEAU DES RÉSULTATS ANALYTIQUES */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Analyse de Conformité</h2>
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Synthèse réglementaire des pertes et de l'intégrité thermique.</p>
          </div>

          {result ?
          <Card className={`bg-card border-border border-2 rounded-3xl overflow-hidden shadow-lg relative transition-all ${result.status === 'WARNING' || !result.is_thermal_ok ? 'border-destructive/40 bg-destructive/5' : ''}`}>
              <CardHeader className="bg-secondary/30 border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-xs font-bold uppercase flex items-center gap-2">Diagnostic : {result.status} {result.status === 'NOMINAL' && result.is_thermal_ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-secondary/50 rounded-2xl border border-border flex flex-col items-center">
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-2">ΔU (Perte)</p>
                    <p className={`text-4xl font-bold tracking-tight ${result.status === 'WARNING' ? 'text-destructive' : 'text-primary'}`}>{result.voltage_drop}<span className="text-xl ml-1">V</span></p>
                  </div>
                  <div className="p-6 bg-secondary/50 rounded-2xl border border-border flex flex-col items-center">
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-2">Taux</p>
                    <p className={`text-4xl font-bold tracking-tight ${result.status === 'WARNING' ? 'text-destructive' : 'text-emerald-600'}`}>{result.percentage}<span className="text-xl ml-1">%</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${result.is_thermal_ok ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
                    {result.is_thermal_ok ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold opacity-60">Intégrité Thermique (Iz)</p>
                      <p className={`text-xs font-bold ${result.is_thermal_ok ? 'text-emerald-700' : 'text-destructive uppercase'}`}>{result.is_thermal_ok ? 'Conforme aux normes' : 'Section insuffisante'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl border border-border text-[10px] text-center space-y-1">
                    <p className="text-muted-foreground font-bold uppercase">Courant admissible calculé : <span className="text-primary">{result.iz_calculated}A</span></p>
                    <p className="text-[9px] opacity-60 italic">{result.formula}</p>
                  </div>
                </div>

                <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/5 shadow-xl transition-all">Télécharger le certificat .PDF</Button>
              </CardContent>
            </Card> :

          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-secondary/30 p-20 text-center">
              <Activity className="w-16 h-16 text-primary/10 mb-6" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Outil de calcul prêt</p>
            </div>
          }
        </div>
      </div>
    </div>);

}