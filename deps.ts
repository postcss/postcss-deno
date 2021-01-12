// @deno-types="https://raw.githubusercontent.com/oscarotero/deno-source-map/master/source-map.d.ts"
export * as mozilla from "https://raw.githubusercontent.com/oscarotero/deno-source-map/master/mod.js";

export type { SourceMapConsumer, SourceMapGenerator, RawSourceMap } from "https://raw.githubusercontent.com/oscarotero/deno-source-map/master/source-map.d.ts";

export {
  fileURLToPath,
  pathToFileURL,
} from "https://deno.land/std@0.77.0/node/url.ts";
export {
  existsSync,
  readFileSync,
} from "https://deno.land/std@0.77.0/node/fs.ts";
export {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "https://deno.land/std@0.77.0/node/path.ts";
export { default as Buffer } from "https://deno.land/std@0.77.0/node/buffer.ts";
export { nanoid } from "https://deno.land/x/nanoid@v3.0.0/nanoid.ts";
// export { default as mozilla } from "https://cdn.skypack.dev/source-map";


export {
  bold,
  cyan,
  gray,
  green,
  magenta,
  red,
  yellow,
} from "https://deno.land/std@0.77.0/fmt/colors.ts";
