// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load .env files safely
  const env = loadEnv(mode, process.cwd(), '');

  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    // Expose env vars to client (VITE_ prefix is automatic, but explicit is clearer)
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      // Add others if needed, e.g.:
      // 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || '/api'),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // ────────────────────────────────────────────────
    // DEV SERVER + PROXY (critical for auth & cookies)
    // ────────────────────────────────────────────────
    server: {
      port: 5173,
      strictPort: true,
      host: true,                 // Allows access from network (mobile testing, etc.)

      proxy: {
        // Proxy /api → backend (http://localhost:3000)
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,

          // Ensures /api/users → /api/users (not rewritten to /users)
          rewrite: (path) => path, // ← important: keep /api prefix

          // Debug logs — extremely useful right now
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[VITE-PROXY REQ]', req.method, req.url);
            });

            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('[VITE-PROXY RES]', proxyRes.statusCode, req.url);
            });

            proxy.on('error', (err, req) => {
              console.error('[VITE-PROXY ERROR]', err.message, req?.url || '(unknown)');
            });
          },
        },

        // Also proxy /uploads so images work in dev without CORS issues
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },

      // HMR
      hmr: {
        overlay: true,
      },

      // Better hot reload behavior in some cases
      watch: {
        usePolling: process.env.VITE_POLLING === 'true', // optional: set in .env if needed
      },
    },

    // ────────────────────────────────────────────────
    // VITE PREVIEW (production-like local server)
    // ────────────────────────────────────────────────
    preview: {
      port: 4173,                 // Standard Vite preview port
      strictPort: true,
      host: true,
    },

    // ────────────────────────────────────────────────
    // BUILD CONFIG
    // ────────────────────────────────────────────────
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,

      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // Add more if you have heavy deps (e.g. lucide-react)
          },
        },
      },

      chunkSizeWarningLimit: 1200,
      reportCompressedSize: true,
    },

    // Better Tailwind dev experience
    css: {
      devSourcemap: true,
    },
  };
});