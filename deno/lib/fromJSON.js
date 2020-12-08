import Declaration from "./declaration.js";
import PreviousMap from "./previous-map.js";
import Comment from "./comment.js";
import AtRule from "./at-rule.js";
import Input from "./input.js";
import Root from "./root.js";
import Rule from "./rule.js";

function fromJSON(json) {
  let defaults = { ...json };
  if (json.nodes) {
    defaults.nodes = json.nodes.map((i) => fromJSON(i));
  }
  if (json.type === "root") {
    if (defaults.source) {
      defaults.source = { ...defaults.source };
      if (defaults.source.input) {
        defaults.source.input = {
          ...defaults.source.input,
          __proto__: Input.prototype,
        };
        if (defaults.source.input.map) {
          defaults.source.input.map = {
            ...defaults.source.input.map,
            __proto__: PreviousMap.prototype,
          };
        }
      }
    }
    return new Root(defaults);
  } else if (json.type === "decl") {
    return new Declaration(defaults);
  } else if (json.type === "rule") {
    return new Rule(defaults);
  } else if (json.type === "comment") {
    return new Comment(defaults);
  } else if (json.type === "atrule") {
    return new AtRule(defaults);
  } else {
    throw new Error("Unknown node type: " + json.type);
  }
}

export default fromJSON;
