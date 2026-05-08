import { defineConfig } from "tsdown";

const externalNonWorkspacePackage = (id: string) =>
  !id.startsWith(".") && !id.startsWith("/") && !id.startsWith("@starter/");

export default defineConfig({
  entry: ["./instrument.server.ts"],
  format: ["esm"],
  clean: false,
  deps: {
    alwaysBundle: [/^@starter\//],
    neverBundle: externalNonWorkspacePackage,
  },
  outDir: ".output/server",
  platform: "node",
  target: "es2023",
});
