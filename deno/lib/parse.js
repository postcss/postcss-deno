/// <reference types="./parse.d.ts" />

import Container from "./container.js";
import Parser from "./parser.js";
import Input from "./input.js";

function parse(css, opts) {
  let input = new Input(css, opts);
  let parser = new Parser(input);
  try {
    parser.parse();
  } catch (e) {
    if (Deno.env.get("NODE_ENV") !== "production") {
      if (e.name === "CssSyntaxError" && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message += "\nYou tried to parse SCSS with " +
            "the standard CSS parser; " +
            "try again with the postcss-scss parser";
        } else if (/\.sass/i.test(opts.from)) {
          e.message += "\nYou tried to parse Sass with " +
            "the standard CSS parser; " +
            "try again with the postcss-sass parser";
        } else if (/\.less$/i.test(opts.from)) {
          e.message += "\nYou tried to parse Less with " +
            "the standard CSS parser; " +
            "try again with the postcss-less parser";
        }
      }
    }
    throw e;
  }

  return parser.root;
}

export default parse;

parse.default = parse;

Container.registerParse(parse);
