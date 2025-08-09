import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 8080,
  },
  define: {
    // 'import.meta.env.VITE_API_URL': JSON.stringify(  'https://docker-backend-3pzw.onrender.com'),
    "import.meta.env.VITE_API_URL": JSON.stringify("http://localhost:5000"),
  },
});
