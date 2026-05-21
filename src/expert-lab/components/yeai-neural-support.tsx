import { Bot, Sparkles, Activity, ShieldCheck, Cpu } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface YeaiNeuralSupportProps {
  toolName: string;
  isProcessing?: boolean;
}

export function YeaiNeuralSupport({ toolName, isProcessing }: YeaiNeuralSupportProps) {
  const [load, setLoad] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      setLoad(0);
      const interval = setInterval(() => {
        setLoad((prev) => prev >= 100 ? 0 : prev + 5);
      }, 50);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setLoad(Math.floor(Math.random() * 15) + 85); // High idle load
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  return (
    <div className="hidden xl:flex flex-col w-64 border-l border-white/5 bg-black/20 p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                    <Bot className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">RENFORCEMENT_NEURAL</span>
                </div>
                <h3 className="text-sm font-black uppercase italic tracking-tighter text-foreground">
                    Liaison: <span className="text-primary">{toolName}</span>
                </h3>
                <p className="text-[9px] text-zinc-600 uppercase font-bold italic mt-2">Ce panneau surveille l'activité cérébrale de YEAI et garantit la conformité normative en temps réel sur l'outil actif.</p>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-60">
                        <span>Charge Synaptique</span>
                        <span className="text-primary">{load}%</span>
                    </div>
                    <Progress value={load} className="h-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {[
          { label: "VÉRIFICATEUR_NFC", status: "PRÊT", icon: ShieldCheck, color: "text-emerald-500" },
          { label: "MAPPING_BIM", status: "VEILLE", icon: Cpu, color: "text-blue-500" },
          { label: "SYNC_NOYAU", status: "ACTIF", icon: Activity, color: "text-primary" }].
          map((item) =>
          <div key={item.label} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3 group hover:border-primary/20 transition-all">
                            <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                            <div className="flex-1">
                                <p className="text-[8px] font-black uppercase opacity-40 leading-none">{item.label}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-[9px] font-bold ${item.status === 'PRÊT' ? 'text-foreground' : 'text-zinc-500'}`}>{item.status}</p>
                                    <div className={`w-1 h-1 rounded-full ${item.status === 'VEILLE' ? 'bg-zinc-700' : 'bg-primary animate-pulse'}`} />
                                </div>
                            </div>
                        </div>
          )}
                </div>
            </div>

            <div className="mt-auto p-4 rounded-[1.5rem] bg-zinc-900/50 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                    <Sparkles className="w-16 h-16" />
                </div>
                <p className="text-[9px] leading-relaxed text-zinc-500 font-medium italic">
                    "L'IA ne remplace pas l'ingénieur, elle le renforce. YEAI surveille chaque calcul pour garantir l'intégrité du réseau."
                </p>
            </div>
        </div>);

}