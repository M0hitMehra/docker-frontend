import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
// docker rm -f express_api
// docker build -t docker-server .
// docker run --rm  --name express_api -p 5000:3000 docker-server
