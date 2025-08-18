import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['bc35-5-178-148-117.ngrok-free.app'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const after = id.split('node_modules/')[1];
            const parts = after.split('/');
            const scopeOrName = parts[0];
            if (scopeOrName.startsWith('@')) {
              const scopedName = `${scopeOrName}-${parts[1]}`;
              return scopedName.replace('@', '');
            }
            return scopeOrName;
          }
        },
      },
    },
    chunkSizeWarningLimit: 1100,
  },
});
