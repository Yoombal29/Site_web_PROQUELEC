import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { initializeRubriques } from '@/bootstrap/initializeRubriques';
import { registerServiceWorker } from '@/sw-register';

// Initialize rubriques system at startup
initializeRubriques();

// Register PWA Service Worker
registerServiceWorker();

// Global Error Catching for robustness
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[Global Error]", { message, source, lineno, colno, error });
  // Empêcher les boucles infinies de crash au démarrage
  return false;
};

window.onunhandledrejection = (event) => {
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
