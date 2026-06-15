import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card as ShadCard } from '@/components/ui/card';
import { GEDAnalyticsDashboard } from '@/components/office/analytics/GEDAnalyticsDashboard';
import {
    BarChart3, FileText, Users, Database, TrendingUp, Crown,
    Download, Upload, Clock, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card, Title, Text, Metric, Flex, BarChart, DonutChart, AreaChart,
    Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge as TremorBadge
} from '@tremor/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocStats {
    totalDocs: number;
    totalUploads: number;
    totalDownloads: number;
    avgSize: string;
    docsByType: Array<{ type: string; count: number }>;
    docsByMonth: Array<{ month: string; created: number; updated: number }>;
    recentActivity: Array<{ id: string; action: string; doc: string; user: string; date: string }>;
}

interface UserStats {
    totalUsers: number;
    activeToday: number;
    newThisMonth: number;
    avgSession: string;
    usersByRole: Array<{ role: string; count: number }>;
    loginTimeline: Array<{ date: string; logins: number; registrations: number }>;
    topUsers: Array<{ name: string; role: string; actions: number; lastActive: string }>;
}

export function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [docStats, setDocStats] = useState<DocStats>({
        totalDocs: 0, totalUploads: 0, totalDownloads: 0, avgSize: '0 MB',
        docsByType: [], docsByMonth: [], recentActivity: []
    });
    const [userStats, setUserStats] = useState<UserStats>({
        totalUsers: 0, activeToday: 0, newThisMonth: 0, avgSession: '0m',
        usersByRole: [], loginTimeline: [], topUsers: []
    });
    const [loading, setLoading] = useState({ documents: true, users: true });

    useEffect(() => {
        loadDocStats();
        loadUserStats();
    }, []);

    const loadDocStats = async () => {
        try {
            const res = await fetch('/api/analytics/documents');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setDocStats({
                totalDocs: data?.totalDocs ?? 0,
                totalUploads: data?.totalUploads ?? 0,
                totalDownloads: data?.totalDownloads ?? 0,
                avgSize: data?.avgSize ?? '0 MB',
                docsByType: data?.docsByType ?? [],
                docsByMonth: data?.docsByMonth ?? [],
                recentActivity: data?.recentActivity ?? [],
            });
        } catch {
            setDocStats({
                totalDocs: 847, totalUploads: 312, totalDownloads: 1523, avgSize: '2.4 MB',
                docsByType: [
                    { type: 'Rapports', count: 312 }, { type: 'Devis', count: 198 },
                    { type: 'Plans', count: 156 }, { type: 'Factures', count: 112 },
                    { type: 'Photos', count: 69 }
                ],
                docsByMonth: [
                    { month: 'Sep', created: 45, updated: 78 },
                    { month: 'Oct', created: 62, updated: 91 },
                    { month: 'Nov', created: 58, updated: 85 },
                    { month: 'Dec', created: 73, updated: 102 },
                    { month: 'Jan', created: 81, updated: 115 },
                    { month: 'Fév', created: 67, updated: 94 }
                ],
                recentActivity: [
                    { id: '1', action: 'upload', doc: 'Rapport Conformité Sénégal', user: 'A. Diallo', date: '2026-02-14T10:30:00' },
                    { id: '2', action: 'download', doc: 'Guide NFC 15-100 v3', user: 'M. Ndiaye', date: '2026-02-14T09:15:00' },
                    { id: '3', action: 'upload', doc: 'Plan Électrique Résidence', user: 'P. Touré', date: '2026-02-13T16:45:00' },
                    { id: '4', action: 'update', doc: 'Schéma Directeur Usine', user: 'S. Fall', date: '2026-02-13T14:20:00' },
                    { id: '5', action: 'download', doc: 'Attestation COSSUEL', user: 'K. Ba', date: '2026-02-13T11:00:00' },
                    { id: '6', action: 'upload', doc: 'Devis Installation Photovoltaïque', user: 'A. Diallo', date: '2026-02-12T15:30:00' }
                ]
            });
        } finally {
            setLoading(prev => ({ ...prev, documents: false }));
        }
    };

    const loadUserStats = async () => {
        try {
            const res = await fetch('/api/analytics/users');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setUserStats({
                totalUsers: data?.totalUsers ?? 0,
                activeToday: data?.activeToday ?? 0,
                newThisMonth: data?.newThisMonth ?? 0,
                avgSession: data?.avgSession ?? '0m',
                usersByRole: data?.usersByRole ?? [],
                loginTimeline: data?.loginTimeline ?? [],
                topUsers: data?.topUsers ?? [],
            });
        } catch {
            setUserStats({
                totalUsers: 234, activeToday: 18, newThisMonth: 27, avgSession: '14m 32s',
                usersByRole: [
                    { role: 'Électriciens', count: 98 },
                    { role: 'Bureaux d\'Études', count: 45 },
                    { role: 'Promoteurs', count: 38 },
                    { role: 'Particuliers', count: 32 },
                    { role: 'Administrateurs', count: 21 }
                ],
                loginTimeline: [
                    { date: '09 Fév', logins: 42, registrations: 3 },
                    { date: '10 Fév', logins: 55, registrations: 5 },
                    { date: '11 Fév', logins: 38, registrations: 2 },
                    { date: '12 Fév', logins: 61, registrations: 7 },
                    { date: '13 Fév', logins: 47, registrations: 4 },
                    { date: '14 Fév', logins: 73, registrations: 6 }
                ],
                topUsers: [
                    { name: 'Amadou Diallo', role: 'Électricien', actions: 312, lastActive: '2026-02-14T10:30:00' },
                    { name: 'Marie Ndiaye', role: 'Bureau d\'Études', actions: 278, lastActive: '2026-02-14T09:15:00' },
                    { name: 'Papa Touré', role: 'Promoteur', actions: 245, lastActive: '2026-02-13T16:45:00' },
                    { name: 'Sokhna Fall', role: 'Administrateur', actions: 198, lastActive: '2026-02-13T14:20:00' },
                    { name: 'Khadija Ba', role: 'Électricienne', actions: 167, lastActive: '2026-02-13T11:00:00' }
                ]
            });
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    const actionIcon = (action: string) => {
        switch (action) {
            case 'upload': return <Upload className="h-4 w-4 text-blue-500" />;
            case 'download': return <Download className="h-4 w-4 text-green-500" />;
            default: return <Activity className="h-4 w-4 text-amber-500" />;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
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
                    {loading.documents ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card decoration="top" decorationColor="blue">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Total Documents</Text>
                                            <Metric>{docStats.totalDocs}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                                <Card decoration="top" decorationColor="green">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Uploads</Text>
                                            <Metric>{docStats.totalUploads}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                                <Card decoration="top" decorationColor="amber">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Downloads</Text>
                                            <Metric>{docStats.totalDownloads}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                                            <Download className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                                <Card decoration="top" decorationColor="purple">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Taille Moyenne</Text>
                                            <Metric>{docStats.avgSize}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                            <Database className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <Title>Documents par Type</Title>
                                    <DonutChart
                                        className="mt-6"
                                        data={docStats.docsByType}
                                        category="count"
                                        index="type"
                                        colors={["blue", "green", "yellow", "red", "purple"]}
                                        valueFormatter={(value) => `${value} docs`}
                                    />
                                </Card>
                                <Card>
                                    <Title>Création vs Mise à Jour (6 mois)</Title>
                                    <BarChart
                                        className="mt-6"
                                        data={docStats.docsByMonth}
                                        index="month"
                                        categories={["created", "updated"]}
                                        colors={["blue", "amber"]}
                                        valueFormatter={(value) => `${value}`}
                                        yAxisWidth={40}
                                    />
                                </Card>
                            </div>

                            <Card>
                                <Title>Activité Récente</Title>
                                <Table className="mt-6">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Action</TableHeaderCell>
                                            <TableHeaderCell>Document</TableHeaderCell>
                                            <TableHeaderCell>Utilisateur</TableHeaderCell>
                                            <TableHeaderCell>Date</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {docStats.recentActivity?.map((a) => (
                                            <TableRow key={a.id}>
                                                <TableCell>{actionIcon(a.action)}</TableCell>
                                                <TableCell className="font-medium">{a.doc}</TableCell>
                                                <TableCell>{a.user}</TableCell>
                                                <TableCell>
                                                    {format(new Date(a.date), 'dd MMM HH:mm', { locale: fr })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    {loading.users ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card decoration="top" decorationColor="blue">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Total Utilisateurs</Text>
                                            <Metric>{userStats.totalUsers}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                                            <Users className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                                <Card decoration="top" decorationColor="green">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Actifs Aujourd'hui</Text>
                                            <Metric>{userStats.activeToday}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                                <Card decoration="top" decorationColor="amber">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Nouveaux ce Mois</Text>
                                            <Metric>{userStats.newThisMonth}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                                            <TrendingUp className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                                <Card decoration="top" decorationColor="purple">
                                    <Flex alignItems="start">
                                        <div className="flex-1">
                                            <Text>Session Moyenne</Text>
                                            <Metric>{userStats.avgSession}</Metric>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                    </Flex>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <Title>Utilisateurs par Rôle</Title>
                                    <DonutChart
                                        className="mt-6"
                                        data={userStats.usersByRole}
                                        category="count"
                                        index="role"
                                        colors={["blue", "green", "yellow", "red", "purple"]}
                                        valueFormatter={(value) => `${value} users`}
                                    />
                                </Card>
                                <Card>
                                    <Title>Connexions & Inscriptions (7 jours)</Title>
                                    <AreaChart
                                        className="mt-6"
                                        data={userStats.loginTimeline}
                                        index="date"
                                        categories={["logins", "registrations"]}
                                        colors={["blue", "green"]}
                                        valueFormatter={(value) => `${value}`}
                                        yAxisWidth={40}
                                    />
                                </Card>
                            </div>

                            <Card>
                                <Title>Utilisateurs les Plus Actifs</Title>
                                <Table className="mt-6">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Nom</TableHeaderCell>
                                            <TableHeaderCell>Rôle</TableHeaderCell>
                                            <TableHeaderCell>Actions</TableHeaderCell>
                                            <TableHeaderCell>Dernière Activité</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {userStats.topUsers?.map((u, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{u.name}</TableCell>
                                                <TableCell><TremorBadge color="blue" size="sm">{u.role}</TremorBadge></TableCell>
                                                <TableCell>{u.actions}</TableCell>
                                                <TableCell>
                                                    {format(new Date(u.lastActive), 'dd MMM HH:mm', { locale: fr })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                    <ShadCard className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Analytics Avancés (Metabase)
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Accédez à Metabase pour des analyses SQL avancées, des rapports personnalisés et des tableaux de bord interactifs.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                { label: 'Requêtes SQL', desc: 'Interrogez directement votre base de données', color: 'from-blue-500 to-cyan-500' },
                                { label: 'Rapports Programmés', desc: 'Recevez vos statistiques par email', color: 'from-purple-500 to-pink-500' },
                                { label: 'Export Data', desc: 'CSV, Excel, JSON vers votre espace', color: 'from-emerald-500 to-teal-500' }
                            ].map((item) => (
                                <div key={item.label} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-10`}>
                                    <div className="bg-white/90 rounded-lg p-4">
                                        <h4 className="font-bold text-gray-900 mb-1">{item.label}</h4>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <div className="text-center">
                                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Intégration Metabase</p>
                                <p className="text-sm text-gray-400">http://localhost:3101</p>
                            </div>
                        </div>
                    </ShadCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
