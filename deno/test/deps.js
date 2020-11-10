export * from "../lib/deps.js";
export * from "https://deno.land/std@0.77.0/testing/asserts.ts";
export { default as Concat } from "https://dev.jspm.io/concat-with-sourcemaps/index.js";
export { default as stripAnsi } from "https://dev.jspm.io/strip-ansi/index.js";
import { ensureDirSync } from "https://deno.land/std@0.77.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.77.0/path/mod.ts";
import { mozilla } from "../lib/deps.js";
export const SourceMapConsumer = mozilla.SourceMapConsumer;

export function removeSync(path) {
  try {
    Deno.removeSync(path, { recursive: true });
  } catch (err) {}
}

export function outputFileSync(file, data) {
  ensureDirSync(dirname(file));
  Deno.writeTextFileSync(file, data);
}

export function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms, value);
  });
}
