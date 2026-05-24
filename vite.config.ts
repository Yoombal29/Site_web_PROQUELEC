
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
              if (id.includes('elm') || id.includes('elk') || id.includes('flowchart')) return 'flowchart-elk';
              if (id.includes('@tiptap') || id.includes('tiptap')) return 'tiptap';
              if (id.includes('katex')) return 'katex';
              if (id.includes('html2canvas')) return 'html2canvas';
              if (id.includes('docx')) return 'docx';
              if (id.includes('dompurify')) return 'dompurify';
              if (id.includes('node_modules/lucide-react')) return 'lucide-react';
              if (id.includes('node_modules/framer-motion')) return 'framer-motion';
              if (id.includes('node_modules/sonner')) return 'sonner';
              if (id.includes('node_modules/yjs')) return 'yjs';
              if (id.includes('node_modules/react-router-dom')) return 'router';
              if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/@radix')) return 'radix-ui';
              if (id.includes('node_modules/@tanstack')) return 'tanstack';
              return 'vendor';
            }

            // local heavy libs / lib entrypoints
            if (id.includes('/src/lib/ai-master')) return 'ai-master';
            if (id.includes('/src/lib/elk') || id.includes('flowchart-elk')) return 'flowchart-elk';
          },
        },
      },
    },
  };
});
