import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Calendar, MapPin, User, CheckCircle, XCircle, AlertTriangle, Printer, FileText, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/hooks/useSession';

export default function InspectionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useSession();

    const { data: inspection, isLoading, error } = useQuery({
        queryKey: ['inspection', id],
        queryFn: async () => {
            const res = await fetch(`/api/inspections/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch inspection');
            return res.json();
        },
        enabled: !!id
    });

    if (isLoading) return <div className="p-10 text-center animate-pulse text-proqblue">Chargement du rapport...</div>;
    if (error || !inspection) return <div className="p-10 text-center text-red-500">Rapport introuvable</div>;

    const getStatusColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (score >= 70) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-red-500 bg-red-50 border-red-200';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans print:bg-white print:p-0">
            {/* Header Actions (No Print) */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" /> Imprimer Rapport
                        </Button>
                        <Button className="bg-proqblue text-white">
                            <Share2 className="w-4 h-4 mr-2" /> Partager
                        </Button>
                    </div>
                </div>
            </div>

            {/* Printable Content */}
            <div className="container mx-auto px-6 py-8 max-w-4xl print:p-8 print:w-full print:max-w-none">

                {/* Header Report */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6 print:shadow-none print:border-none">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-8 h-8 text-proqblue" />
                                <h1 className="text-3xl font-black text-slate-900 uppercase">Rapport Diagnostic & Audit</h1>
                            </div>
                            <p className="text-slate-500 font-medium">Référence #AUDIT-{id?.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className={`flex flex-col items-end px-6 py-3 rounded-lg border ${getStatusColor(inspection.overall_score)}`}>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Santé Électrique</span>
                            <span className="text-4xl font-black">{inspection.overall_score}/100</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-6">
                        <div>
                            <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Date Diagnostic</span>
                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {format(new Date(inspection.created_at), 'dd MMMM yyyy, HH:mm')}
                            </div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Auditeur Responsable</span>
                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                <User className="w-4 h-4 text-slate-400" />
                                {inspection.inspector_name || 'Non spécifié'}
                            </div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Localisation</span>
                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {inspection.location_gps ? 'Coordonnées GPS enregistrées' : 'Non localisé'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* IA Expertise Report */}
                {inspection.ai_report && (
                    <div className="bg-gradient-to-br from-proqblue/5 to-purple-50 rounded-xl shadow-sm border border-proqblue/10 p-8 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText className="w-24 h-24 text-proqblue rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-proqblue text-white rounded-lg">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Expertise IA : Synthèse & Recommandations</h2>
                                    <p className="text-xs text-proqblue/60 font-bold uppercase tracking-widest">Analyse NS 01-001 Intelligente</p>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                                {inspection.ai_report}
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-proqblue/10 pt-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                Certifié par PROQUELEC Cortex AI le {inspection.ai_report_generated_at ? format(new Date(inspection.ai_report_generated_at), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border">
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-bold text-slate-700 uppercase tracking-wide text-sm">Points de Contrôle</h2>
                        <Badge variant="outline" className="bg-white">Total: {inspection.results?.length || 0}</Badge>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {inspection.results?.map((item: any) => (
                            <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors break-inside-avoid">
                                <div className="mt-1">
                                    {item.is_compliant ? (
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-800 text-sm">{item.checkpoint_category} - {item.checkpoint_label || item.item_text || `Point #${item.id.slice(0, 4)}`}</h3>
                                        {!item.is_compliant && (
                                            <Badge variant="destructive" className="uppercase text-[10px]">Non Conforme</Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-sm mt-1">{item.checkpoint_description}</p>

                                    {item.inspector_comment && (
                                        <div className="mt-3 bg-amber-50 border border-amber-100 p-3 rounded-lg text-sm text-amber-800 flex gap-2 items-start">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-bold text-xs uppercase block mb-1">Observation Inspecteur:</span>
                                                {item.inspector_comment}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(!inspection.results || inspection.results.length === 0) && (
                            <div className="p-10 text-center text-slate-400 italic">
                                Aucun point de contrôle enregistré.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer for Print */}
                <div className="mt-8 text-center text-xs text-slate-400 hidden print:block">
                    Rapport généré automatiquement par PROQUELEC ELECTRO-GED 4.0 le {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </div>
            </div>
        </div>
    );
}
