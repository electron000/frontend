import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the proxy configuration that will fix the connection error.
    // Any request to '/api' will be forwarded to your backend server.
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Your backend server address
        changeOrigin: true,              // Recommended for development
        secure: false,                   // Can be false for http targets
      },
    },
  },
})
