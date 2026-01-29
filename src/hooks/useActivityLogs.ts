
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const logActivity = useCallback(async (
    action: string,
    entityType: string,
    details: string,
    entityId?: string
  ) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user', // À remplacer par l'ID utilisateur réel
      userEmail: 'admin@proquelec.com', // À remplacer par l'email utilisateur réel
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date(),
      ipAddress: '192.168.1.1', // À récupérer dynamiquement
      userAgent: navigator.userAgent,
    };

    setLogs(prev => [newLog, ...prev]);

    // Simuler l'envoi vers la base de données
    console.log('Activity logged:', newLog);
  }, []);

  const fetchLogs = useCallback(async (filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setIsLoading(true);
    
    try {
      // Simulation de données de logs
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          userId: 'user1',
          userEmail: 'admin@proquelec.com',
          action: 'CREATE',
          entityType: 'BLOG_POST',
          entityId: 'post1',
          details: 'Création de l\'article "Nouvelles normes électriques"',
          timestamp: new Date(Date.now() - 3600000),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: '2',
          userId: 'user1',
          userEmail: 'admin@proquelec.com',
          action: 'UPDATE',
          entityType: 'SITE_SETTINGS',
          details: 'Modification des paramètres du site',
          timestamp: new Date(Date.now() - 7200000),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: '3',
          userId: 'user2',
          userEmail: 'editor@proquelec.com',
          action: 'DELETE',
          entityType: 'DOCUMENT',
          entityId: 'doc1',
          details: 'Suppression du document "Manuel ancien"',
          timestamp: new Date(Date.now() - 10800000),
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...'
        }
      ];

      let filteredLogs = mockLogs;

      if (filters?.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters?.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters?.entityType) {
        filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType);
      }
      if (filters?.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters?.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }

      setLogs(filteredLogs);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs d'activité",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const exportLogs = useCallback((format: 'csv' | 'json' = 'csv') => {
    if (format === 'csv') {
      const csvContent = [
        'Date,Utilisateur,Action,Type,Détails,IP',
        ...logs.map(log => 
          `${log.timestamp.toISOString()},${log.userEmail},${log.action},${log.entityType},"${log.details}",${log.ipAddress}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      const jsonContent = JSON.stringify(logs, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    }

    toast({
      title: "Export réussi",
      description: `Les logs ont été exportés au format ${format.toUpperCase()}`,
    });
  }, [logs, toast]);

  return {
    logs,
    isLoading,
    logActivity,
    fetchLogs,
    exportLogs,
  };
}
