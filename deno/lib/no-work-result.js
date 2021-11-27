/// <reference types="./no-work-result.d.ts" />

import MapGenerator from "./map-generator.js";
import stringify from "./stringify.js";
import warnOnce from "./warn-once.js";
import parse from "./parse.js";
import Result from "./result.js";

class NoWorkResult {
  constructor(processor, css, opts) {
    css = css.toString();
    this.stringified = false;

    this._processor = processor;
    this._css = css;
    this._opts = opts;
    this._map = undefined;
    let root;

    let str = stringify;
    this.result = new Result(this._processor, root, this._opts);
    this.result.css = css;

    let self = this;
    Object.defineProperty(this.result, "root", {
      get() {
        return self.root;
      },
    });

    let map = new MapGenerator(str, root, this._opts, css);
    if (map.isMap()) {
      let [generatedCSS, generatedMap] = map.generate();
      if (generatedCSS) {
        this.result.css = generatedCSS;
      }
      if (generatedMap) {
        this.result.map = generatedMap;
      }
    }
  }

  get [Symbol.toStringTag]() {
    return "NoWorkResult";
  }

  get processor() {
    return this.result.processor;
  }

  get opts() {
    return this.result.opts;
  }

  get css() {
    return this.result.css;
  }

  get content() {
    return this.result.css;
  }

  get map() {
    return this.result.map;
  }

  get root() {
    if (this._root) {
      return this._root;
    }

    let root;
    let parser = parse;

    try {
      root = parser(this._css, this._opts);
    } catch (error) {
      this.error = error;
    }

    this._root = root;

    return root;
  }

  get messages() {
    return [];
  }

  warnings() {
    return [];
  }

  toString() {
    return this._css;
  }

  then(onFulfilled, onRejected) {
    if (Deno.env.get("DENO_ENV") !== "production") {
      if (!("from" in this._opts)) {
        warnOnce(
          "Without `from` option PostCSS could generate wrong source map " +
            "and will not find Browserslist config. Set it to CSS file path " +
            "or to `undefined` to prevent this warning.",
        );
      }
    }

    return this.async().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.async().catch(onRejected);
  }

  finally(onFinally) {
    return this.async().then(onFinally, onFinally);
  }

  async() {
    if (this.error) return Promise.reject(this.error);
    return Promise.resolve(this.result);
  }

  sync() {
    if (this.error) throw this.error;
    return this.result;
  }
}

export default NoWorkResult;

NoWorkResult.default = NoWorkResult;
