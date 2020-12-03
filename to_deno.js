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

    //Bug https://github.com/denoland/deno/issues/8355
    replaceAll((code) => code.replace(/\n\w+\.default = .*/g, ""));

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
    )
  }
});
