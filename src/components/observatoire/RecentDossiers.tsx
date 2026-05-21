import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Clock3, AlertTriangle } from 'lucide-react';

interface Dossier {
    id: string;
    region: string;
    status: string;
    submission_date?: string;
    reference?: string;
}

export const RecentDossiers: React.FC = () => {
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDossiers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('/api/observatoire/dossiers', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : ''
                    }
                });

                if (!response.ok) {
                    throw new Error('Impossible de récupérer les dossiers récents');
                }

                const data = await response.json();
                setDossiers(Array.isArray(data) ? data.slice(0, 6) : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        };

        fetchDossiers();
    }, []);

    return (
        <Card className="p-6 border-slate-200 shadow-xl rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Dossiers récents</h3>
                    <p className="text-xs text-slate-500">Suivi COSSUEL de la conformité électrique</p>
                </div>
                <Badge className="bg-proqblue/10 text-proqblue border-0 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                    Live
                </Badge>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin h-6 w-6 text-proqblue" />
                </div>
            ) : error ? (
                <div className="text-sm text-destructive space-y-3">
                    <div className="flex items-center gap-2 text-destructive font-bold">
                        <AlertTriangle className="h-4 w-4" /> Erreur de chargement
                    </div>
                    <p>{error}</p>
                </div>
            ) : dossiers.length === 0 ? (
                <div className="text-sm text-slate-500 py-10 text-center">Aucun dossier récent disponible pour le moment.</div>
            ) : (
                <div className="space-y-3">
                    {dossiers.map((dossier) => (
                        <div key={dossier.id} className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{dossier.reference || `Dossier ${dossier.id}`}</p>
                                    <p className="text-xs text-slate-500 mt-1">Région: {dossier.region || 'Inconnue'}</p>
                                </div>
                                <Badge className="uppercase text-[10px] font-black tracking-[0.2em] px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                    {dossier.status || 'Inconnu'}
                                </Badge>
                            </div>
                            {dossier.submission_date ? (
                                <p className="mt-3 text-[10px] text-slate-500 flex items-center gap-2">
                                    <Clock3 className="h-3.5 w-3.5" /> {new Date(dossier.submission_date).toLocaleDateString('fr-FR')} à {new Date(dossier.submission_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 text-right">
                <Button variant="outline" className="h-11 px-4 text-xs font-black rounded-3xl">
                    <FileText className="w-4 h-4 mr-2" /> Voir tous
                </Button>
            </div>
        </Card>
    );
};
