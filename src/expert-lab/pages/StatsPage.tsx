import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Brain,
  Zap,
  Calendar,
  Activity,


  Layers } from
"lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StatsPage() {
  const statsData = [
  { title: "Calculs Labo", value: "1.2k", change: "+12.5%", trend: "up", icon: Activity, color: "text-primary" },
  { title: "Latence Moyenne", value: "420ms", change: "-8.3%", trend: "down", icon: Clock, color: "text-cyan-400" },
  { title: "Terminaux Actifs", value: "84", change: "+23.1%", trend: "up", icon: Users, color: "text-blue-500" },
  { title: "Inférences IA", value: "12,847", change: "+16.7%", trend: "up", icon: Brain, color: "text-purple-500" },
  { title: "Indice Précision", value: "99.2%", change: "+2.1%", trend: "up", icon: TrendingUp, color: "text-primary" },
  { title: "Débit Tokens", value: "2.4k/s", change: "+18.9%", trend: "up", icon: Zap, color: "text-primary" }];


  const topModels = [
  { name: "Gemini 3 Flash", requests: 4521, percentage: 35.2, color: "bg-primary" },
  { name: "GPT-4o Expert", requests: 3247, percentage: 25.3, color: "bg-blue-500" },
  { name: "Claude 3.5 Sonnet", requests: 2156, percentage: 16.8, color: "bg-purple-500" },
  { name: "Llama3 (Local)", requests: 1823, percentage: 14.2, color: "bg-cyan-400" }];


  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass border-primary/40 rounded-2xl flex items-center justify-center glow-emerald">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Performance <span className="text-primary tracking-normal">Analytics</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Real-time Telemetry Processing</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass border-primary/10 rounded-full">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">Dernières 24 Heures</span>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {statsData.map((stat, i) =>
        <Card key={i} className="glass border-primary/10 hover:border-primary/30 transition-all group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-primary/5 border border-primary/10 group-hover:glow-emerald transition-all`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-tighter ${stat.trend === 'up' ? 'text-primary border-primary/20' : 'text-blue-400 border-blue-400/20'}`}>
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1">{stat.title}</p>
                <p className="text-3xl font-black italic">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* MODEL DISTRIBUTION */}
        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> Charge par Modèle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {topModels.map((model, index) =>
            <div key={index} className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                  <span>{model.name}</span>
                  <span className="opacity-50">{model.requests} reqs</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                  className={`h-full ${model.color} glow-emerald transition-all duration-1000`}
                  style={{ width: `${model.percentage}%` }} />
                
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RESOURCE LOAD */}
        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-400" /> Infrastructure Load
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
            { label: "CPU CORE LOAD", val: "34%", color: "text-primary" },
            { label: "MEMORY_BUFFER", val: "12.4 GB", color: "text-cyan-400" },
            { label: "NEURAL_GPU_PUMP", val: "78%", color: "text-purple-500" },
            { label: "KERNEL_UPTIME", val: "99.8%", color: "text-primary" }].
            map((r, i) =>
            <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono uppercase opacity-40">{r.label}</span>
                <span className={`text-xl font-black italic ${r.color}`}>{r.val}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-[0.3em] opacity-30">
        Yeai Analytics Engine - v4.3.0 Optimized
      </div>
    </div>);

}