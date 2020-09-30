import Container from "./container.js";

class AtRule extends Container {
  constructor(defaults) {
    super(defaults);
    this.type = "atrule";
  }

  append(...children) {
    if (!this.proxyOf.nodes) this.nodes = [];
    return super.append(...children);
  }

  prepend(...children) {
    if (!this.proxyOf.nodes) this.nodes = [];
    return super.prepend(...children);
  }
}

export default AtRule;

Container.registerAtRule(AtRule);
