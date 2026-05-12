// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],

    // Base path - important for Netlify/Render
    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: 'https://backendserver-k3hd.onrender.com',
          changeOrigin: true,
          secure: true,
        },
        '/uploads': {
          target: 'https://backendserver-k3hd.onrender.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },

    preview: {
      port: 4173,
      strictPort: true,
      host: true,
    },

    build: {
      outDir: 'dist',
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
