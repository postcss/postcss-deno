import { convert } from "https://deno.land/x/nodedeno@v0.1.4/mod.js";

//Convert the code
await convert({
  from: "postcss/lib",
  to: "deno/lib",
  depsFile: "deps.js",
  transpile: true,
  onConvert(file, code) {
    code = code.replace(", options: colorette", "");
    code = code.replace("if (color == null) color = colorette.enabled", "");
    code = code.replace(", options as colorette", "");

    if (file === "deno/lib/postcss.mjs") {
      file = "deno/mod.js";
      code = code.replace(`"./postcss.js"`, `"./lib/postcss.js"`)
    }

    return [file, code];
  },
});

//Convert the tests
await convert({
  from: "postcss/test",
  to: "deno/test",
  depsFile: "test_deps.js",
  transpile: true,
  modules: {
    "..": "../mod.js"
  },
  ignoredFiles: [
    "browser.test.ts", // error: Uncaught SyntaxError: The requested module './deps.js' does not provide an export named 'options'
    "css-syntax-error.test.ts", // Fail test (https://github.com/allain/expect/issues/12)
    "errors.ts",
    "integration.js",
    "map.test.ts", // No support for JEST afterEach()
    "parse.test.ts", // error: Uncaught SyntaxError: The requested module './deps.js' does not provide an export named 'jsonify'
    "postcss.test.ts", // No support for JEST afterEach()
    "previous-map.test.ts", // No support for JEST afterEach()
    "processor.test.ts", // No support for JEST afterEach()
    "stringifier.test.js", // No support for JEST beforeAll()
    "stringify.test.ts", // error: Uncaught SyntaxError: The requested module './deps.js' does not provide an export named 'eachTest'
    "types.ts",
    "version.js",
    "visitor.test.ts", // Fail tests (https://github.com/allain/expect/issues/12)
  ],
  onConvert(file, code) {
    code = code.replace("../lib/postcss.js", "../mod.js");
    code = code.replace("jest.fn(", "mock.fn(");
    code = `import { expect, it, mock } from "./deps.js";\n${code}`;

    return [file, code];
  },
});
