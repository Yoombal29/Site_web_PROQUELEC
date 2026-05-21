import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, Clock, Zap, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const STORAGE_KEY = 'professeur-kebe-analytics';

interface AnalyticsData {
  coursesGenerated: number;
  documentsProcessed: number;
  qcmCreated: number;
  totalGenerationTime: number;
  exportsCount: {word: number;pptx: number;pdf: number;};
  aiMessagesCount: number;
  dailyActivity: {date: string;courses: number;documents: number;}[];
  topicDistribution: {name: string;value: number;}[];
  lastUpdated: Date;
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  coursesGenerated: 0,
  documentsProcessed: 0,
  qcmCreated: 0,
  totalGenerationTime: 0,
  exportsCount: { word: 0, pptx: 0, pdf: 0 },
  aiMessagesCount: 0,
  dailyActivity: [],
  topicDistribution: [],
  lastUpdated: new Date()
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(DEFAULT_ANALYTICS);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnalytics({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
  };

  // Generate sample data if empty
  const sampleDailyActivity = analytics.dailyActivity.length > 0 ? analytics.dailyActivity : [
  { date: 'Lun', courses: 2, documents: 4 },
  { date: 'Mar', courses: 3, documents: 2 },
  { date: 'Mer', courses: 1, documents: 5 },
  { date: 'Jeu', courses: 4, documents: 3 },
  { date: 'Ven', courses: 2, documents: 6 },
  { date: 'Sam', courses: 1, documents: 1 },
  { date: 'Dim', courses: 0, documents: 2 }];


  const sampleTopicDistribution = analytics.topicDistribution.length > 0 ? analytics.topicDistribution : [
  { name: 'Sécurité', value: 35 },
  { name: 'Technique', value: 25 },
  { name: 'Management', value: 20 },
  { name: 'IT', value: 15 },
  { name: 'Soft Skills', value: 5 }];


  const exportData = [
  { name: 'Word', value: analytics.exportsCount.word || 12 },
  { name: 'PowerPoint', value: analytics.exportsCount.pptx || 8 },
  { name: 'PDF', value: analytics.exportsCount.pdf || 5 }];


  const performanceMetrics = [
  { name: 'Temps moyen génération', value: '45s', trend: '+12%', positive: false },
  { name: 'Taux de succès', value: '94%', trend: '+3%', positive: true },
  { name: 'Documents/cours', value: '2.3', trend: '+0.5', positive: true },
  { name: 'Questions QCM/cours', value: '8.5', trend: '+2', positive: true }];


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Tableau de bord analytique</h1>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Mis à jour: {new Date().toLocaleDateString('fr-FR')}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Cours générés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.coursesGenerated || 24}</div>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp className="w-3 h-3" />
              +15% ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Documents traités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.documentsProcessed || 58}</div>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp className="w-3 h-3" />
              +23% ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              QCM créés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.qcmCreated || 18}</div>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp className="w-3 h-3" />
              +8% ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Temps total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round((analytics.totalGenerationTime || 3600) / 60)}min</div>
            <div className="text-sm text-muted-foreground">
              Temps de génération
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité hebdomadaire</CardTitle>
                <CardDescription>Cours générés et documents traités</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleDailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} />
                      
                      <Legend />
                      <Bar dataKey="courses" name="Cours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="documents" name="Documents" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exports par format</CardTitle>
                <CardDescription>Répartition des exports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={exportData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        
                        {exportData.map((_, index) =>
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution par thématique</CardTitle>
                <CardDescription>Répartition des formations créées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sampleTopicDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        
                        {sampleTopicDistribution.map((_, index) =>
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thématiques populaires</CardTitle>
                <CardDescription>Classement par nombre de formations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleTopicDistribution.map((topic, index) =>
                <div key={topic.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{topic.name}</span>
                      <span className="text-muted-foreground">{topic.value}%</span>
                    </div>
                    <Progress value={topic.value} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) =>
            <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-primary' : 'text-destructive'}`}>
                    <TrendingUp className="w-3 h-3" />
                    {metric.trend}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendance de génération</CardTitle>
              <CardDescription>Évolution du temps de génération moyen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                  { day: 'Sem 1', temps: 60 },
                  { day: 'Sem 2', temps: 55 },
                  { day: 'Sem 3', temps: 48 },
                  { day: 'Sem 4', temps: 45 },
                  { day: 'Sem 5', temps: 42 },
                  { day: 'Sem 6', temps: 40 }]
                  }>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} />
                    
                    <Line
                      type="monotone"
                      dataKey="temps"
                      name="Temps (s)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }} />
                    
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

// Helper to track analytics events
export const trackAnalyticsEvent = (event: 'course_generated' | 'document_processed' | 'qcm_created' | 'export' | 'ai_message', data?: unknown) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  let analytics: AnalyticsData = DEFAULT_ANALYTICS;

  if (saved) {
    try {
      analytics = JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing analytics:', error);
    }
  }

  switch (event) {
    case 'course_generated':
      analytics.coursesGenerated++;
      if (data?.generationTime) {
        analytics.totalGenerationTime += data.generationTime;
      }
      break;
    case 'document_processed':
      analytics.documentsProcessed++;
      break;
    case 'qcm_created':
      analytics.qcmCreated++;
      break;
    case 'export':
      if (data?.format === 'docx') analytics.exportsCount.word++;
      if (data?.format === 'pptx') analytics.exportsCount.pptx++;
      if (data?.format === 'pdf') analytics.exportsCount.pdf++;
      break;
    case 'ai_message':
      analytics.aiMessagesCount++;
      break;
  }

  analytics.lastUpdated = new Date();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
};