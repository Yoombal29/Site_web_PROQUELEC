import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { initializeRubriques } from '@/bootstrap/initializeRubriques';
import { registerServiceWorker } from '@/sw-register';
import { initializeBuilderEngine } from '@/engine/events/init';

// Initialize rubriques system at startup
initializeRubriques();

// Initialize Builder Engine (CommandBus + handlers)
initializeBuilderEngine();

// Register PWA Service Worker
registerServiceWorker();

const isMediaPlaybackAbort = (reason: unknown) => {
  if (!reason || typeof reason !== 'object') return false;

  const errorLike = reason as { name?: unknown; message?: unknown };
  const name = typeof errorLike.name === 'string' ? errorLike.name : '';
  const message = typeof errorLike.message === 'string' ? errorLike.message : '';

  return (
    name === 'AbortError' &&
    /play\(\) request was interrupted|call to pause\(\)|new load request/i.test(message)
  );
};

// Global Error Catching for robustness
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[Global Error]", { message, source, lineno, colno, error });
  // Empêcher les boucles infinies de crash au démarrage
  return false;
};

window.onunhandledrejection = (event) => {
  if (isMediaPlaybackAbort(event.reason)) {
    event.preventDefault();
    return;
  }

  console.error("[Unhandled Promise Rejection]", event.reason);
};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </HelmetProvider>
);
