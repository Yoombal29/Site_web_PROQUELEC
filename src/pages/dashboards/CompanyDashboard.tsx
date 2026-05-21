import React from "react";
import {
  Users, FileText, Award,
  BarChart3,
  ArrowUpRight, MoreVertical,
  Plus, ShieldCheck, Briefcase, TrendingUp } from
"lucide-react";
import { ProqSecondaryNav } from "@/components/ProqSecondaryNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CompanyDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
            <ProqSecondaryNav theme="company" />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Espace Entreprise</h1>
                        <p className="text-slate-500 font-medium">Gérez vos certifications et l'excellence de vos chantiers.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2 h-11 px-6 shadow-lg shadow-blue-500/20">
                            <Plus className="w-4 h-4" /> Nouvelle Demande de Label
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
          { label: "Installateurs Actifs", val: "24", trend: "+3", icon: Users, color: "text-blue-600" },
          { label: "Labels Obtenus", val: "5", trend: "+1", icon: Award, color: "text-amber-600" },
          { label: "Chantiers Audités", val: "89", trend: "100%", icon: ShieldCheck, color: "text-emerald-600" }].
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
                            <TrendingUp className="w-5 h-5 text-blue-500" /> Pilotage & Ressources
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
              { name: "Gestion des Équipes", desc: "Affectations & Formations", icon: Users, color: "bg-blue-500" },
              { name: "Portefeuille Labels", desc: "Suivi & Renouvellements", icon: Award, color: "bg-amber-500" },
              { name: "Documents Entreprise", desc: "Rapports techniques GED", icon: FileText, color: "bg-slate-500" },
              { name: "Analytique Performance", desc: "Uptime & Conformité", icon: BarChart3, color: "bg-emerald-500" }].
              map((t, i) =>
              <div key={i} className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6", t.color)}>
                                        <t.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-800">{t.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{t.desc}</p>
                                    <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-slate-200 group-hover:text-blue-500 transition-colors" />
                                </div>
              )}
                        </div>

                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Labels en cours d'audit</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {[
                  { name: "Label Qualif'Sénégal", date: "Phase 2/3", status: "En attente", type: "Expertise" },
                  { name: "Labellisation PhotoV", date: "Initialisation", status: "En cours", type: "Dossier" }].
                  map((p, i) =>
                  <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
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
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Marketplace PRO
                        </h2>
                        <Card className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-md font-bold mb-4">Besoin de formation ?</h3>
                                <div className="space-y-4">
                                    {[
                  { title: "Sécurité Chantier", slots: "4 places", date: "12 Mars" },
                  { title: "Norme NS Photovoltaïque", slots: "COMPLET", date: "15 Mars" }].
                  map((f, i) =>
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="text-xs font-bold text-slate-800">{f.title}</div>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-[10px] text-slate-400 font-bold">{f.date}</span>
                                                <span className={cn("text-[10px] font-bold", f.slots === 'COMPLET' ? 'text-red-500' : 'text-blue-500')}>{f.slots}</span>
                                            </div>
                                        </div>
                  )}
                                </div>
                                <Button variant="outline" className="w-full mt-6 rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50">
                                    Voir tout le planning
                                </Button>
                            </div>
                        </Card>

                        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative group">
                            <Award className="absolute top-4 right-4 text-white/10 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold mb-2">Visibilité Annuaire</h3>
                            <p className="text-xs text-white/60 leading-relaxed mb-4">Le niveau de complétion de votre profil influence votre classement dans la recherche client.</p>
                            <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                                <div className="bg-blue-400 h-full rounded-full w-[75%]"></div>
                            </div>
                            <div className="text-[10px] text-white/50 text-right font-bold">75% Complété</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>);

}