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
  };
});
