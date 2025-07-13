import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ✅ Import for aliasing

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Automatically opens in browser
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ Use "@/..." instead of relative paths
    },
  },
  base: '/', // ✅ Ensures correct routing in dev/prod
});
