import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.VITE_PORT) || 3001,
    proxy: {
      '/api': {
        // Use backend service name for Docker, fallback to localhost for local development
        target: process.env.VITE_API_URL || 'http://backend:3000',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        rewrite: (path) => path, // Keep /api prefix
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔴 Proxy error:', err.message);
            console.log('📡 Trying to connect to:', options.target);
            
            // Send a proper error response instead of hanging
            if (!res.headersSent) {
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({
                error: 'Backend service unavailable',
                message: 'Could not connect to backend server',
                target: options.target
              }));
            }
          });
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxy request:', req.method, req.url, '→', options.target + req.url);
          });
        }
      }
    },
    // SPA fallback - serve index.html for any route not found
    historyApiFallback: true
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production'
  },
  // Ensure environment variables are available
  define: {
    __DEV__: process.env.NODE_ENV !== 'production'
  }
})
