import { defineConfig } from "tsdown";

const banner = ["/*!", " * Copyright (c) Peculiar Ventures, LLC", " */"].join("\n");

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  // The library runs in both Node.js and browsers.
  platform: "neutral",
  dts: true,
  clean: true,
  // Keep .js/.mjs/.d.ts output names (package.json is "type": "commonjs")
  // instead of tsdown's default of fixed .cjs/.mjs extensions.
  fixedExtension: false,
  deps: {
    neverBundle: true,
  },
  exports: {
    legacy: true,
  },
  banner,
  outDir: "build",
  tsconfig: "tsconfig.json",
  attw: {
    level: "error",
    profile: "strict",
  },
});
