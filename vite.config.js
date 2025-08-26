import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/csrf": {
        target: "https://chatify-api.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
      "/auth": {
        target: "https://chatify-api.up.railway.app",
        changeOrigin: true,
        secure: true,
      },

      "/conversations": {
        target: "https://chatify-api.up.railway.app",
        changeOrigin: true,
        secure: true,
      },

      "/messages": {
        target: "https://chatify-api.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
