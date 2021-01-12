/// <reference types="./rule.d.ts" />

import Container from "./container.js";
import list from "./list.js";

class Rule extends Container {
  constructor(defaults) {
    super(defaults);
    this.type = "rule";
    if (!this.nodes) this.nodes = [];
  }

  get selectors() {
    return list.comma(this.selector);
  }

  set selectors(values) {
    let match = this.selector ? this.selector.match(/,\s*/) : null;
    let sep = match ? match[0] : "," + this.raw("between", "beforeOpen");
    this.selector = values.join(sep);
  }
}

export default Rule;

Rule.default = Rule;

Container.registerRule(Rule);
