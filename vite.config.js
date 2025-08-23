import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  proxy: {
    "/auth": "http://localhost:3000", // ⟵ Ändra till din backend
  },
});
