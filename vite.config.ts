// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Development Server
    server: {
      port: 5173,
      strictPort: true,
      host: true,

      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[VITE-PROXY REQ]', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('[VITE-PROXY RES]', proxyRes.statusCode, req.url);
            });
            proxy.on('error', (err, req) => {
              console.error('[VITE-PROXY ERROR]', err.message, req?.url);
            });
          },
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },

      hmr: { overlay: true },
    },

    // Preview server (for `npm run preview`)
    preview: {
      port: 4173,
      strictPort: true,
      host: true,
    },

    // Build Configuration
    build: {
      outDir: 'dist',
      emptyOutDir: true,                 // Clears old files on every build
      sourcemap: !isProduction,

      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },

    css: {
      devSourcemap: true,
    },
  };
});
