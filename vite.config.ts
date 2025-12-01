import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use type assertion to avoid TS error about 'cwd' not existing on 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Define API_KEY specifically. 
      // We rely on window.process in index.html for the global object to avoid replacement issues.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      rollupOptions: {
        // Tell Vite NOT to bundle this, as it will be loaded via CDN in index.html
        external: ['@google/genai']
      }
    }
  };
});