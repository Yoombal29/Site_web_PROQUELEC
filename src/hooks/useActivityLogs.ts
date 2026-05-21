
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
  entityId?: string) =>
  {
    try {
      const token = localStorage.getItem('token');
      await fetch("/api/admin/audit-logs", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        })
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
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
      const token = localStorage.getItem('token');
      const res = await fetch("/api/admin/audit-logs", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();

      setLogs(data.map((log: unknown) => ({
        id: log.id,
        userId: log.user_id,
        userEmail: log.user_email || 'Utilisateur', // Need to join users in SQL if email is needed
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        details: log.details,
        timestamp: new Date(log.timestamp)
      })));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs d'activité",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const exportLogs = useCallback((format: 'csv' | 'json' = 'csv') => {
    if (format === 'csv') {
      const csvContent = [
      'Date,Utilisateur,Action,Type,Détails,IP',
      ...logs.map((log) =>
      `${log.timestamp.toISOString()},${log.userEmail},${log.action},${log.entityType},"${log.details}",${log.ipAddress}`
      )].
      join('\n');

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
      description: `Les logs ont été exportés au format ${format.toUpperCase()}`
    });
  }, [logs, toast]);

  return {
    logs,
    isLoading,
    logActivity,
    fetchLogs,
    exportLogs
  };
}