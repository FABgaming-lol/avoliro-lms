import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Hybrid config that works even under older Node on Vercel
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false
  }
});