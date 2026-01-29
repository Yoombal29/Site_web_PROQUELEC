
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, Clock, Eye, MousePointer, Layout, TrendingUp } from "lucide-react";

export default function AdminPerformancePanel() {
  const { metrics, isLoading, refreshMetrics, getScoreColor, getScoreLabel } = usePerformanceMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Métriques de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Collecte des métriques...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const performanceItems = [
    {
      name: 'First Contentful Paint',
      value: metrics.firstContentfulPaint,
      unit: 'ms',
      icon: Eye,
      thresholds: { good: 1800, needsImprovement: 3000 },
      description: 'Temps pour afficher le premier élément'
    },
    {
      name: 'Largest Contentful Paint',
      value: metrics.largestContentfulPaint,
      unit: 'ms',
      icon: Layout,
      thresholds: { good: 2500, needsImprovement: 4000 },
      description: 'Temps pour afficher le plus gros élément'
    },
    {
      name: 'First Input Delay',
      value: metrics.firstInputDelay,
      unit: 'ms',
      icon: MousePointer,
      thresholds: { good: 100, needsImprovement: 300 },
      description: 'Délai de réponse à la première interaction'
    },
    {
      name: 'Cumulative Layout Shift',
      value: metrics.cumulativeLayoutShift,
      unit: '',
      icon: TrendingUp,
      thresholds: { good: 0.1, needsImprovement: 0.25 },
      description: 'Stabilité visuelle de la page'
    },
    {
      name: 'Time to Interactive',
      value: metrics.timeToInteractive,
      unit: 'ms',
      icon: Clock,
      thresholds: { good: 3800, needsImprovement: 7300 },
      description: 'Temps pour que la page soit interactive'
    },
    {
      name: 'Total Blocking Time',
      value: metrics.totalBlockingTime,
      unit: 'ms',
      icon: Clock,
      thresholds: { good: 200, needsImprovement: 600 },
      description: 'Temps total de blocage du thread principal'
    }
  ];

  const overallScore = performanceItems.reduce((acc, item) => {
    const score = item.value <= item.thresholds.good ? 100 : 
                 item.value <= item.thresholds.needsImprovement ? 50 : 0;
    return acc + score;
  }, 0) / performanceItems.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Métriques de Performance
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Score Global</span>
            <Badge variant={overallScore >= 80 ? "default" : overallScore >= 50 ? "secondary" : "destructive"}>
              {Math.round(overallScore)}%
            </Badge>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceItems.map((item) => {
            const Icon = item.icon;
            const scoreColor = getScoreColor(item.value, item.thresholds);
            const scoreLabel = getScoreLabel(item.value, item.thresholds);
            
            return (
              <div key={item.name} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <Badge 
                    variant={scoreLabel === 'Bon' ? "default" : scoreLabel === 'À améliorer' ? "secondary" : "destructive"}
                  >
                    {scoreLabel}
                  </Badge>
                </div>
                
                <div className={`text-2xl font-bold ${scoreColor}`}>
                  {item.unit === 'ms' ? Math.round(item.value) : item.value.toFixed(3)}
                  {item.unit && <span className="text-sm ml-1">{item.unit}</span>}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Recommandations</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {metrics.largestContentfulPaint > 2500 && (
              <li>• Optimisez les images et utilisez des formats modernes (WebP, AVIF)</li>
            )}
            {metrics.firstInputDelay > 100 && (
              <li>• Réduisez le JavaScript et utilisez le code splitting</li>
            )}
            {metrics.cumulativeLayoutShift > 0.1 && (
              <li>• Spécifiez les dimensions des images et réservez l'espace pour le contenu dynamique</li>
            )}
            {metrics.totalBlockingTime > 200 && (
              <li>• Divisez les tâches JavaScript longues et utilisez des Web Workers</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
