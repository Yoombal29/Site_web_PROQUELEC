
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
      port: fallbackPort,
      host: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
