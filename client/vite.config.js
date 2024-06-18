import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const BUILD_ENV = process.env.REACT_APP_BUILD_ENV || "development";
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist", // Ensure this is set to 'dist' should be default
  },

  plugins: [react()],
});
