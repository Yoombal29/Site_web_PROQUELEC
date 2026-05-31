/**
 * Demo mode banner component.
 * Shows a prominent warning when capabilities are in mock/unavailable mode.
 */
import React, { useEffect } from 'react';
import { useRuntimeStore } from './store';
import { AlertTriangle, WifiOff, ServerCrash, FlaskConical } from 'lucide-react';

const WARNINGS_TO_SHOW = [
  'cossuel',
  'email',
  'payments',
  'electronicSignature',
  'aiGeneration',
  'analytics',
  'exports',
];

export const RuntimeBanner: React.FC = () => {
  const loaded = useRuntimeStore((s) => s.loaded);
  const capabilities = useRuntimeStore((s) => s.capabilities);
  const mockMode = useRuntimeStore((s) => s.mockMode);
  const load = useRuntimeStore((s) => s.load);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  if (!loaded) return null;
  if (!mockMode) return null;

  const warnings = WARNINGS_TO_SHOW
    .map((key) => capabilities[key])
    .filter((c): c is NonNullable<typeof c> => c != null && c.mode === 'mock');

  if (warnings.length === 0) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5">
      <div className="flex items-center gap-2 text-amber-800 text-xs max-w-screen-xl mx-auto">
        <FlaskConical className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold shrink-0">⚠️ MODE DÉMO</span>
        <span className="text-amber-600 truncate">
          {warnings.length} fonctionnalité{warnings.length > 1 ? 's' : ''} en mode simulé
        </span>
        <div className="hidden sm:flex gap-3 ml-auto shrink-0">
          {warnings.slice(0, 4).map((w) => (
            <span key={w.warning} className="text-[10px] text-amber-600 truncate max-w-[160px]" title={w.warning ?? ''}>
              • {w.warning?.replace(/^.*— /, '').replace(/^.*: /, '').slice(0, 40)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * CapabilityGuard — wraps children and shows an unavailable message
 * when a required capability is not available.
 */
export const CapabilityGuard: React.FC<{
  capability: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ capability, fallback, children }) => {
  const cap = useRuntimeStore((s) => s.capabilities[capability]);

  if (!cap || !cap.available) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-slate-400">
        <ServerCrash className="w-8 h-8" />
        <p className="text-sm font-medium">Fonctionnalité non disponible</p>
        {cap?.warning && (
          <p className="text-xs text-slate-400 text-center max-w-md">{cap.warning}</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * MockBadge — small badge indicating a feature is in mock mode.
 */
export const MockBadge: React.FC<{ capability: string }> = ({ capability }) => {
  const cap = useRuntimeStore((s) => s.capabilities[capability]);

  if (!cap || cap.mode !== 'mock') return null;

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <FlaskConical className="w-2.5 h-2.5" />
      MOCK
    </span>
  );
};
