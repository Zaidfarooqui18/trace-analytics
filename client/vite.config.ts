import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  // Use VITE_BASE_PATH if provided.
  // In development mode (serve), default to '/' for standard localhost:5173 access.
  // In production build, default to '/trace-analytics/' unless running on Vercel.
  const base =
    process.env.VITE_BASE_PATH ||
    (command === 'serve' ? '/' : process.env.VERCEL ? '/' : '/trace-analytics/');

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/tracker.js': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});

