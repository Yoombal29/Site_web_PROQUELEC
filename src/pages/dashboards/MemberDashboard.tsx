import React from "react";
import {
  Users, ShieldCheck, Activity, BarChart,
  Info,
  ArrowUpRight, MoreVertical,
  Plus, History, FileText, Globe, GraduationCap } from
"lucide-react";
import { ProqSecondaryNav } from "@/components/ProqSecondaryNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MemberDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
            <ProqSecondaryNav theme="member" />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Espace Membre</h1>
                        <p className="text-slate-500 font-medium">Plateforme de gouvernance et de veille stratégique.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 h-11 px-6 shadow-lg shadow-indigo-500/20">
                            <Plus className="w-4 h-4" /> Nouvelle Initiative
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
          { label: "Projets en cours", val: "12", trend: "+2", icon: Activity, color: "text-indigo-600" },
          { label: "Membres Actifs", val: "1,240", trend: "+5%", icon: Users, color: "text-emerald-600" },
          { label: "Votes Ouverts", val: "3", trend: "Important", icon: ShieldCheck, color: "text-amber-600" }].
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
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-500" /> Veille & Gouvernance
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
              { name: "Commission Normes", desc: "Révisions & Proposition", icon: ShieldCheck, color: "bg-indigo-500" },
              { name: "Rapports Sectoriels", desc: "Données & Statistiques", icon: BarChart, color: "bg-emerald-500" },
              { name: "Espace Vote", desc: "Démocratie Participative", icon: Users, color: "bg-purple-500" },
              { name: "Académie Membre", desc: "Webinaires & Coaching", icon: GraduationCap, color: "bg-amber-500" }].
              map((t, i) =>
              <div key={i} className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6", t.color)}>
                                        <t.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-800">{t.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{t.desc}</p>
                                    <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                                </div>
              )}
                        </div>

                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Flux d'Audit Associatif</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {[
                  { name: "Révision de l'Article 24 (NS)", date: "En cours", status: "Audit", type: "Norme" },
                  { name: "Appel d'offres Labellisateur", date: "Clos", status: "Terminé", type: "Admin" },
                  { name: "Convention COSEC-PROQ", date: "Signé", status: "Partenariat", type: "Stratégie" }].
                  map((p, i) =>
                  <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
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

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-500" /> Agenda Stratégique
                        </h2>
                        <ScrollArea className="h-[400px] w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
                            {[
              { title: "Assemblée Générale", time: "10:00", day: "20 FÉV" },
              { title: "Comité de Direction", time: "14:30", day: "22 FÉV" },
              { title: "Audit de Conformité Annuel", time: "09:00", day: "01 MAR" }].
              map((ev, idx) =>
              <div key={idx} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors mb-2 cursor-pointer border-b border-slate-50 last:border-0 border-l-4 border-l-indigo-500 flex gap-4">
                                    <div className="text-center min-w-[50px]">
                                        <div className="text-xs font-black text-indigo-600 uppercase">{ev.day.split(' ')[1]}</div>
                                        <div className="text-lg font-black text-slate-800 leading-tight">{ev.day.split(' ')[0]}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{ev.title}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{ev.time}</p>
                                    </div>
                                </div>
              )}
                        </ScrollArea>

                        <div className="bg-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative group shadow-2xl">
                            <Info className="absolute top-4 right-4 text-white/5 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold mb-2">Transparence Totale</h3>
                            <p className="text-xs text-indigo-200 leading-relaxed mb-4">Accédez aux comptes rendus d'audit et aux bilans financiers de l'exercice 2025.</p>
                            <Button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white border-none rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
                                <FileText className="w-3.5 h-3.5 mr-2" /> Rapports 2025
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>);

}