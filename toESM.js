import { copy, emptyDir } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const src = "postcss/lib";
const dest = "deno";
const deps = new Set(
  [
    "fs",
    "path",
    "url",
    "source-map",
    "colorette",
    "line-column",
    "mozilla",
    "nanoid/non-secure",
  ],
);

export * as fs from "https://deno.land/std@0.71.0/node/fs.ts";
export * as path from "https://deno.land/std@0.71.0/node/path.ts";
export * as url from "https://deno.land/std@0.71.0/node/url.ts";
export * as sourcemap from "https://dev.jspm.io/source-map";
export * as colorette from "https://dev.jspm.io/colorette";

await emptyDir(dest);
Deno.remove(dest);
await copy(src, dest);
await copy("deps.js", join(dest, "deps.js"));
await convertDirectory(dest);

async function convertDirectory(src) {
  for await (const entry of Deno.readDir(src)) {
    const path = join(src, entry.name);

    if (entry.name.endsWith("d.ts") || entry.name.endsWith(".mjs")) {
      await Deno.remove(path);
      continue;
    }

    if (entry.isDirectory) {
      await convertDirectory(path);
      continue;
    }

    const code = await Deno.readTextFile(path);

    await Deno.writeTextFile(path, convert(code));
  }
}

function convert(code) {
  code = code
    //Remove "use strict" because in ES5 modules is always strict
    .replace("'use strict'", "")
    //Replace exports
    .replace(/(^|\n)module.exports\s*=\s*\S/g, (str) => {
      const prefix = extractPrefix(str);
      const postfix = str.slice(-1);

      if (postfix === "{") {
        return `${prefix}export ${postfix}`;
      }

      return `${prefix}export default ${postfix}`;
    })
    //Replace imports
    .replace(
      /(^|\n)(let|const|var)\s+({[^}]+}|\S+)\s*=\s*require\([^)]+\)/g,
      (str) => {
        const [, prefix, , name] = str.match(
          /(^|\n)(let\s+|const\s+|var\s+)(\S+|{[^}]+})\s*=/m,
        );

        let path = str.match(/require\(['"]([^)]+)['"]\)/)[1];

        if (deps.has(path)) {
          if (name.startsWith("{")) {
            return `${prefix}import ${name} from "./deps.js";`;
          }

          return `${prefix}import { ${name} } from "./deps.js";`;
        }

        if (!path.endsWith(".js")) {
          path = `${path}.js`;
        }

        return `${prefix}import ${name} from "${path}";`;
      },
    )
    .trimStart();
    
  //Replace node global objects by Deno equivalents
  if (code.includes("Buffer.")) {
    code = `import Buffer from "./deps.js";\n${code}`;
  }
  code = code.replace(/process\.env\./g, "Deno.env.");

  return code;
}

function extractPrefix(str) {
  if (str[0] === "\n") {
    return "\n";
  }

  return "";
}
