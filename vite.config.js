import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis", // Define `global` for compatibility with libraries like `simple-peer`
    "process.env": {
      nextTick: (cb) => setTimeout(cb, 0),
    },
  },
  resolve: {
    alias: {
      buffer: "buffer", // Alias to use the `buffer` polyfill
      util: "rollup-plugin-node-polyfills/polyfills/util", // Use a polyfill for util
    },
  },
  optimizeDeps: {
    include: ["util"], // Force Vite to include this package
  },
});
