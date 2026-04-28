import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/server.ts", "./instrument.server.ts"],
  format: ["esm"],
  clean: true,
  outDir: "dist",
  target: "es2023",
  minify: true,
});
