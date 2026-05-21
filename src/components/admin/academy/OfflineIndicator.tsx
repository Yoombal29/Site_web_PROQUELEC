/**
 * Composant indicateur de mode hors-ligne
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { cn } from '@/lib/utils';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isServiceWorkerActive, lastSyncTime, syncCache } = useOfflineMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isOnline ? 'secondary' : 'destructive'}
          className={cn(
            'gap-1.5 cursor-pointer transition-colors',
            isOnline ? 'hover:bg-secondary/80' : 'hover:bg-destructive/80'
          )}
          onClick={() => isOnline && syncCache()}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">
            {isOnline ? 'Connexion active' : 'Mode hors ligne'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isOnline
              ? 'L\'application fonctionne normalement.'
              : 'Les fonctionnalités principales restent disponibles grâce au cache local.'}
          </p>
          {isServiceWorkerActive && (
            <p className="text-xs text-muted-foreground">
              ✓ Service Worker actif
            </p>
          )}
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">
              Dernière sync: {lastSyncTime.toLocaleTimeString('fr-FR')}
            </p>
          )}
          {isOnline && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs"
              onClick={syncCache}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Forcer la synchronisation
            </Button>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
