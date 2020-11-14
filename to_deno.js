import { convert } from "https://deno.land/x/nodedeno@v0.2.4/mod.js";

//Convert the code
await convert({
  src: "postcss",
  input: ["lib"],
  output: "deno",
  transpile: true,
  modules: {
    "": "mod.js",
    "deps.js": "lib/deps.js",
  },
  copy: {
    "deps.js": "lib/deps.js",
    "test": "test",
  },
  beforeConvert(src, { replaceAll, rename }) {
    replaceAll((code) =>
      code.replace(", options: colorette", "")
        .replace("if (color == null) color = colorette.enabled", "")
        .replace(", options as colorette", "")
    );

    rename(
      "lib/postcss.mjs",
      "mod.js",
      (code) => code.replace(`'./postcss.js'`, `"./lib/postcss.js"`),
    );
  },
});
