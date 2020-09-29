export * from "../lib/deps.js";
import { mozilla } from "../lib/deps.js";
import Concat from "https://dev.jspm.io/concat-with-sourcemaps/index.js";
import stripAnsi from "https://dev.jspm.io/strip-ansi/index.js";
import { ensureDirSync } from "https://deno.land/std@0.71.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.71.0/path/mod.ts";

export const SourceMapConsumer = mozilla.SourceMapConsumer;
export {Concat, stripAnsi, removeSync, outputFileSync, delay};

function removeSync(path) {
  try {
    Deno.removeSync(path, { recursive: true });
  } catch (err) {}
}
function outputFileSync(file, data) {
  ensureDirSync(dirname(file));
  Deno.writeTextFileSync(file, data);
}
function delay(ms, value) {
  return new Promise(resolve => {
    setTimeout(resolve, ms, value)
  })
}