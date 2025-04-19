import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server:{
    proxy: {
      "/api" :{
        target: "https://twitterclone-backend-4hsh.onrender.com",//for deployment otherwise https://twitter-clone:port
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist"
  }
});
