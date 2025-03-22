import pkg from "./package.json" with { type: "json" };
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default [
  {
    input: "src/index.ts",
    output: [{ file: pkg.module, format: "es" }],
    plugins: [json(), typescript()],
  },
];
