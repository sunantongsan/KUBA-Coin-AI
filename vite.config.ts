import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use type assertion to avoid TS error about 'cwd' not existing on 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Only define the specific key we need. 
      // General process polyfill is handled in index.html to avoid conflicts.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});