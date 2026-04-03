import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('node_modules/@radix-ui')) return 'vendor-ui';
          if (id.includes('node_modules/lucide-react')) return 'vendor-ui';
          if (id.includes('node_modules/class-variance-authority')) return 'vendor-ui';
          if (id.includes('node_modules/@tanstack/react-query')) return 'vendor-query';
          if (id.includes('node_modules/mapbox-gl')) return 'vendor-mapbox';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'vendor-charts';
          if (id.includes('src/data/bottleComparisonData') || id.includes('src/data/bottleWaterData')) return 'data-bottles';
          if (id.includes('src/i18n/translations')) return 'data-i18n';
        },
      },
    },
  },
}));
