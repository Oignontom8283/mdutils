// Builds dist/mdutils.browser.js: the whole library in one file for a <script> tag (global `mdutils`).
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "iife",
  globalName: "mdutils",
  minify: true,
  target: "es2020",
  outfile: "dist/mdutils.browser.js",
});
