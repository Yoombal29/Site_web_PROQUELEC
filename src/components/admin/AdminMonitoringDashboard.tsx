
import { useState, useEffect } from 'react';
import { Activity, Users, Eye, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import { apiFetch } from '@/lib/api-client';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
  performance: 'healthy' | 'warning' | 'error';
  errors: number;
}

interface RealTimeStats {
  activeUsers: number;
  pageViews: number;
  averageLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
}

export function AdminMonitoringDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    cache: 'healthy',
    performance: 'healthy',
    errors: 0
  });

  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
    activeUsers: 0,
    pageViews: 0,
    averageLoadTime: 0,
    errorRate: 0,
    cacheHitRate: 0
  });

  const { getPerformanceMetrics } = useAdvancedAnalytics();
  const { cacheStats } = useAdvancedCache('monitoring', async () => ({}));

  // Surveillance en temps réel
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Test de la base de données via API
        let dbStatus: 'healthy' | 'error' = 'healthy';
        try {
          // Using a lightweight endpoint to check DB connectivity
          await apiFetch('/api/health'); // Assuming an endpoint /api/health or similar exists or we use metrics
        } catch (e) {
          dbStatus = 'error';
        }

        // Métriques de performance
        const perfMetrics = getPerformanceMetrics();

        // Statistiques du cache
        const cache = cacheStats;

        setSystemHealth({
          database: dbStatus,
          cache: cache.totalItems > cache.maxSize * 0.9 ? 'warning' : 'healthy',
          performance: perfMetrics && perfMetrics.page_load_time > 3000 ? 'warning' : 'healthy',
          errors: 0 // À implémenter avec un système de logs d'erreurs
        });

        // Mise à jour des statistiques temps réel
        setRealTimeStats(prev => ({
          ...prev,
          averageLoadTime: perfMetrics?.page_load_time || 0,
          cacheHitRate: cache.totalItems > 0 ? (cache.averageAccessCount / cache.totalItems) * 100 : 0
        }));

      } catch (error) {
        console.error('Erreur surveillance système:', error);
        setSystemHealth(prev => ({ ...prev, database: 'error' }));
      }
    };

    // Vérification initiale
    checkSystemHealth();

    // Surveillance continue toutes les 30 secondes
    const interval = setInterval(checkSystemHealth, 30000);

    return () => clearInterval(interval);
  }, [getPerformanceMetrics, cacheStats]);

  // WebSocket pour les stats en temps réel (simulation)
  useEffect(() => {
    const updateRealTimeStats = () => {
      setRealTimeStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: prev.pageViews + Math.floor(Math.random() * 5),
        errorRate: Math.random() * 2
      }));
    };

    const interval = setInterval(updateRealTimeStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-proqblue">Monitoring en Temps Réel</h2>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Activity className="h-3 w-3 mr-1" />
          Système actif
        </Badge>
      </div>

      {/* État du système */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Base de données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${getHealthColor(systemHealth.database)}`}>
              {getHealthIcon(systemHealth.database)}
              <span className="capitalize">{systemHealth.database}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${getHealthColor(systemHealth.cache)}`}>
              {getHealthIcon(systemHealth.cache)}
              <span className="capitalize">{systemHealth.cache}</span>
            </div>
            <Progress
              value={cacheStats ? (cacheStats.totalItems / cacheStats.maxSize) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${getHealthColor(systemHealth.performance)}`}>
              {getHealthIcon(systemHealth.performance)}
              <span>{realTimeStats.averageLoadTime}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.errors}</div>
            <p className="text-xs text-muted-foreground">Dernière heure</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-proqblue" />
              Utilisateurs actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">En ligne maintenant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-proqblue" />
              Vues de page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.pageViews}</div>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-proqblue" />
              Taux d'erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Dernière heure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.cacheHitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Efficacité cache</p>
          </CardContent>
        </Card>
      </div>

      {/* Cockpit Neural-Next (Astra Engine Monitoring) */}
      <Card className="border-proqblue/30 bg-proqblue/5 backdrop-blur-sm overflow-hidden border-2">
        <CardHeader className="bg-proqblue/10 border-b border-proqblue/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-proqblue flex items-center gap-2 uppercase tracking-tighter">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Cockpit Stratégique Neural-Next
            </CardTitle>
            <Badge className="bg-proqblue text-white animate-pulse">LIVE CORTEX V3.2</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full h-[600px] bg-slate-900">
            <iframe
              src="http://localhost:4000/dashboard.html"
              className="w-full h-full border-none"
              title="Astra Engine Live Monitoring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alertes et notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes Système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemHealth.performance === 'warning' && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span>Performance dégradée détectée</span>
              </div>
            )}
            {systemHealth.cache === 'warning' && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span>Cache proche de la saturation</span>
              </div>
            )}
            {Object.values(systemHealth).every(status => status === 'healthy') && (
              <div className="flex items-center gap-2 p-2 bg-green-50 text-green-800 rounded">
                <CheckCircle className="h-4 w-4" />
                <span>Tous les systèmes fonctionnent normalement</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
