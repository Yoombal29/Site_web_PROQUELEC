import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  const getToken = () =>
    localStorage.getItem('token') || localStorage.getItem('access_token') || '';

  // Fonction utilitaire pour sauvegarder dans localStorage
  const saveToLocalStorage = useCallback((notifications: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }, []);

  // Fonction utilitaire pour charger depuis localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
    return [];
  }, []);

  // Fetch notifications from server
  const fetchFromServer = useCallback(async (): Promise<Notification[] | null> => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}/api/cms/notifications`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // Normalize server data to match our interface
      const items = Array.isArray(data) ? data : data.notifications || data.data || [];
      const normalized: Notification[] = items.map((n: any) => ({
        id: n.id?.toString() || n._id?.toString() || Date.now().toString(),
        title: n.title || '',
        message: n.message || n.body || '',
        type: n.type || 'info',
        timestamp: new Date(n.timestamp || n.createdAt || n.date),
        read: n.read ?? false,
      }));
      return normalized;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications depuis le serveur:', error);
      return null;
    }
  }, []);

  // Charger les notifications au montage : serveur d'abord, localStorage en fallback
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);

      const serverData = await fetchFromServer();
      if (serverData) {
        setNotifications(serverData);
        saveToLocalStorage(serverData);
      } else {
        const localData = loadFromLocalStorage();
        setNotifications(localData);
      }

      setIsLoading(false);
    };

    loadNotifications();
  }, [fetchFromServer, loadFromLocalStorage, saveToLocalStorage]);

  // Periodic polling toutes les 30 secondes
  useEffect(() => {
    const poll = async () => {
      const serverData = await fetchFromServer();
      if (serverData) {
        setNotifications(serverData);
        saveToLocalStorage(serverData);
      }
    };

    pollingRef.current = setInterval(poll, 30000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchFromServer, saveToLocalStorage]);

  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      setIsLoading(true);

      // Simulation d'un délai pour l'UX
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newNotification: Notification = {
        id: Date.now().toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        saveToLocalStorage(updated);
        return updated;
      });

      setIsLoading(false);

      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });

      return newNotification.id;
    },
    [toast, saveToLocalStorage],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      // Mise à jour optimiste
      setNotifications((prev) => {
        const updated = prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        );
        saveToLocalStorage(updated);
        return updated;
      });

      // Appel serveur
      const token = getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}/api/cms/notifications/${id}/read`, {
            method: 'PUT',
            headers: getAuthHeaders(),
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la notification sur le serveur:', error);
        }
      }
    },
    [saveToLocalStorage],
  );

  const removeNotification = useCallback(
    async (id: string) => {
      // Simulation d'un délai pour l'UX
      await new Promise((resolve) => setTimeout(resolve, 50));

      setNotifications((prev) => {
        const updated = prev.filter((notification) => notification.id !== id);
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage],
  );

  const clearAll = useCallback(async () => {
    // Mise à jour optimiste
    setNotifications([]);
    saveToLocalStorage([]);

    // Appel serveur
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/api/cms/notifications/read-all`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        });
      } catch (error) {
        console.error("Erreur lors de l'effacement des notifications sur le serveur:", error);
      }
    }
  }, [saveToLocalStorage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
    unreadCount,
    isLoading, // Export isLoading for completeness
  };
}
