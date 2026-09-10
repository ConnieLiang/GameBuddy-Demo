import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/GameBuddy-Demo/",
  optimizeDeps: {
    entries: ["index.html"],
  },
  plugins: [react()],
});
