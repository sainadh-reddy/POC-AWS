import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // ── Auth Service (8081) ────────────────────────────────────────────────
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // ── Ticket Service (8082) ─────────────────────────────────────────────
      '/api/v1/tickets': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      // ── Comment Service (8084) ────────────────────────────────────────────
      '/api/v1/comments': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
      },
      // ── Attachment Service (8083) ─────────────────────────────────────────
      '/api/v1/attachments': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },
      // ── Dashboard Service (8085) ──────────────────────────────────────────
      '/api/v1/dashboard': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      },
      // ── Spring Cloud Gateway Fallback (8080) ──────────────────────────────
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // ── Actuator health check ─────────────────────────────────────────────
      '/actuator': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
