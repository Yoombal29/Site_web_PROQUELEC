import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMediaManager } from '@/hooks/useMediaManager';
import { toast } from 'sonner';
import {
    ShieldCheck, Camera, MapPin, CheckCircle,
    AlertTriangle, ChevronRight, ChevronLeft, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Types
interface InspectionData {
    projectId: string;
    checklistId: string;
    location: { lat?: number; lng?: number; address?: string };
    items: { itemId: string; value: any; isCompliant: boolean; comment?: string }[];
    evidence_url?: string;
}

interface InspectionWizardProps {
    projectId: string;
    onClose: () => void;
    forceType?: 'Résidentiel' | 'Tertiaire' | 'Industriel' | 'Audit Énergétique';
}

export function InspectionWizard({ projectId, onClose, forceType }: InspectionWizardProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<InspectionData>({
        projectId,
        checklistId: forceType ? 'suggested' : 'default',
        location: {},
        items: []
    });
    const [suggestedTemplate, setSuggestedTemplate] = useState<any>(null);
    const [liveScore, setLiveScore] = useState(0);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;
    const queryClient = useQueryClient();

    // 🧙‍♂️ INTELLIGENCE: Récupérer la checklist suggérée
    const { data: suggestion, isLoading: loadingSuggestion } = useQuery({
        queryKey: ['suggest-checklist', projectId],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/inspections/suggest-checklist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    installationType: forceType
                })
            });
            if (!res.ok) throw new Error('Suggestion failed');
            return res.json();
        }
    });

    // Mettre à jour le template suggéré
    useEffect(() => {
        if (suggestion) {
            setSuggestedTemplate((suggestion as any).template);
            toast.success(`💡 ${(suggestion as any).message}`);
        }
    }, [suggestion]);

    const { data: checklists } = useQuery({
        queryKey: ['checklists'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/checklists', { headers: { Authorization: `Bearer ${token}` } });
            return res.json();
        }
    });

    const getChecklistId = (category: string) => {
        return checklists?.find((c: any) => c.category === category || c.title.toLowerCase().includes(category))?.id;
    };

    const { data: checklistItems, isLoading: itemsLoading } = useQuery({
        queryKey: ['checklistItems', data.checklistId],
        queryFn: async () => {
            if (!data.checklistId || data.checklistId === 'default' || data.checklistId === 'suggested') return [];
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/checklists/${data.checklistId}/items`, { headers: { Authorization: `Bearer ${token}` } });
            return res.json();
        },
        enabled: !!data.checklistId && data.checklistId !== 'default' && data.checklistId !== 'suggested'
    });

    // Transformer suggestedTemplate en items pour l'étape 2
    const displayItems = useMemo(() => {
        if (data.checklistId === 'suggested' && suggestedTemplate) {
            const items: any[] = [];
            suggestedTemplate.categories?.forEach((cat: any) => {
                cat.checks?.forEach((check: any) => {
                    items.push({
                        id: check.label,
                        question: check.label,
                        description: cat.name,
                        criticality_weight: check.critical ? 10 : 5,
                        category: cat.name
                    });
                });
            });
            return items;
        }
        return checklistItems || [];
    }, [data.checklistId, suggestedTemplate, checklistItems]);

    // Calcul du score en temps réel
    useEffect(() => {
        if (data.items.length === 0) {
            setLiveScore(0);
            return;
        }

        let totalScore = 0;
        let totalWeight = 0;

        if (data.checklistId === 'suggested' && suggestedTemplate) {
            suggestedTemplate.categories?.forEach((cat: any) => {
                const catChecks = cat.checks || [];
                const catResponses = data.items.filter((item: any) =>
                    catChecks.some((check: any) => check.label === item.itemId)
                );

                if (catResponses.length > 0) {
                    const compliants = catResponses.filter(r => r.isCompliant).length;
                    const catScore = (compliants / catChecks.length) * 100;
                    totalScore += catScore * (cat.weight / 100);
                    totalWeight += cat.weight;
                }
            });
            const finalScore = totalWeight > 0 ? Math.round(totalScore) : 0;
            setLiveScore(finalScore);
        } else {
            const compliantCount = data.items.filter(i => i.isCompliant).length;
            const totalAvailable = displayItems?.length || data.items.length;
            const finalScore = Math.round((compliantCount / totalAvailable) * 100);
            setLiveScore(finalScore);
        }
    }, [data.items, suggestedTemplate, data.checklistId, displayItems]);

    const handleItemResponse = (itemId: string, isCompliant: boolean) => {
        setData(prev => {
            const existing = prev.items.find(i => i.itemId === itemId);
            const newItem = { itemId, value: isCompliant, isCompliant };
            let newItems = [...prev.items];
            if (existing) {
                newItems = newItems.map(i => i.itemId === itemId ? newItem : i);
            } else {
                newItems.push(newItem);
            }
            return { ...prev, items: newItems };
        });
    };

    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingPhoto(true);
            try {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('projectId', projectId);

                const token = localStorage.getItem('token');
                const res = await fetch('/api/storage/upload', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!res.ok) throw new Error('Upload failed');
                const result = await res.json();

                setData(prev => ({
                    ...prev,
                    evidence_url: result.file_path
                }));
                toast.success("Preuve visuelle ajoutée !");
            } catch (err) {
                toast.error("Erreur d'upload photo");
                console.error(err);
            } finally {
                setUploadingPhoto(false);
            }
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
                                <MapPin className="w-8 h-8 text-proqblue" />
                            </div>
                            <h3 className="text-xl font-bold">
                                {forceType === 'Audit Énergétique' ? 'Expertise : Efficacité Énergétique' : 'Diagnostic Technique & Normatif'}
                            </h3>
                            <p className="text-slate-500">
                                {forceType === 'Audit Énergétique' ? 'Optimisation des consommations et bilan de santé énergétique' : 'Vérification de la conformité aux normes NS 01-001'}
                            </p>
                        </div>

                        {loadingSuggestion ? (
                            <div className="text-center p-8 bg-slate-50 rounded-lg animate-pulse">
                                <ShieldCheck className="w-10 h-10 text-proqblue mx-auto mb-2 animate-spin" />
                                <p className="font-medium text-slate-600">Magie de Cortex en cours...</p>
                                <p className="text-xs text-slate-400">Analyse intelligente du projet...</p>
                            </div>
                        ) : suggestedTemplate ? (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-6">
                                    <div className="flex items-start gap-3 mb-3">
                                        <ShieldCheck className="w-6 h-6 text-emerald-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">Expertise Recommandée : {suggestedTemplate.title}</h4>
                                            <p className="text-sm text-slate-600 mt-1">{suggestedTemplate.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        onClick={() => { setData(prev => ({ ...prev, checklistId: 'suggested' })); setStep(2); }}
                                    >
                                        🚀 Lancer l'Expertise {forceType === 'Audit Énergétique' ? 'Énergie' : 'Terrain'}
                                    </Button>
                                </div>
                                <div className="text-center text-xs text-slate-400 uppercase font-bold tracking-widest">Ou choisir un audit manuel</div>
                                <div className="grid gap-3">
                                    <Button variant="outline" className="justify-start py-6" onClick={() => { setData(prev => ({ ...prev, checklistId: getChecklistId('residentiel') })); setStep(2); }}>
                                        <CheckCircle className="mr-3 text-emerald-500" /> Audit Résidentiel (NS 01-001)
                                    </Button>
                                    <Button variant="outline" className="justify-start py-6" onClick={() => { setData(prev => ({ ...prev, checklistId: getChecklistId('erp') })); setStep(2); }}>
                                        <ShieldCheck className="mr-3 text-amber-500" /> Audit ERP / Public
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            case 2:
                if (itemsLoading) return <div className="p-8 text-center animate-pulse text-proqblue">Chargement du protocole technique...</div>;
                return (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                            <CheckCircle className="w-5 h-5 text-proqblue" /> Points d'Examen ({displayItems?.length || 0})
                        </h3>
                        {displayItems?.map((item: any) => {
                            const response = data.items.find(i => i.itemId === item.id);
                            const isYes = response?.isCompliant === true;
                            const isNo = response?.isCompliant === false;
                            return (
                                <Card key={item.id} className={`border-l-4 transition-colors ${isYes ? 'border-l-emerald-500 bg-emerald-50/50' : isNo ? 'border-l-red-500 bg-red-50/50' : 'border-l-slate-200'}`}>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-slate-800 text-sm tracking-tight">{item.question}</div>
                                            {item.criticality_weight >= 8 && <Badge variant="destructive" className="ml-2 animate-pulse">CRITIQUE</Badge>}
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" className={`flex-1 ${isYes ? 'bg-emerald-600 text-white' : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`} onClick={() => handleItemResponse(item.id, true)}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Conforme
                                            </Button>
                                            <Button size="sm" className={`flex-1 ${isNo ? 'bg-red-600 text-white' : 'bg-white border-red-200 text-red-600 hover:bg-red-50'}`} onClick={() => handleItemResponse(item.id, false)}>
                                                <AlertTriangle className="w-4 h-4 mr-2" /> Anomalie
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 text-center animate-in slide-in-from-right-4">
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl relative group hover:border-proqblue transition-colors">
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handlePhotoUpload} aria-label="Téléverser une photo de preuve" />
                            {uploadingPhoto ? (
                                <div className="text-proqblue font-bold animate-pulse">Traitement de l'image...</div>
                            ) : data.evidence_url ? (
                                <div className="flex flex-col items-center text-emerald-600">
                                    <CheckCircle className="w-12 h-12 mb-2" />
                                    <span className="font-bold text-sm">Preuve enregistrée</span>
                                    <span className="text-[10px] text-slate-400 mt-1">{data.evidence_url.split('/').pop()}</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 group-hover:text-proqblue">
                                    <Camera className="w-12 h-12 mx-auto mb-2" />
                                    <p className="font-medium">Importer une photo du défaut ou de l'installation</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                const verdictColor = liveScore >= 90 ? 'text-emerald-600' : liveScore >= 70 ? 'text-amber-600' : 'text-red-600';
                const verdictBg = liveScore >= 90 ? 'bg-emerald-500' : liveScore >= 70 ? 'bg-amber-500' : 'bg-red-500';
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 text-center">
                        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${liveScore >= 90 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            <span className={`text-4xl font-black ${verdictColor}`}>{liveScore}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Synthèse d'Expertise</h3>
                        <p className="text-slate-500 -mt-4 text-sm font-medium">Diagnostic prêt pour génération du rapport final</p>
                        <div className="bg-slate-50 p-6 rounded-xl space-y-3 text-left">
                            <div className="flex justify-between items-center text-sm font-bold border-b pb-2">
                                <span className="text-slate-500 uppercase tracking-widest text-[10px]">Indice de Santé</span>
                                <Badge className={`${verdictBg} text-white`}>{liveScore >= 90 ? 'Excellent' : liveScore >= 70 ? 'Moyen' : 'Critique'}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Points vérifiés :</span>
                                <span className="font-bold">{data.items.length}</span>
                            </div>
                        </div>
                        {liveScore < 80 && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3 text-left">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                <div className="text-xs text-red-700">
                                    <p className="font-bold">Alerte Sécurité</p>
                                    <p>Des anomalies critiques ont été détectées. Des mesures correctives immédiates sont nécessaires.</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    const updateInspectionMutation = useMutation({
        mutationFn: async (payload: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Save failed');
            return res.json();
        },
        onSuccess: (data) => {
            toast.success("Audit sauvegardé. Analyse Cortex en cours...");
            generateReportMutation.mutate(data.id);
        },
        onError: (err) => {
            toast.error("Erreur de sauvegarde: " + err.message);
        }
    });

    const navigate = useNavigate();
    const generateReportMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/inspections/${id}/generate-report`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Report generation failed');
            const reportData = await res.json();
            return { ...reportData, id };
        },
        onSuccess: (data) => {
            toast.success("✨ Rapport d'expertise finalisé !");
            queryClient.invalidateQueries({ queryKey: ['project-inspections'] });
            // Fermer explicitement avant de naviguer
            onClose();
            navigate(`/diagnostics/${data.id}`);
        },
        onError: (err) => {
            toast.error("Analyse Cortex échouée: " + err.message);
            // On ferme quand même pour éviter d'être bloqué
            onClose();
        }
    });

    const handleSubmit = () => {
        const payload = {
            project_id: projectId,
            checklist_id: data.checklistId === 'suggested' ? null : data.checklistId,
            checklist: data.checklistId === 'suggested' ? { title: suggestedTemplate.title, items: data.items.map(i => ({ id: i.itemId, is_compliant: i.isCompliant })), weight: 1.0, type: 'IA_AUDIT' } : null,
            results: data.items.map(item => ({
                item_id: item.itemId,
                value: { answer: item.value },
                is_compliant: item.isCompliant
            }))
        };
        updateInspectionMutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl shadow-2xl border-0 overflow-hidden bg-white flex flex-col h-[90vh]">
                <div className="bg-slate-900 text-white p-6 relative flex-shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-proqblue shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    <div className="flex justify-between items-center mb-1">
                        <Badge className="bg-proqblue text-white hover:bg-proqblue border-0 text-[10px] font-black uppercase tracking-widest">Étape {step}/4</Badge>
                        <ShieldCheck className="w-5 h-5 text-proqblue" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Console Diagnostic</CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Audit interne PROQUELEC • Projet #{projectId.slice(0, 8)}</CardDescription>
                </div>

                <Progress value={progress} className="h-1 bg-slate-100 rounded-none transform-gpu transition-all duration-700 ease-in-out" />

                <CardContent className="p-8 overflow-y-auto flex-1">
                    {renderStep()}
                </CardContent>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
                    <Button variant="ghost" className="text-slate-400 font-bold uppercase text-xs" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
                        {step === 1 ? 'Annuler' : 'Retour'}
                    </Button>

                    <div className="flex gap-2">
                        {step < 4 ? (
                            <Button className="bg-slate-900 hover:bg-black text-white px-8 font-black uppercase text-xs tracking-widest group" onClick={() => setStep(step + 1)}>
                                Suivant <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20" onClick={handleSubmit} disabled={updateInspectionMutation.isPending}>
                                {updateInspectionMutation.isPending ? 'Expertise en cours...' : 'Finaliser & Générer'}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
