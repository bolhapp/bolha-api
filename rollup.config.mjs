import { defineConfig } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

config();

const __filename = fileURLToPath(import.meta.url);

export default defineConfig({
  input: "src/app.ts", // The entry point of your application
  output: {
    file: "dist/app.js", // ES Module output
    format: "esm",
    sourcemap: true,
  },
  cache: false,
  plugins: [
    commonjs(), // Converts CommonJS modules to ES6
    resolve(), // compiles node modules
    json(), // This plugin allows Rollup to import JSON files
    typescript(), // Compiles TypeScript
    sourcemaps(), // Enable source maps
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
});
