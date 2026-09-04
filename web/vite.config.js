import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server runs inside a container; bind all interfaces so the host can reach it.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
});
