// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/TradingViewChart.tsx"],
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  outDir: "dist",
  target: "esnext",
  external: ["react", "react-dom"],
});
