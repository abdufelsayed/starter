import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import type { PluginOption } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    external: ["tslib"],
  },
  build: {
    rollupOptions: {
      external: ["tslib"],
    },
  },
  server: {
    port: 4000,
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    react(),
    nitro({ preset: "node_server" }) as PluginOption,
  ],
});
