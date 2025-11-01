import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    cors: true,
    proxy: {
      // Optionally, you can add a proxy if needed - not required with the CORS changes
      // '/api': {
      //   target: 'http://localhost:5001',
      //   changeOrigin: true,
      //   secure: false
      // }
    },
  },
});
