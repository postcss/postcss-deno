import { convert } from "https://deno.land/x/nodedeno@v0.2.8/mod.js";

// Convert the code
await convert({
  src: "postcss",
  input: ["lib"],
  output: "deno",
  transpile: false,
  modules: {
    "": "mod.js",
    "deps.js": "lib/deps.js",
    "source-map-js": "lib/source_map.ts",
  },
  copy: {
    "source_map.ts": "lib/source_map.ts",
    "deps.js": "lib/deps.js",
    "test": "test",
    "postcss/README.md": "README.md",
    "postcss/CHANGELOG.md": "CHANGELOG.md",
    "postcss/LICENSE": "LICENSE",
  },
  beforeConvert(_src, { replaceAll, rename }) {
    // Rename lib/postcss.mjs => mod.js
    rename(
      "lib/postcss.mjs",
      "mod.js",
      (code) => code.replace(`'./postcss.js'`, `"./lib/postcss.js"`),
    );
  },
  afterConvert(_src, { replaceAll }) {
    replaceAll((code) =>
      code.replaceAll('Deno.env.get("NODE_ENV")', 'Deno.env.get("DENO_ENV")')
    );
  },
});
