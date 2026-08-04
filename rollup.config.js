import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const banner = ["/*!", " Copyright (c) Peculiar Ventures, LLC", "*/", ""].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies || {});

export default [
  {
    input,
    plugins: [
      typescript({
        check: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            target: "ES6",
            module: "ES2015",
            removeComments: true,
          },
        },
      }),
    ],
    external: [...external],
    output: [
      {
        banner,
        file: pkg.main,
        format: "cjs",
        esModule: true,
      },
      {
        banner,
        file: pkg.module,
        format: "es",
      },
    ],
  },
  {
    input,
    external: [...external],
    plugins: [
      dts({
        tsconfig: path.resolve(__dirname, "./tsconfig.json"),
      }),
    ],
    output: [
      {
        banner,
        file: pkg.types,
      },
    ],
  },
];
