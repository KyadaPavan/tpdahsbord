import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: "/",
    define: {
      'process.env': JSON.stringify(env),
    },
    server: {
      host: true,
      port: 5173
    }
  };
});
