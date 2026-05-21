import React from "react";
import {
  Zap, Calculator, BookOpen, PenTool,
  History, Bell,
  ArrowUpRight, MoreVertical,
  Plus, ShieldAlert, Cpu } from
"lucide-react";
import { ProqSecondaryNav } from "@/components/ProqSecondaryNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ElectricianDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
            <ProqSecondaryNav theme="electrician" />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Espace Électricien</h1>
                        <p className="text-slate-500 font-medium">Prêt pour votre prochain audit normatif ?</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 h-11 px-6 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4" /> Nouveau Projet
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
          { label: "Calculs Effectués", val: "128", trend: "+12%", icon: Calculator, color: "text-emerald-600" },
          { label: "Schémas Actifs", val: "14", trend: "+2", icon: PenTool, color: "text-blue-600" },
          { label: "Alertes Normes", val: "0", trend: "OK", icon: ShieldAlert, color: "text-amber-600" }].
          map((s, i) =>
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className={cn("p-3 rounded-2xl bg-slate-50", s.color)}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="rounded-lg text-[10px] border-slate-100 font-mono">{s.trend}</Badge>
                                </div>
                                <div className="mt-4">
                                    <div className="text-3xl font-black text-slate-800">{s.val}</div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                                </div>
                            </CardContent>
                        </Card>
          )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Tools */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-emerald-500" /> Vos Outils Favoris
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
              { name: "Calcul Câbles", desc: "Suivant NF C 15-100", icon: Calculator, color: "bg-emerald-500" },
              { name: "Editeur Schéma", desc: "Unifilaire & Multi", icon: PenTool, color: "bg-blue-500" },
              { name: "Consultation NS 01", desc: "Texte Intégral", icon: BookOpen, color: "bg-purple-500" },
              { name: "Historique Rapports", desc: "42 documents", icon: History, color: "bg-slate-500" }].
              map((t, i) =>
              <div key={i} className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6", t.color)}>
                                        <t.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-800">{t.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{t.desc}</p>
                                    <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                                </div>
              )}
                        </div>

                        {/* Recent Activity Table Mock */}
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Derniers Projets</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {[
                  { name: "Résidence Kebe", date: "Il y a 2h", status: "Terminé", type: "Audit" },
                  { name: "Appartements Almadies", date: "Il y a 5h", status: "En cours", type: "Calcul" },
                  { name: "Showroom Proq", date: "Hier", status: "Terminé", type: "Schéma" }].
                  map((p, i) =>
                  <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{p.type} • {p.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">{p.status}</Badge>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                  )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" /> Notifications
                        </h2>
                        <ScrollArea className="h-[400px] w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
                            {[1, 2, 3, 4, 5].map((idx) =>
              <div key={idx} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors mb-2 cursor-pointer border-b border-slate-50 last:border-0 border-l-4 border-l-emerald-500">
                                    <p className="text-xs font-bold text-slate-800 mb-1">Nouvelle Révision NS 01-001</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2">Les sections de câbles pour le photovoltaïque ont été mises à jour.</p>
                                    <span className="text-[10px] text-slate-400 font-mono">05 FÉV. 2026</span>
                                </div>
              )}
                        </ScrollArea>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white overflow-hidden relative group">
                            <Zap className="absolute top-4 right-4 text-emerald-500/20 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold mb-2">Passez au Premium</h3>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">Exportez vos rapports en marque grise et accédez à l'IA experte en priorité.</p>
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl font-bold text-xs uppercase tracking-widest">
                                En savoir plus
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>);

}