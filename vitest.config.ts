import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.{test,spec}.ts"],
    // Converter fixtures use UTC; keep their snapshots independent of the host.
    env: { TZ: "UTC" },
  },
})
