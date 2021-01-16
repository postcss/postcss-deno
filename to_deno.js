import { convert } from "https://deno.land/x/nodedeno@v0.2.5/mod.js";

//Convert the code
await convert({
  src: "postcss",
  input: ["lib"],
  output: "deno",
  transpile: false,
  modules: {
    "": "mod.js",
    "deps.js": "lib/deps.ts",
  },
  copy: {
    "deps.ts": "lib/deps.ts",
    "test": "test",
    "postcss/README.md": "README.md",
    "postcss/CHANGELOG.md": "CHANGELOG.md",
    "postcss/LICENSE": "LICENSE",
  },
  beforeConvert(src, { replaceAll, rename }) {
    //Remove colorette dependency
    replaceAll((code) =>
      code.replace(", options: colorette", "")
        .replace("if (color == null) color = colorette.enabled", "")
        .replace(", options as colorette", "")
    );

    //Rename lib/postcss.mjs => mod.js
    rename(
      "lib/postcss.mjs",
      "mod.js",
      (code) => code.replace(`'./postcss.js'`, `"./lib/postcss.js"`),
    );
  },
  afterConvert(src, { replaceAll }) {
    replaceAll((code) =>
      code.replaceAll("Deno.env.NODE_ENV", "Deno.env.DENO_ENV")
    );
  },
});
