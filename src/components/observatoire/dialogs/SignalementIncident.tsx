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
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Camera, MapPin, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    children: React.ReactNode;
    regionName?: string;
}

export const SignalementIncident: React.FC<Props> = ({ children, regionName }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        toast.success("Signalement envoyé aux services régionaux.");
    };

    return (
        <Dialog onOpenChange={(open) => !open && setIsSubmitted(false)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
                <div className="bg-rose-500 p-8 text-white relative overflow-hidden">
                    <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 transform rotate-12" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6" /> Signalement Instantané
                        </DialogTitle>
                        <DialogDescription className="text-rose-100 font-medium">
                            Alerte Incident Réseau • {regionName || "Sénégal"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Localisation Précise</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            placeholder="Ex: Quartier, Rue, Poteau n°..." 
                                            className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type d'Incident</Label>
                                    <Input 
                                        placeholder="Ex: Fil à terre, Poteau penché..." 
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Photos</Label>
                                    <div className="relative">
                                        <Textarea 
                                            placeholder="Détails supplémentaires..." 
                                            className="min-h-[100px] rounded-xl bg-slate-50 border-slate-100 font-bold p-4"
                                        />
                                        <Button type="button" variant="ghost" className="absolute right-2 bottom-2 h-10 w-10 p-0 rounded-lg hover:bg-slate-200">
                                            <Camera className="w-5 h-5 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 group">
                                Envoyer l'Alerte <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-rose-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-slate-900 tracking-tight tracking-widest">Alerte Transmise</p>
                                <p className="text-sm font-medium text-slate-500">Un inspecteur de la zone {regionName || ""} a été notifié.</p>
                            </div>
                            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200">
                                Nouveau Signalement
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
