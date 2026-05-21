
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
  };
});
