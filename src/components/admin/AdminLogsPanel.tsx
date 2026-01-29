
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Filter, Download, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

type LogLevel = "error" | "warning" | "info" | "success";
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  component: string;
  user: string;
}

export default function AdminLogsPanel() {
  const [logLevel, setLogLevel] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("24h");

  // Mock data pour les logs
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      level: "error",
      message: "Erreur de connexion à la base de données",
      component: "Database",
      user: "system"
    },
    {
      id: "2", 
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      level: "warning",
      message: "Tentative de connexion échouée",
      component: "Auth",
      user: "user@example.com"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      level: "info",
      message: "Utilisateur connecté avec succès",
      component: "Auth",
      user: "admin@example.com"
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      level: "success",
      message: "Sauvegarde automatique effectuée",
      component: "Backup",
      user: "system"
    }
  ];

  const filteredLogs = mockLogs.filter(log => {
    if (logLevel !== "all" && log.level !== logLevel) return false;
    
    const logTime = new Date(log.timestamp);
    const now = new Date();
    const timeThreshold = timeFilter === "24h" ? 24 * 60 * 60 * 1000 :
                         timeFilter === "7d" ? 7 * 24 * 60 * 60 * 1000 :
                         timeFilter === "30d" ? 30 * 24 * 60 * 60 * 1000 :
                         Infinity;
    
    return now.getTime() - logTime.getTime() <= timeThreshold;
  });

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogBadgeVariant = (level: LogLevel): BadgeVariant => {
    switch (level) {
      case "error": return "destructive";
      case "warning": return "outline";
      case "success": return "default";
      case "info": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-proqblue">Journaux de sécurité</h2>
        <p className="text-proqblue-dark">Surveillance et analyse des événements système</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <CardDescription>
            Filtrez les journaux par niveau et période
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Niveau de log</label>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="warning">Avertissements</SelectItem>
                  <SelectItem value="info">Informations</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Période</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Dernières 24h</SelectItem>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journaux récents</CardTitle>
          <CardDescription>
            {filteredLogs.length} entrée(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50">
                  {getLogIcon(log.level)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getLogBadgeVariant(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{log.component}</span>
                    </div>
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-gray-500">Utilisateur: {log.user}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun journal trouvé pour les critères sélectionnés</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
