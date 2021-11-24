/// <reference types="./warning.d.ts" />

class Warning {
  constructor(text, opts = {}) {
    this.type = "warning";
    this.text = text;

    if (opts.node && opts.node.source) {
      let range = opts.node.rangeBy(opts);
      this.line = range.start.line;
      this.column = range.start.column;
      this.endLine = range.end.line;
      this.endColumn = range.end.column;
    }

    for (let opt in opts) this[opt] = opts[opt];
  }

  toString() {
    if (this.node) {
      return this.node.error(this.text, {
        plugin: this.plugin,
        index: this.index,
        word: this.word,
      }).message;
    }

    if (this.plugin) {
      return this.plugin + ": " + this.text;
    }

    return this.text;
  }
}

export default Warning;

Warning.default = Warning;
