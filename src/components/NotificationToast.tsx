
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface NotificationToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
};

export function NotificationToast({ toast, onRemove }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    setIsVisible(true);
    
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        "transition-all duration-300 transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        toastStyles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.description && (
          <p className="text-sm opacity-80 mt-1">{toast.description}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-black/10"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
