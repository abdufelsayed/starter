import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import type { PluginOption } from "vite";
import { webEnv } from "@starter/env/web";

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    nitro({
      preset: "bun",
      apiBaseURL: "/api",
      routeRules: {
        "/api/**": {
          proxy: `${webEnv.VITE_SERVER_URL}/api/**`,
        },
        "/rpc/**": {
          proxy: `${webEnv.VITE_SERVER_URL}/rpc/**`,
        },
      },
    }) as PluginOption,
  ],
});

export default config;
