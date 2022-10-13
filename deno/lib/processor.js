/// <reference types="./processor.d.ts" />

import NoWorkResult from "./no-work-result.js";
import LazyResult from "./lazy-result.js";
import Document from "./document.js";
import Root from "./root.js";

class Processor {
  constructor(plugins = []) {
    this.version = "8.4.18";
    this.plugins = this.normalize(plugins);
  }

  use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]));
    return this;
  }

  process(css, opts = {}) {
    if (
      this.plugins.length === 0 &&
      typeof opts.parser === "undefined" &&
      typeof opts.stringifier === "undefined" &&
      typeof opts.syntax === "undefined"
    ) {
      return new NoWorkResult(this, css, opts);
    } else {
      return new LazyResult(this, css, opts);
    }
  }

  normalize(plugins) {
    let normalized = [];
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i();
      } else if (i.postcss) {
        i = i.postcss;
      }

      if (typeof i === "object" && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins);
      } else if (typeof i === "object" && i.postcssPlugin) {
        normalized.push(i);
      } else if (typeof i === "function") {
        normalized.push(i);
      } else if (typeof i === "object" && (i.parse || i.stringify)) {
        if (Deno.env.get("DENO_ENV") !== "production") {
          throw new Error(
            "PostCSS syntaxes cannot be used as plugins. Instead, please use " +
              "one of the syntax/parser/stringifier options as outlined " +
              "in your PostCSS runner documentation.",
          );
        }
      } else {
        throw new Error(i + " is not a PostCSS plugin");
      }
    }
    return normalized;
  }
}

export default Processor;

Processor.default = Processor;

Root.registerProcessor(Processor);
Document.registerProcessor(Processor);
