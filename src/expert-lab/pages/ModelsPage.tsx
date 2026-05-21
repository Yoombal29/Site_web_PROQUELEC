import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,

  Search,


  RefreshCw,
  Cpu,



  ShieldCheck,
  Server } from
"lucide-react";

export default function ModelsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const models = [
  { name: "Gemini 3 Flash", provider: "Lovable", status: "Protocole_Link", size: "Cloud", lastUsed: "Dernière sec", reqs: "1.2k" },
  { name: "GPT-4o Expert", provider: "OpenAI", status: "Active", size: "API", lastUsed: "2 min", reqs: "842" },
  { name: "Llama3-8B", provider: "Ollama", status: "Local_Engine", size: "4.7 GB", lastUsed: "5 min", reqs: "234" },
  { name: "Claude-3-Sonnet", provider: "Anthropic", status: "Link_Active", size: "API", lastUsed: "1h", reqs: "156" }];


  const filteredModels = models.filter((model) =>
  model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass border-primary/40 rounded-2xl flex items-center justify-center glow-emerald">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Neural <span className="text-primary tracking-normal">Engines</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Authorized Inference Matrix</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-primary/10 hover:border-primary/40 text-[10px] uppercase font-bold tracking-widest h-10">
            <RefreshCw className="w-4 h-4 mr-2" /> Sync Engines
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input
            className="glass pl-10 h-12 border-primary/20 bg-black/20 font-mono text-xs"
            placeholder="Scanner les vecteurs de modèles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {filteredModels.map((model, i) =>
        <Card key={i} className="glass border-primary/10 hover:border-primary/40 group transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:glow-emerald transition-all border border-primary/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{model.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] uppercase font-black tracking-widest text-primary italic">{model.status}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary uppercase font-black tracking-[0.2em]">{model.provider}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Stockage/Type</p>
                  <p className="text-xs font-mono text-foreground font-black">{model.size}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Dernier Appel</p>
                  <p className="text-xs font-mono text-foreground font-black">{model.lastUsed}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Inférences</p>
                  <p className="text-xs font-mono text-foreground font-black">{model.reqs}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1 glass border-primary/10 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest h-10">Configuration</Button>
                <Button className="flex-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest h-10 border-0 glow-emerald">Défaut Engine</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SYSTEM BROADCAST */}
      <div className="p-6 glass border-primary/20 rounded-3xl bg-primary/5 relative overflow-hidden z-10 flex items-center gap-6">
        <Server className="w-12 h-12 text-primary shrink-0 opacity-40" />
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Serveur local Ollama détecté</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            YEAI détecte automatiquement vos moteurs d'inférence locaux. Pour une précision maximale dans les calculs de puissance (UTE), nous recommandons l'utilisation du noyau Google Gemini 3 Flash ou GPT-4o Expert.
          </p>
        </div>
      </div>
    </div>);

}