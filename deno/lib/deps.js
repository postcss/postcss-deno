export {
  fileURLToPath,
  pathToFileURL,
} from "https://deno.land/std@0.159.0/node/url.ts";

export {
  existsSync,
  readFileSync,
} from "https://deno.land/std@0.159.0/node/fs.ts";

export {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "https://deno.land/std@0.159.0/node/path.ts";

export { Buffer } from "https://deno.land/std@0.159.0/node/buffer.ts";
export { nanoid } from "https://deno.land/x/nanoid@v3.0.0/nanoid.ts";

import {
  bold,
  cyan,
  getColorEnabled,
  gray,
  green,
  magenta,
  red,
  yellow,
} from "https://deno.land/std@0.159.0/fmt/colors.ts";

export const pico = {
  isColorSupported: getColorEnabled(),
  createColors: () => ({ bold, red, gray }),
  cyan,
  gray,
  green,
  yellow,
  magenta,
};
