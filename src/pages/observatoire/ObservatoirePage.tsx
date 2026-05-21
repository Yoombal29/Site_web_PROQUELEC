import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import SenegalMap from '@/components/observatoire/SenegalMap';
import NationalIndicators from '@/components/observatoire/NationalIndicators';
import { RegionalAnalytics } from '@/components/observatoire/RegionalAnalytics';
import ControlRoomStatusBar from '@/components/observatoire/ControlRoomStatusBar';
import { RecentDossiers } from '@/components/observatoire/RecentDossiers';
import { AntiCounterfeitDialog } from '@/components/observatoire/dialogs/AntiCounterfeitDialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, ShieldCheck, Lock, FileBarChart, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useSession';

export default function ObservatoirePage() {
    const { user } = useSession();
    const isMinistere = user?.role === 'ministere';
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    const handleRefresh = async () => {
        if (isMinistere) {
            toast.error("Accès restreint : Seul l'administrateur peut rafraîchir les données COSSUEL.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            toast.info("Demande de synchronisation envoyée...");
            const response = await fetch('/api/observatoire/sync/trigger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                throw new Error('La synchronisation a échoué.');
            }

            toast.success("Synchronisation COSSUEL demandée avec succès.");
        } catch (err) {
            console.error('[OBSERVATOIRE] refresh error:', err);
            toast.error("Impossible de lancer la synchronisation. Vérifiez votre connexion ou vos droits.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header Stratégique */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-proqblue text-white rounded-lg">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                Observatoire National
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Supervision de la Conformité Électrique (Connecté COSSUEL)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isMinistere ? (
                            <Button variant="outline" size="sm" onClick={handleRefresh} className="border-slate-300">
                                <RefreshCw className="w-4 h-4 mr-2 text-slate-500" />
                                Actualiser Données
                            </Button>
                        ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Vue Auditor (Lecture Seule)
                            </Badge>
                        )}
                        <Button className="bg-proqblue hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20">
                            <Download className="w-4 h-4 mr-2" />
                            Rapport {isMinistere ? 'Audience' : 'Ministère'} (PDF)
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Section Indicateurs Nationaux */}
                <section className="mb-12">
                    <NationalIndicators />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Sidebar (Map) */}
                    <div className="xl:col-span-3 space-y-8">
                        <SenegalMap onRegionSelect={setSelectedRegion} />
                        <RegionalAnalytics selectedRegion={selectedRegion} />
                    </div>

                    {/* Operational Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-8 border-slate-200 shadow-xl rounded-3xl bg-white group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-proqblue/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tight text-sm">
                                <FileBarChart className="w-5 h-5 text-proqblue" /> Rapports Flash
                            </h3>
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full justify-start text-xs font-bold h-12 rounded-xl border-slate-100 hover:bg-slate-50">
                                    <Badge className="bg-emerald-500 mr-3 h-2 w-2 p-0 rounded-full" /> Hebdomadaire (S6 2026)
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-xs font-bold h-12 rounded-xl border-slate-100 hover:bg-slate-50">
                                    <Badge className="bg-amber-500 mr-3 h-2 w-2 p-0 rounded-full" /> Audit Réseau Saint-Louis
                                </Button>
                            </div>
                        </Card>

                        <RecentDossiers />

                        <Card className="p-8 border-slate-200 shadow-xl rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                            <Zap className="h-12 w-12 text-proqblue/20 absolute -bottom-2 -right-2 transform rotate-12 group-hover:scale-125 transition-transform" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proqblue mb-2">Alerte IA</h4>
                            <p className="text-sm font-medium leading-relaxed opacity-80">
                                "Anomalie détectée dans la zone de Kolda : Taux de conformité en baisse de 4% ce mois-ci."
                            </p>
                        </Card>

                        <AntiCounterfeitDialog>
                            <Button className="w-full h-16 rounded-3xl bg-white border-2 border-slate-100 hover:border-proqblue shadow-lg shadow-slate-200/50 flex items-center justify-between px-6 group transition-all">
                                <div className="flex items-center gap-4 text-slate-800">
                                    <ShieldCheck className="w-6 h-6 text-proqblue" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services</div>
                                        <div className="font-black text-sm uppercase tracking-tight">Vérifier Certificat</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-proqblue group-hover:translate-x-1 transition-all" />
                            </Button>
                        </AntiCounterfeitDialog>
                    </div>
                </div>

                <div className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                    Souveraineté Numérique & Expertise Électrique • PROQUELEC 2026
                </div>
            </main>

            <ControlRoomStatusBar />
        </div>
    );
}
