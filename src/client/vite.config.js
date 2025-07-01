import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true, // Listen on all network interfaces
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      // Ensure PWA files are copied to dist
      external: [],
      output: {
        // Ensure service worker and manifest are in the root
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sw.js') {
            return 'sw.js';
          }
          if (assetInfo.name === 'manifest.json') {
            return 'manifest.json';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // Copy public directory files to dist
  publicDir: 'public',
  // Define global constants
  define: {
    __PWA_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __PWA_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  }
}); 