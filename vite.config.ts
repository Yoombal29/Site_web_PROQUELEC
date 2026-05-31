
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import getPort from "get-port";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const fallbackPort = await getPort({ port: 8080 });
  return {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    server: {
      port: Number(process.env.VITE_PORT) || 5173,
      host: true,
      strictPort: true,
      // Redirige toutes les routes inconnues vers index.html (React Router SPA)
      historyApiFallback: true,
      hmr: {
        clientPort: Number(process.env.VITE_PORT) || 5173,
        port: Number(process.env.VITE_PORT) || 5173,
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://127.0.0.1:3010',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: process.env.VITE_API_URL || 'http://127.0.0.1:3010',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        'lodash.clonedeep',
        'immer',
        'dompurify',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities'
      ],
      force: true
    },
    build: {
      // Keep reasonable warning threshold while we split heavy deps into chunks
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('@tiptap') || id.includes('tiptap')) return 'tiptap';
              if (id.includes('katex')) return 'katex';
              if (id.includes('html2canvas')) return 'html2canvas';
              if (id.includes('docx')) return 'docx';
              if (id.includes('dompurify')) return 'dompurify';
              if (id.includes('node_modules/lucide-react')) return 'lucide-react';
              if (id.includes('node_modules/framer-motion')) return 'framer-motion';
              if (id.includes('node_modules/sonner')) return 'sonner';
              // yjs dans vendor pour eviter les erreurs d'initialisation (TDZ)
              if (id.includes('node_modules/yjs')) return 'vendor';
              if (id.includes('node_modules/react-router-dom')) return 'router';
              if (id.includes('node_modules/@tanstack')) return 'vendor';

              // Radix UI must be in vendor chunk with React to avoid forwardRef issues
              if (id.includes('node_modules/@radix-ui')) return 'vendor';
              // Fallback for react and react-dom specifically to avoid undefined forwardRef
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor';

              return 'vendor';
            }

            // local heavy libs / lib entrypoints
            if (id.includes('/src/lib/ai-master')) return 'ai-master';
          },
        },
      },
    },
  };
});
