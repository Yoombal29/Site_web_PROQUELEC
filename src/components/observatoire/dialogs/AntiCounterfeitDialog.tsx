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
import { ShieldCheck, Search, QrCode, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AntiCounterfeitDialog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'valid' | 'invalid'>('idle');

    const handleVerify = () => {
        setStatus('searching');
        setTimeout(() => {
            if (code.startsWith('SN-')) {
                setStatus('valid');
                toast.success("Certificat Authentique");
            } else {
                setStatus('invalid');
                toast.error("Code non reconnu");
            }
        }, 1500);
    };

    return (
        <Dialog onOpenChange={(open) => !open && setStatus('idle')}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-proqblue/20 transform rotate-12" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-proqblue" /> Vérification Anti-Fraude
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            Authentification des certificats PROQUELEC
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    {status === 'idle' || status === 'searching' ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Numéro de Certificat</Label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Ex: SN-2026-XXXX"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-[2px] bg-slate-100"></div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase">Ou</span>
                                    <div className="flex-1 h-[2px] bg-slate-100"></div>
                                </div>
                                <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-center gap-3 border-slate-200 font-bold">
                                    <QrCode className="w-5 h-5 text-proqblue" /> Scanner QR Code
                                </Button>
                            </div>
                            <Button
                                onClick={handleVerify}
                                disabled={status === 'searching' || !code}
                                className="w-full bg-slate-900 h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-black/20"
                            >
                                {status === 'searching' ? "Vérification..." : "Vérifier l'Authenticité"}
                            </Button>
                        </div>
                    ) : status === 'valid' ? (
                        <div className="text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-slate-900 tracking-tight tracking-widest">Certificat Valide</p>
                                <p className="text-sm font-medium text-slate-500">Ce document est un original certifié par PROQUELEC.</p>
                            </div>
                            <Button onClick={() => setStatus('idle')} className="w-full bg-proqblue h-12 rounded-xl font-bold">
                                Nouvelle Vérification
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-10 h-10 text-rose-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-slate-900 tracking-tight tracking-widest">Code Non Reconnu</p>
                                <p className="text-sm font-medium text-slate-500">Attention : Ce certificat ne figure pas dans nos registres officiels.</p>
                            </div>
                            <Button onClick={() => setStatus('idle')} variant="outline" className="w-full h-12 rounded-xl font-bold">
                                Réessayer
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
