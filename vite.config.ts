import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(async ({ mode }) => {
  const defaultPort = Number(process.env.VITE_PORT) || 5175;
  const apiTarget = process.env.VITE_API_URL || 'http://127.0.0.1:3010';

  return {
    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    server: {
      port: defaultPort,
      host: true,
      strictPort: false,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true, secure: false },
        '/uploads': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    optimizeDeps: {
      include: [
        'lodash.clonedeep',
        'immer',
        'dompurify',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
      ],
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('@tiptap') || id.includes('tiptap')) return 'tiptap';
            if (id.includes('katex')) return 'katex';
            if (id.includes('html2canvas')) return 'html2canvas';
            if (id.includes('docx')) return 'docx';
            if (id.includes('dompurify')) return 'dompurify';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('framer-motion')) return 'framer';
            if (id.includes('sonner')) return 'sonner';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('react-router-dom')) return 'router';
            
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('@radix-ui')) return 'react';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('lodash')) return 'lodash';
            if (id.includes('d3-')) return 'd3';
            if (id.includes('yjs')) return 'vendor';
            if (id.includes('prosemirror') || id.includes('remirror')) return 'editor';
            return 'vendor';
          },
        },
      },
    },
  };
});
