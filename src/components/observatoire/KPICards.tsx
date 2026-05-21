import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const KPICards = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['observatory-global-stats'],
        queryFn: async () => {
            const res = await fetch('/api/observatoire/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch global stats');
            return res.json();
        }
    });

    if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
    </div>;

    const complianceRate = stats?.total_dossiers > 0
        ? ((stats.total_dossiers - (stats.non_compliant_count || 0)) / stats.total_dossiers * 100).toFixed(1)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-proqblue rounded-lg">
                        <FileText className="w-6 h-6" />
                    </div>
                    {/* Trend indicator (mocked for now) */}
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" /> +12%
                    </span>
                </div>
                <div className="text-3xl font-black text-slate-800">
                    {stats?.total_dossiers || 0}
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">
                    Dossiers Totaux
                </div>
            </Card>

            <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-black text-emerald-600">
                    {complianceRate}%
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">
                    Taux de Conformité
                </div>
            </Card>

            <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center">
                        Action Requise
                    </span>
                </div>
                <div className="text-3xl font-black text-red-600">
                    {stats?.non_compliant_count || 0}
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">
                    Non-Conformités
                </div>
            </Card>

            <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-proqblue to-blue-600 text-white">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 rounded-lg text-white">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-black">
                    J+2
                </div>
                <div className="text-sm font-medium text-blue-100 mt-1">
                    Délai Moyen Inspection
                </div>
            </Card>
        </div>
    );
};

export default KPICards;
