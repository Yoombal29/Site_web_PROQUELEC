
import { createPortal } from 'react-dom';
import { NotificationToast } from './NotificationToast';
import { useNotificationToast } from '@/hooks/useNotificationToast';

export function NotificationContainer() {
  const { toasts, removeToast } = useNotificationToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  );
}
