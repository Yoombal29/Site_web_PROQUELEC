import React from 'react';
import type { AwarenessState } from '@/engine/collaboration';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/** Map connection status to display info */
const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  connected: {
    label: 'Connecté',
    icon: <Wifi className="w-3 h-3" />,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  connecting: {
    label: 'Connexion…',
    icon: <RefreshCw className="w-3 h-3 animate-spin" />,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  disconnected: {
    label: 'Déconnecté',
    icon: <WifiOff className="w-3 h-3" />,
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  error: {
    label: 'Erreur',
    icon: <WifiOff className="w-3 h-3" />,
    className: 'bg-rose-100 text-rose-700 border-rose-200',
  },
};

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  onlineCount: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusProps> = ({
  status,
  onlineCount,
  onConnect,
  onDisconnect,
}) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.className}`}
        title={status === 'connected' ? `Cliquez pour déconnecter` : 'Cliquez pour connecter'}
      >
        {cfg.icon}
        {cfg.label}
        {status === 'connected' && onlineCount > 1 && (
          <span className="ml-0.5 font-bold">({onlineCount})</span>
        )}
      </span>

      {status === 'connected' ? (
        onDisconnect && (
          <button
            onClick={onDisconnect}
            className="text-[10px] text-slate-400 hover:text-rose-500 underline"
          >
            Déconnexion
          </button>
        )
      ) : (
        onConnect && status !== 'connecting' && (
          <button
            onClick={onConnect}
            className="text-[10px] text-blue-500 hover:text-blue-700 underline"
          >
            Connecter
          </button>
        )
      )}
    </div>
  );
};
