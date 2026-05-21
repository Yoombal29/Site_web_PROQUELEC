import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Calculator, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    children: React.ReactNode;
    regionName?: string;
}

export const SimulateurRaccordement: React.FC<Props> = ({ children, regionName }) => {
    const [step, setStep] = useState(1);
    const [power, setPower] = useState('3');
    const [distance, setDistance] = useState('10');

    const calculateCost = () => {
        const base = 55000;
        const perKw = 12000;
        const perMeter = 2500;
        return base + (parseInt(power) * perKw) + (parseInt(distance) * perMeter);
    };

    const handleSimulate = () => {
        setStep(2);
        toast.success("Simulation terminée.");
    };

    return (
        <Dialog onOpenChange={(open) => !open && setStep(1)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
                <div className="bg-proqblue p-8 text-white relative overflow-hidden">
                    <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 transform rotate-12" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Calculator className="w-6 h-6" /> Simulateur
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 font-medium">
                            Estimation rapide du coût de raccordement • {regionName || "Sénégal"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Puissance Souscrite (kW)</Label>
                                    <Input
                                        type="number"
                                        value={power}
                                        onChange={(e) => setPower(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distance au Réseau (mètres)</Label>
                                    <Input
                                        type="number"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSimulate} className="w-full bg-proqblue h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 group">
                                Calculer l'Estimation <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 uppercase font-black tracking-widest text-[10px] px-4 py-1.5 rounded-full">Estimation Générée</Badge>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter">{calculateCost().toLocaleString()} XOF</p>
                                <p className="text-sm font-medium text-slate-500">Montant estimé HT (Hors frais administratifs)</p>
                            </div>
                            <div className="pt-6 border-t border-slate-100 flex items-start gap-3 text-left bg-blue-50/50 p-4 rounded-2xl">
                                <Info className="w-5 h-5 text-proqblue shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                                    Cette valeur est indicative et basée sur les tarifs officiels BT 2026. Un audit technique sur site est nécessaire pour un devis final.
                                </p>
                            </div>
                            <Button onClick={() => setStep(1)} variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200">
                                Nouvelle Simulation
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
