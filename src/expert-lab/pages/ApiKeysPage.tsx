import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Plus,
  Search,
  Copy,
  Trash2,
  Eye,
  EyeOff,


  ShieldCheck,
  Binary } from
"lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiKeysPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean;}>({});
  const { toast } = useToast();

  const apiKeys = [
  {
    id: "YEAI_CORE_01",
    name: "Application Mobile Lab",
    key: "YEAI-PRO-4fX9mK8nQ2vR7wP1sL6tY3uE9bN5cZ8j",
    status: "active" as const,
    createdAt: "2024-01-15",
    lastUsed: "2 min",
    requests: 1247
  },
  {
    id: "YEAI_CORE_02",
    name: "Dashboard Ingénierie",
    key: "YEAI-PRO-8kL2nM5pQ9vR3wX6sY1tU4eZ7bN0cF5j",
    status: "active" as const,
    createdAt: "2024-01-10",
    lastUsed: "15 min",
    requests: 892
  }];


  const filteredKeys = apiKeys.filter((key) =>
  key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  key.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass border-primary/40 rounded-2xl flex items-center justify-center glow-emerald">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Access <span className="text-primary tracking-normal">Tokens</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Secure System Authentication</span>
            </div>
          </div>
        </div>
        <Button className="bg-primary text-black font-black uppercase tracking-widest h-12 px-8 glow-emerald border-0">
          <Plus className="w-4 h-4 mr-2" /> New Token
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input
            className="glass pl-10 h-12 border-primary/20 bg-black/20 font-mono text-xs"
            placeholder="Scanner les tokens actifs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {filteredKeys.map((apiKey) =>
        <Card key={apiKey.id} className="glass border-primary/10 hover:border-primary/30 transition-all group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:glow-emerald transition-all border border-primary/20">
                    <Binary className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{apiKey.name}</h3>
                    <p className="text-[10px] font-mono opacity-40">{apiKey.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="text-[9px] uppercase font-black tracking-widest border-primary/30 text-primary">Status_Authorized</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10 glass border-primary/10 hover:border-primary/50"><Copy className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 glass border-primary/10 hover:border-red-500/50 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs text-primary/80 mb-6 flex items-center justify-between">
                <span>{showKeys[apiKey.id] ? apiKey.key : "••••••••••••••••••••••••••••••••"}</span>
                <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKeys((prev) => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                className="hover:bg-primary/10 text-primary">
                
                  {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Date Émission</p>
                  <p className="text-xs font-mono font-black">{apiKey.createdAt}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Dernière Utilisation</p>
                  <p className="text-xs font-mono font-black">{apiKey.lastUsed}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Volume Requêtes</p>
                  <p className="text-xs font-mono font-black">{apiKey.requests} cycles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-[0.3em] opacity-30">
        Yeai Security Layer - Access Control Protocol v4.3.0
      </div>
    </div>);

}