
import React, { useState, useEffect } from 'react';
import { Brain, Eye, Image as ImageIcon, Play, Square, Loader2, Cpu, HelpCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

interface AIService {
    service: string;
    key: string;
    status: 'online' | 'offline' | 'starting';
    url: string;
}

const AdminAIControlPanel = () => {
    const [services, setServices] = useState<AIService[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [globalLoading, setGlobalLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const response = await axios.get('/api/ai/status');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching AI status:', error);
        } finally {
            setGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStart = async (service: string) => {
        setLoading(prev => ({ ...prev, [service]: true }));
        try {
            await axios.post('/api/admin/ai/start', { service }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(`Démarrage de ${service} initié...`);
            // Update status immediately as starting
            setServices(prev => prev.map(s => s.key === service ? { ...s, status: 'starting' } : s));
        } catch (error: any) {
            toast.error(`Erreur: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [service]: false }));
        }
    };

    const handleStop = async (service: string) => {
        setLoading(prev => ({ ...prev, [service]: true }));
        try {
            await axios.post('/api/admin/ai/stop', { service }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(`Service ${service} arrêté.`);
            fetchStatus();
        } catch (error: any) {
            toast.error(`Erreur: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [service]: false }));
        }
    };

    const getIcon = (key: string) => {
        switch (key) {
            case 'brain': return <Brain className="w-8 h-8" />;
            case 'vision': return <Eye className="w-8 h-8" />;
            case 'image': return <ImageIcon className="w-8 h-8" />;
            default: return <Cpu className="w-8 h-8" />;
        }
    };

    const getColor = (key: string) => {
        switch (key) {
            case 'brain': return 'text-blue-500 bg-blue-50 border-blue-200';
            case 'vision': return 'text-purple-500 bg-purple-50 border-purple-200';
            case 'image': return 'text-pink-500 bg-pink-50 border-pink-200';
            default: return 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in p-4 md:p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <Cpu className="w-10 h-10 text-proqblue" />
                        Cortex Central AI
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        Contrôle en temps réel des serveurs d'intelligence artificielle optimisés pour Intel Arc.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600 border border-slate-200">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    Système de Monitoring Actif
                </div>
            </div>

            {globalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-proqblue animate-spin" />
                    <p className="text-slate-400 animate-pulse">Initialisation du tableau de bord AI...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((s) => (
                        <Card key={s.key} className={`overflow-hidden transition-all duration-300 border-2 ${s.status === 'online' ? 'border-green-100 shadow-md shadow-green-50' : 'border-slate-100'}`}>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className={`p-4 rounded-2xl border ${getColor(s.key)} shadow-sm`}>
                                        {getIcon(s.key)}
                                    </div>
                                    <Badge
                                        variant={s.status === 'online' ? 'default' : s.status === 'starting' ? 'secondary' : 'outline'}
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${s.status === 'online' ? 'bg-green-500' :
                                                s.status === 'starting' ? 'bg-amber-500 text-white animate-pulse' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        {s.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold mt-6">{s.service}</CardTitle>
                                <CardDescription className="font-mono text-xs opacity-60">
                                    Endpoint: {s.url}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
                                        <span className={s.status === 'online' ? 'text-green-600 font-medium' : 'text-slate-500'}>
                                            {s.status === 'online' ? 'Moteur opérationnel' : s.status === 'starting' ? 'Démarrage en cours (XPU init)...' : 'Moteur à l\'arrêt'}
                                        </span>
                                    </div>

                                    {s.key === 'brain' && (
                                        <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            "Utilise la norme NS 01-001 via le framework Haystack & LoRA Adapter."
                                        </p>
                                    )}
                                    {s.key === 'vision' && (
                                        <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            "Analyse visuelle VLM pour détection d'anomalies sur photos de chantier."
                                        </p>
                                    )}
                                    {s.key === 'image' && (
                                        <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            "Génération de schémas techniques et visuels projectifs via SDXL Turbo."
                                        </p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 gap-3">
                                {s.status === 'offline' ? (
                                    <Button
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold transition-all transform hover:scale-[1.02]"
                                        disabled={loading[s.key]}
                                        onClick={() => handleStart(s.key)}
                                    >
                                        {loading[s.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                        Démarrer le moteur
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        className="w-full gap-2 font-bold transition-all transform hover:scale-[1.02]"
                                        disabled={loading[s.key]}
                                        onClick={() => handleStop(s.key)}
                                    >
                                        {loading[s.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
                                        Arrêter le moteur
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-amber-100">
                    <HelpCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900 mb-1 leading-none pt-1 uppercase tracking-tight">Optimisation Materielle (XPU Info)</h4>
                    <p className="text-amber-800/80 text-sm mt-2 leading-relaxed">
                        Les serveurs sont configurés pour exploiter pleinement l'accélération matérielle des <span className="font-bold">GPUs Intel Arc</span>.
                        Le démarrage de l'IA experte (Brain) peut prendre 10 à 20 secondes le temps de charger les poids LoRA et d'initialiser le cache VRAM de 0.75x.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAIControlPanel;
