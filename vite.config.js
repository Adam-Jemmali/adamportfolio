import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

import {resolve,dirname} from "path";
import {fileURLToPath} from "url";





const root = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "#components": resolve(root, "src/components"),

      "#constants": resolve(root, "src/constants"),
      "#store": resolve(root, "src/store"),
      "#hoc": resolve(root, "src/hoc"),
      "#window": resolve(root, "src/window"),
      "#game": resolve(root, "src/game"),
      "#utils": resolve(root, "src/utils"),

    }
  },
  build: {
    rollupOptions: {
      // Second entry point: madajbuilds is its own standalone React app,
      // built and served at /madajbuilds/ alongside the main OS site.
      input: {
        main: resolve(root, "index.html"),
        madajbuilds: resolve(root, "madajbuilds/index.html"),
      },
    },
  },
})
