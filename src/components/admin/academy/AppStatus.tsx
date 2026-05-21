import React, { useEffect, useState } from 'react';
import { Info, CheckCircle, AlertCircle, XCircle, Wifi, WifiOff, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { normService } from '@/services/academy/normService';

export const AppStatus: React.FC = () => {
  const [normStats, setNormStats] = useState(normService.getStats());
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const storageAvailable = typeof localStorage !== 'undefined';

  useEffect(() => {
    let isMounted = true;

    normService.loadData()
      .then(() => {
        if (isMounted) {
          setNormStats(normService.getStats());
        }
      })
      .catch(() => {
        if (isMounted) {
          setNormStats(normService.getStats());
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getConnectionBadge = (connected: boolean) => {
    return (
      <Badge variant={connected ? "default" : "destructive"} className="ml-2">
        {connected ? 'Connecté' : 'Déconnecté'}
      </Badge>
    );
  };

  const systemHealth = [storageAvailable, isOnline, normStats.loaded].filter(Boolean).length * 33;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">État du système</h1>
      </div>

      {/* Vue d'ensemble du système */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Mode robuste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  Actif
                </div>
                <p className="text-xs text-muted-foreground">
                  Génération déterministe
                </p>
              </div>
              {getStatusIcon(true)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              Connexion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {isOnline ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  État de la connexion réseau
                </p>
              </div>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Moteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {normStats.loaded ? normStats.ruleCount : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Règles normatives
                </p>
              </div>
              <Database className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Santé système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{systemHealth}%</span>
                {systemHealth >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : systemHealth >= 60 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails des services */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Services système</CardTitle>
            <CardDescription>État des différents composants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4" />
                <span>Génération robuste</span>
              </div>
              {getConnectionBadge(true)}
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4" />
                <span>Normes locales</span>
              </div>
              <Badge variant={normStats.loaded ? "default" : "secondary"}>
                {normStats.loaded ? 'Chargé' : 'En attente'}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4" />
                <span>Stockage local</span>
              </div>
              <Badge variant={storageAvailable ? "default" : "destructive"}>
                {storageAvailable ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration active</CardTitle>
            <CardDescription>Paramètres actuels du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Mode:</span>
              <span className="text-sm">Robuste</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium">Normes:</span>
              <span className="text-sm">
                {normStats.loaded ? `${normStats.ruleCount} règles` : 'Non chargées'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium">Connexion:</span>
              <span className="text-sm">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Conseil
          </CardTitle>
          <CardDescription>Fonctionnement 100% autonome</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cette application reste pleinement opérationnelle sans IA externe. Importez vos documents
          et générez vos cours avec le moteur déterministe.
        </CardContent>
      </Card>
    </div>
  );
};
