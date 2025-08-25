import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
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
      // 🔧 __NYTT: proxy för meddelanden__
      "/messages": {
        target: "https://chatify-api.up.railway.app", // ⟵ API:ts basdomän
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
