import React from 'react';
import { useEnergyData } from '@/hooks/useEnergyData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Globe, Sun, ShieldCheck, Loader2 } from 'lucide-react';

const NationalIndicators: React.FC = () => {
    const { data, loading, error } = useEnergyData();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-proqblue" />
                <span className="ml-3 text-muted-foreground font-medium text-xs font-black uppercase tracking-widest">Calcul des indicateurs...</span>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    return (
        <div className="relative mb-16 animate-reveal">
            {/* Elite Badge Signature */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full border border-proqblue/30 flex items-center gap-3 shadow-[0_15px_35px_rgba(30,58,138,0.15)] animate-float">
                    <div className="w-2 h-2 rounded-full bg-proqblue animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-proqblue">Flux de Données Certifié • SN</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                {/* Access Rate */}
                <Card className="border-0 shadow-premium bg-white rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                    <CardContent className="pt-10 px-8 pb-10 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-proqblue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-blue-50 rounded-2xl shadow-inner">
                                <Globe className="h-7 w-7 text-proqblue" />
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-blue-100 bg-blue-50/30 px-3 py-1 rounded-lg">{data.accessRate.source}</Badge>
                        </div>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{data.accessRate.total}%</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Taux d'Accès national</p>
                    </CardContent>
                </Card>

                {/* Solar Simulation */}
                <Card className="border-0 shadow-premium bg-white rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                    <CardContent className="pt-10 px-8 pb-10 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-amber-50 rounded-2xl shadow-inner">
                                <Sun className="h-7 w-7 text-amber-500 animate-pulse" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest border border-amber-500/20 px-3 py-1 rounded-lg">Irradiance Solaire</span>
                        </div>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{data.solarSimulation.irradiance}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">kWh/m²/jour ({data.solarSimulation.location})</p>
                    </CardContent>
                </Card>

                {/* Last Tariff */}
                <Card className="border-0 shadow-premium bg-white rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                    <CardContent className="pt-10 px-8 pb-10 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-teal-50 rounded-2xl shadow-inner">
                                <Zap className="h-7 w-7 text-teal-600" />
                            </div>
                            <Badge className="bg-teal-600 text-white hover:bg-teal-600 border-0 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">Tarif Officiel</Badge>
                        </div>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{data.tariffs[0].priceXOF}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Tarif BT (XOF/kWh)</p>
                    </CardContent>
                </Card>

                {/* Trust Score */}
                <Card className="border-0 shadow-premium bg-white rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                    <CardContent className="pt-10 px-8 pb-10 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-indigo-50 rounded-2xl shadow-inner">
                                <ShieldCheck className="h-7 w-7 text-indigo-500" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Score Fiabilité</span>
                                <span className="text-[8px] font-bold text-muted-foreground/40 mt-0.5">V1.0 - PROQUELEC</span>
                            </div>
                        </div>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{data.reliabilityScore}%</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Indice de Qualité Réseau</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NationalIndicators;
