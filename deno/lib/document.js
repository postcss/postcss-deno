/// <reference types="./document.d.ts" />

import Container from "./container.js";

let LazyResult, Processor;

class Document extends Container {
  constructor(defaults) {
    // type needs to be passed to super, otherwise child roots won't be normalized correctly
    super({ type: "document", ...defaults });

    if (!this.nodes) {
      this.nodes = [];
    }
  }

  toResult(opts = {}) {
    let lazy = new LazyResult(new Processor(), this, opts);

    return lazy.stringify();
  }
}

Document.registerLazyResult = (dependant) => {
  LazyResult = dependant;
};

Document.registerProcessor = (dependant) => {
  Processor = dependant;
};

export default Document;

Document.default = Document;
