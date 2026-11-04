import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "assets/tunnel", emptyOutDir: false,
    lib: { entry: "src/main.tsx", name: "PortfolioTunnel", formats: ["iife"], fileName: () => "hero.js" }
  }
});
