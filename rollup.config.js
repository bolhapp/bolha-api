import { config } from "dotenv";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

import { defineConfig } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import sourcemaps from "rollup-plugin-sourcemaps";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";

config();

const __filename = fileURLToPath(import.meta.url);

export default defineConfig({
  input: "src/app.ts", // The entry point of your application
  output: {
    file: "dist/app.js", // ES Module output
    format: "cjs",
    sourcemap: true,
  },
  cache: false,
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      extensions: [".js", ".ts"],
    }),
    commonjs(),
    typescript({
      tsconfig: resolve(__dirname, "tsconfig.json"), // Ensure this points to your tsconfig file
      sourceMap: true,
      inlineSources: true,
    }),
    sourcemaps(),
    json(), // This plugin allows Rollup to import JSON files, such as the langs
    replace(
      // includes envs in the build. Goes through all of them and only adds the ones that start with ROLLUP_
      Object.entries(process.env).reduce(
        (env, [variable, value]) => {
          if (variable.startsWith("ROLLUP_")) {
            env[`process.env.${variable.split("ROLLUP_")[1]}`] = JSON.stringify(value);
          }

          return env;
        },
        {
          preventAssignment: true,
          __dirname: JSON.stringify(dirname(__filename)),
          __filename: JSON.stringify(__filename),
        },
        {},
      ),
    ),
  ],
  external: [
    "mock-aws-s3",
    "aws-sdk",
    "nock",
    "babel",
    "koa",
    "@babel/plugin-transform-modules-commonjs", // Add external dependencies here if needed
  ],
});
