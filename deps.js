import {
  fileURLToPath,
  pathToFileURL,
} from "https://deno.land/std@0.71.0/node/url.ts";
import {
  existsSync,
  readFileSync,
} from "https://deno.land/std@0.71.0/node/fs.ts";
import {
  resolve,
  isAbsolute,
  dirname,
  basename,
  relative,
  sep,
  join,
} from "https://deno.land/std@0.71.0/node/path.ts";
import Buffer from "https://deno.land/std@0.71.0/node/buffer.ts";
import { nanoid } from "https://dev.jspm.io/nanoid/non-secure";
import * as mozilla from "https://dev.jspm.io/source-map";
import { cyan, gray, green, yellow, magenta, red, bold } from "https://deno.land/std@0.71.0/fmt/colors.ts";
import lineColumn from "https://dev.jspm.io/line-column";

const { sourceMapConsumer, SourceMapGenerator, RawSourceMap } = mozilla;
export {
  fileURLToPath,
  pathToFileURL,
  existsSync,
  readFileSync,
  resolve,
  isAbsolute,
  dirname,
  basename,
  relative,
  sep,
  join,
  cyan,
  gray,
  green,
  yellow,
  magenta,
  red,
  bold,
  lineColumn,
  mozilla,
  nanoid,
  Buffer,
  sourceMapConsumer, SourceMapGenerator, RawSourceMap
};
