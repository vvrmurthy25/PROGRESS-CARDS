
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env is available as a global object
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || "")
    },
    // Also keep the direct string replacement as a fallback
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
