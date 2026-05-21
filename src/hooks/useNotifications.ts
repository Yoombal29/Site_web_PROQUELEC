
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        return parsed.map((n: unknown) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
    return [];
  }, []);

  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    setIsLoading(true);

    // Simulation d'un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: new Date(),
      read: false
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
      variant: notification.type === "error" ? "destructive" : "default"
    });

    return newNotification.id;
  }, [toast, saveToLocalStorage]);

  const markAsRead = useCallback(async (id: string) => {
    // Simulation d'un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 50));

    setNotifications((prev) => {
      const updated = prev.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
      );
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  const removeNotification = useCallback(async (id: string) => {
    // Simulation d'un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 50));

    setNotifications((prev) => {
      const updated = prev.filter((notification) => notification.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  const clearAll = useCallback(async () => {
    // Simulation d'un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 50));

    setNotifications([]);
    saveToLocalStorage([]);
  }, [saveToLocalStorage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Charger les notifications depuis localStorage au montage
  useEffect(() => {
    const loadedNotifications = loadFromLocalStorage();
    setNotifications(loadedNotifications);
  }, [loadFromLocalStorage]);

  return {
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
    unreadCount,
    isLoading // Export isLoading for completeness
  };
}