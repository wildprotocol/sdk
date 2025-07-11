import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    outDir: "dist",
    target: "esnext",
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    outExtension({ format }) {
      return { js: format === "esm" ? ".mjs" : ".cjs" };
    },
    external: ["react", "react-dom", "lightweight-charts"],
  },
  {
    entry: ["src/react/index.ts"],
    format: ["esm"],
    outDir: "dist/react",
    target: "esnext",
    splitting: false,
    sourcemap: true,
    dts: true,
    outExtension() {
      return { js: ".mjs" };
    },
    external: ["react", "react-dom", "lightweight-charts"],
  },
]);
