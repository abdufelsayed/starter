import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
});
