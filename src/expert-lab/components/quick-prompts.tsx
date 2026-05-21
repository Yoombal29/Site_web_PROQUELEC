import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import {
  Zap,
  Calculator,
  Shield,
  Cable,
  Lightbulb,
  Box,
  FileText,
  Thermometer,
  CircuitBoard,
  ChevronRight,
  Sparkles } from
"lucide-react";

type QuickPrompt = {
  id: string;
  label: string;
  prompt: string;
  category: string;
  icon: React.ReactNode;
};

const QUICK_PROMPTS: QuickPrompt[] = [
// Calculs
{
  id: "calc_voltage_drop",
  label: "Calcul ΔU",
  prompt: "Calcule la chute de tension pour un câble 3G2.5mm² cuivre, 30m de longueur, alimentant un circuit 16A en monophasé 230V, cos φ = 0.85, mode de pose B1.",
  category: "Calculs",
  icon: <Calculator className="w-4 h-4" />
},
{
  id: "calc_section",
  label: "Section câble",
  prompt: "Détermine la section de câble optimale pour alimenter une charge de 7kW à 45m du tableau en triphasé 400V. Contraintes: chute de tension max 3%, pose en chemin de câbles.",
  category: "Calculs",
  icon: <Cable className="w-4 h-4" />
},
{
  id: "calc_icc",
  label: "Court-circuit",
  prompt: "Calcule le courant de court-circuit présumé au niveau d'un tableau divisionnaire situé à 25m du TGBT. Impédance amont 0.5Ω, câble 4x10mm² Cu.",
  category: "Calculs",
  icon: <Zap className="w-4 h-4" />
},
{
  id: "calc_thermal",
  label: "Bilan thermique",
  prompt: "Effectue un bilan thermique pour une armoire électrique 800x600x300mm contenant 15 disjoncteurs, 2 variateurs de fréquence 5.5kW et un automate. Température ambiante 35°C.",
  category: "Calculs",
  icon: <Thermometer className="w-4 h-4" />
},

// Normes
{
  id: "norm_protection",
  label: "Protection 30mA",
  prompt: "Explique les règles de la NF C 15-100 concernant la protection différentielle 30mA. Quels circuits doivent obligatoirement être protégés? Quelles sont les exceptions?",
  category: "Normes",
  icon: <Shield className="w-4 h-4" />
},
{
  id: "norm_sections",
  label: "Sections imposées",
  prompt: "Quelles sont les sections minimales imposées par la NF C 15-100 pour les différents circuits d'une installation domestique? Prises, éclairage, circuits spécialisés.",
  category: "Normes",
  icon: <FileText className="w-4 h-4" />
},
{
  id: "norm_sdb",
  label: "Volumes SDB",
  prompt: "Détaille les 4 volumes de protection dans une salle de bain selon la NF C 15-100. Quels équipements sont autorisés dans chaque volume? Quelles protections sont requises?",
  category: "Normes",
  icon: <Shield className="w-4 h-4" />
},

// BIM & Visuels
{
  id: "bim_tableau",
  label: "Rendu tableau",
  prompt: "Génère un rendu BIM 3D haute fidélité d'un tableau électrique résidentiel 3 rangées avec disjoncteurs Schneider, 2 interrupteurs différentiels 40A 30mA Type A et AC, vue isométrique 45°.",
  category: "BIM",
  icon: <Box className="w-4 h-4" />
},
{
  id: "bim_disjoncteur",
  label: "MCB isolé",
  prompt: "Dessine un disjoncteur modulaire magnéto-thermique 16A courbe C en vue isométrique BIM avec détail des bornes à vis, rail DIN visible, style Schneider iC60.",
  category: "BIM",
  icon: <CircuitBoard className="w-4 h-4" />
},
{
  id: "bim_differentiel",
  label: "Différentiel 3D",
  prompt: "Génère un interrupteur différentiel 63A 30mA Type A bipolaire en vue éclatée 3D, montrant le mécanisme interne de détection du courant de fuite, style technique BIM.",
  category: "BIM",
  icon: <Lightbulb className="w-4 h-4" />
},

// Analyse
{
  id: "audit_tableau",
  label: "Audit tableau",
  prompt: "Analyse cette photo de tableau électrique et identifie les non-conformités potentielles par rapport à la NF C 15-100: protection différentielle, repérage, réserve modulaire, serrage.",
  category: "Analyse",
  icon: <Shield className="w-4 h-4" />
},
{
  id: "audit_schema",
  label: "Vérif. schéma",
  prompt: "Vérifie ce schéma unifilaire et indique s'il est conforme à la NF C 15-100. Points à vérifier: sélectivité, répartition équilibrée, sections, protections.",
  category: "Analyse",
  icon: <FileText className="w-4 h-4" />
}];


const CATEGORIES = ["Tous", ...new Set(QUICK_PROMPTS.map((p) => p.category))];

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function QuickPrompts({ onSelectPrompt }: QuickPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [isOpen, setIsOpen] = useState(false);

  const filteredPrompts = selectedCategory === "Tous" ?
  QUICK_PROMPTS :
  QUICK_PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-cyan-400 gap-2 h-9 px-4 rounded-full transition-all shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]">
          
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Prompts Rapides</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-[480px] p-0 bg-[#0f172a] border border-cyan-500/30 shadow-2xl shadow-cyan-900/40 rounded-xl overflow-hidden backdrop-blur-xl"
        sideOffset={16}
        collisionPadding={20}>
        
        {/* Header Section */}
        <div className="p-4 bg-[#1e293b]/50 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Templates de Requêtes</h4>
            </div>
            <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-300 bg-cyan-950/30 h-5">
              {QUICK_PROMPTS.length} templates
            </Badge>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {CATEGORIES.map((cat) =>
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                    px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all border
                    ${selectedCategory === cat ?
                'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_-3px_rgba(6,182,212,0.5)] transform scale-105' :
                'bg-[#020617] text-slate-400 border-slate-700 hover:border-cyan-500/50 hover:text-white'}
                  `} aria-label="Action">
                
                  {cat}
                </button>
              )}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>

        {/* List Section */}
        <ScrollArea className="h-[280px] bg-[#020617]">
          <div className="p-2 space-y-1">
            {filteredPrompts.map((prompt) =>
            <button
              key={prompt.id}
              onClick={() => {onSelectPrompt(prompt.prompt);setIsOpen(false);}}
              className="w-full text-left p-3 rounded-lg hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/30 transition-all group flex items-start gap-3.5 relative overflow-hidden" aria-label="Action">
              
                {/* Icons */}
                <div className="w-9 h-9 rounded-lg bg-[#0f172a] border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-cyan-500/30 group-hover:bg-cyan-900/20 group-hover:text-cyan-400 text-slate-500 transition-all shadow-sm z-10">
                  {prompt.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5 z-10">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {prompt.label}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 group-hover:border-cyan-500/20 group-hover:text-cyan-200/50 transition-colors">
                      {prompt.category}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 group-hover:text-slate-300 leading-relaxed line-clamp-2 font-medium">
                    {prompt.prompt}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all self-center transform group-hover:translate-x-1 z-10" />

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>);

}