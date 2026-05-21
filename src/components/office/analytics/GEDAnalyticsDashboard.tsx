import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  BadgeDelta,
  BarChart,
  DonutChart,
  AreaChart,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge } from
'@tremor/react';
import {
  FileText,
  Users,
  HardDrive,

  CheckCircle2 } from


'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsData {
  totalDocuments: number;
  activeUsers: number;
  storageUsed: number;
  approvalRate: number;
  documentsByCategory: Array<{category: string;count: number;}>;
  activityTimeline: Array<{date: string;uploads: number;downloads: number;edits: number;}>;
  topUsers: Array<{name: string;actions: number;}>;
  recentDocuments: Array<{
    id: string;
    title: string;
    user: string;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
  }>;
}

export function GEDAnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsData>({
    totalDocuments: 0,
    activeUsers: 0,
    storageUsed: 0,
    approvalRate: 0,
    documentsByCategory: [],
    activityTimeline: [],
    topUsers: [],
    recentDocuments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/ged');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Mock data for demo
      setStats({
        totalDocuments: 247,
        activeUsers: 23,
        storageUsed: 6.8 * 1024 * 1024 * 1024, // 6.8 GB
        approvalRate: 94,
        documentsByCategory: [
        { category: 'Rapports', count: 89 },
        { category: 'Devis', count: 67 },
        { category: 'Plans', count: 45 },
        { category: 'Photos', count: 32 },
        { category: 'Autres', count: 14 }],

        activityTimeline: [
        { date: '2026-01-24', uploads: 12, downloads: 34, edits: 8 },
        { date: '2026-01-25', uploads: 15, downloads: 28, edits: 12 },
        { date: '2026-01-26', uploads: 8, downloads: 45, edits: 6 },
        { date: '2026-01-27', uploads: 18, downloads: 52, edits: 15 },
        { date: '2026-01-28', uploads: 22, downloads: 38, edits: 10 },
        { date: '2026-01-29', uploads: 14, downloads: 41, edits: 9 },
        { date: '2026-01-30', uploads: 19, downloads: 36, edits: 11 }],

        topUsers: [
        { name: 'Jean Dupont', actions: 156 },
        { name: 'Marie Martin', actions: 142 },
        { name: 'Pierre Durand', actions: 128 },
        { name: 'Sophie Bernard', actions: 98 },
        { name: 'Luc Petit', actions: 87 }],

        recentDocuments: [
        { id: '1', title: 'Rapport Intervention Client ABC', user: 'Jean Dupont', date: '2026-01-30T14:30:00', status: 'approved' },
        { id: '2', title: 'Devis Installation Électrique', user: 'Marie Martin', date: '2026-01-30T11:15:00', status: 'pending' },
        { id: '3', title: 'Plan Schéma Unifilaire', user: 'Pierre Durand', date: '2026-01-30T09:45:00', status: 'approved' },
        { id: '4', title: 'Photos Chantier Site XYZ', user: 'Sophie Bernard', date: '2026-01-29T16:20:00', status: 'approved' },
        { id: '5', title: 'Rapport Conformité NF C 15-100', user: 'Luc Petit', date: '2026-01-29T14:10:00', status: 'pending' }]

      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':return 'green';
      case 'pending':return 'yellow';
      case 'rejected':return 'red';
      default:return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':return 'Approuvé';
      case 'pending':return 'En attente';
      case 'rejected':return 'Rejeté';
      default:return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>);

  }

  return (
    <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card decoration="top" decorationColor="blue">
                    <Flex alignItems="start">
                        <div className="flex-1">
                            <Text>Total Documents</Text>
                            <Metric>{stats.totalDocuments}</Metric>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                            <FileText className="h-6 w-6" />
                        </div>
                    </Flex>
                    <Flex className="mt-4">
                        <Text className="truncate">+12% ce mois</Text>
                        <BadgeDelta deltaType="increase">12%</BadgeDelta>
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="green">
                    <Flex alignItems="start">
                        <div className="flex-1">
                            <Text>Utilisateurs Actifs</Text>
                            <Metric>{stats.activeUsers}</Metric>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                            <Users className="h-6 w-6" />
                        </div>
                    </Flex>
                    <Flex className="mt-4">
                        <Text className="truncate">Aujourd'hui</Text>
                        <Badge color="green">Actif</Badge>
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="purple">
                    <Flex alignItems="start">
                        <div className="flex-1">
                            <Text>Stockage Utilisé</Text>
                            <Metric>{formatBytes(stats.storageUsed)}</Metric>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <HardDrive className="h-6 w-6" />
                        </div>
                    </Flex>
                    <Flex className="mt-4">
                        <Text className="truncate">68% de 10GB</Text>
                        <Badge color="purple">Normal</Badge>
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="emerald">
                    <Flex alignItems="start">
                        <div className="flex-1">
                            <Text>Taux d'Approbation</Text>
                            <Metric>{stats.approvalRate}%</Metric>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    </Flex>
                    <Flex className="mt-4">
                        <Text className="truncate">Excellent</Text>
                        <BadgeDelta deltaType="increase">+2%</BadgeDelta>
                    </Flex>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Documents par Catégorie */}
                <Card>
                    <Title>Documents par Catégorie</Title>
                    <DonutChart
            className="mt-6"
            data={stats.documentsByCategory}
            category="count"
            index="category"
            colors={["blue", "green", "yellow", "red", "purple"]}
            valueFormatter={(value) => `${value} docs`} />
          
                </Card>

                {/* Activité 7 jours */}
                <Card>
                    <Title>Activité (7 derniers jours)</Title>
                    <AreaChart
            className="mt-6"
            data={stats.activityTimeline}
            index="date"
            categories={["uploads", "downloads", "edits"]}
            colors={["blue", "green", "amber"]}
            valueFormatter={(value) => `${value}`}
            yAxisWidth={40} />
          
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Utilisateurs */}
                <Card>
                    <Title>Utilisateurs les Plus Actifs</Title>
                    <BarChart
            className="mt-6"
            data={stats.topUsers}
            index="name"
            categories={["actions"]}
            colors={["blue"]}
            valueFormatter={(value) => `${value} actions`}
            yAxisWidth={48} />
          
                </Card>

                {/* Documents Récents */}
                <Card>
                    <Title>Documents Récents</Title>
                    <Table className="mt-6">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Document</TableHeaderCell>
                                <TableHeaderCell>Utilisateur</TableHeaderCell>
                                <TableHeaderCell>Date</TableHeaderCell>
                                <TableHeaderCell>Statut</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.recentDocuments.map((doc) =>
              <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.title}</TableCell>
                                    <TableCell>{doc.user}</TableCell>
                                    <TableCell>
                                        {format(new Date(doc.date), 'dd MMM HH:mm', { locale: fr })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={getStatusColor(doc.status)} size="sm">
                                            {getStatusLabel(doc.status)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
              )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>);

}