/// <reference types="./stringify.d.ts" />

import Stringifier from "./stringifier.js";

function stringify(node, builder) {
  let str = new Stringifier(builder);
  str.stringify(node);
}

export default stringify;

stringify.default = stringify;
