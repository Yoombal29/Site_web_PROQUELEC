import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { GEDAnalyticsDashboard } from '@/components/office/analytics/GEDAnalyticsDashboard';
import {
    BarChart3,
    FileText,
    Users,
    Database,
    TrendingUp,
    Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Analytics & BI</h1>
                            <p className="text-gray-600">Tableaux de bord et statistiques en temps réel</p>
                        </div>
                    </div>
                </div>

                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black px-4 py-2">
                    <Crown className="h-4 w-4 mr-2" />
                    PROQUELEC OFFICE
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="overview" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Vue d'Ensemble</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Utilisateurs</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-2">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Analytics Avancés</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <GEDAnalyticsDashboard />
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Analytics Documents</h3>
                        <p className="text-gray-600">Statistiques détaillées sur les documents (à venir)</p>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Analytics Utilisateurs</h3>
                        <p className="text-gray-600">Statistiques d'activité utilisateurs (à venir)</p>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Analytics Avancés (Metabase)
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Accédez à Metabase pour des analyses SQL avancées et des rapports personnalisés.
                        </p>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Intégration Metabase</p>
                                <p className="text-sm text-gray-400">http://localhost:3101</p>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
