import { assert, assertEquals } from "./deps.js";
import { resolve } from "../lib/deps.js";

import postcss, {
  AtRule,
  CssSyntaxError,
  Declaration,
  parse,
  Root,
  Rule,
} from "../mod.js";

function stringify(node, builder) {
  if (node.type === "rule") {
    return builder(node.selector);
  }
}

Deno.test("error() generates custom error", () => {
  const file = resolve("a.css");
  const css = parse("a{}", { from: file });
  const a = css.first;
  const error = a.error("Test");
  assert(error instanceof CssSyntaxError);
  assertEquals(error.message, file + ":1:1: Test");
});

Deno.test("error() generates custom error for nodes without source", () => {
  const rule = new Rule({ selector: "a" });
  const error = rule.error("Test");
  assertEquals(error.message, "<css input>: Test");
});

Deno.test("error() highlights index", () => {
  const root = parse("a { b: c }");
  const a = root.first;
  const b = a.first;
  const error = b.error("Bad semicolon", { index: 1 });
  assertEquals(
    error.showSourceCode(false),
    "> 1 | a { b: c }\n" + "    |      ^",
  );
});

Deno.test("error() highlights word", () => {
  const root = parse("a { color: x red }");
  const a = root.first;
  const color = a.first;
  const error = color.error("Wrong color", { word: "x" });
  assertEquals(
    error.showSourceCode(false),
    "> 1 | a { color: x red }\n" + "    |            ^",
  );
});

Deno.test("error() highlights word in multiline string", () => {
  const root = parse("a { color: red\n           x }");
  const a = root.first;
  const color = a.first;
  const error = color.error("Wrong color", { word: "x" });
  assertEquals(
    error.showSourceCode(false),
    "  1 | a { color: red\n" + "> 2 |            x }\n" + "    |            ^",
  );
});

Deno.test("warn() attaches a warning to the result object", async () => {
  let warning;
  const warner = {
    postcssPlugin: "warner",
    Once(css, { result }) {
      warning = css.first?.warn(result, "FIRST!");
    },
  };

  const result = await postcss([warner]).process("a{}", { from: undefined });
  assertEquals(warning.type, "warning");
  assertEquals(warning.text, "FIRST!");
  assertEquals(warning.plugin, "warner");
  assertEquals(result.warnings(), [warning]);
});

Deno.test("warn() accepts options", () => {
  const warner = (css, result) => {
    css.first?.warn(result, "FIRST!", { index: 1 });
  };

  const result = postcss([warner]).process("a{}");
  assert(result.warnings().length === 1);
  const warning = result.warnings()[0];
  assertEquals(warning.index, 1);
});

Deno.test("remove() removes node from parent", () => {
  const rule = new Rule({ selector: "a" });
  const decl = new Declaration({ prop: "color", value: "black" });
  rule.append(decl);

  decl.remove();
  assert(rule.nodes.length === 0);
  assert(typeof decl.parent === "undefined");
});

Deno.test("replaceWith() inserts new node", () => {
  const rule = new Rule({ selector: "a" });
  rule.append({ prop: "color", value: "black" });
  rule.append({ prop: "width", value: "1px" });
  rule.append({ prop: "height", value: "1px" });

  const node = new Declaration({ prop: "min-width", value: "1px" });
  const width = rule.nodes[1];
  const result = width.replaceWith(node);

  assertEquals(result, width);
  assertEquals(
    rule.toString(),
    "a {\n" +
      "    color: black;\n" +
      "    min-width: 1px;\n" +
      "    height: 1px\n" +
      "}",
  );
});

Deno.test("replaceWith() inserts new root", () => {
  const root = new Root();
  root.append(new AtRule({ name: "import", params: '"a.css"' }));

  const a = new Root();
  a.append(new Rule({ selector: "a" }));
  a.append(new Rule({ selector: "b" }));

  root.first?.replaceWith(a);
  assertEquals(root.toString(), "a {}\nb {}");
});

Deno.test("replaceWith() replaces node", () => {
  const css = parse("a{one:1;two:2}");
  const a = css.first;
  const one = a.first;
  const result = one.replaceWith({ prop: "fix", value: "fixed" });

  assertEquals(result.prop, "one");
  assert(typeof result.parent === "undefined");
  assertEquals(css.toString(), "a{fix:fixed;two:2}");
});

Deno.test("replaceWith() can include itself", () => {
  const css = parse("a{one:1;two:2}");
  const a = css.first;
  const one = a.first;
  const beforeDecl = { prop: "fix1", value: "fixedOne" };
  const afterDecl = { prop: "fix2", value: "fixedTwo" };
  one.replaceWith(beforeDecl, one, afterDecl);

  assertEquals(css.toString(), "a{fix1:fixedOne;one:1;fix2:fixedTwo;two:2}");
});

Deno.test("toString() accepts custom stringifier", () => {
  assertEquals(new Rule({ selector: "a" }).toString(stringify), "a");
});

Deno.test("toString() accepts custom syntax", () => {
  assertEquals(new Rule({ selector: "a" }).toString({ stringify }), "a");
});

Deno.test("clone() clones nodes", () => {
  const rule = new Rule({ selector: "a" });
  rule.append({ prop: "color", value: "/**/black" });

  const clone = rule.clone();

  assert(typeof clone.parent === "undefined");

  assert(rule.first?.parent === rule);
  assert(clone.first?.parent === clone);

  clone.append({ prop: "z-index", value: "1" });
  assert(rule.nodes.length === 1);
});

Deno.test("clone() overrides properties", () => {
  const rule = new Rule({ selector: "a" });
  const clone = rule.clone({ selector: "b" });
  assertEquals(clone.selector, "b");
});

Deno.test("clone() keeps code style", () => {
  const css = parse("@page 1{a{color:black;}}");
  assertEquals(css.clone().toString(), "@page 1{a{color:black;}}");
});

Deno.test("clone() works with null in raws", () => {
  const decl = new Declaration({
    prop: "color",
    value: "black",
    raws: { value: null },
  });
  const clone = decl.clone();
  assertEquals(Object.keys(clone.raws), ["value"]);
});

Deno.test("cloneBefore() clones and insert before current node", () => {
  const rule = new Rule({ selector: "a", raws: { after: "" } });
  rule.append({ prop: "z-index", value: "1", raws: { before: "" } });

  const result = rule.first?.cloneBefore({ value: "2" });

  assert(result === rule.first);
  assertEquals(rule.toString(), "a {z-index: 2;z-index: 1}");
});

Deno.test("cloneAfter() clones and insert after current node", () => {
  const rule = new Rule({ selector: "a", raws: { after: "" } });
  rule.append({ prop: "z-index", value: "1", raws: { before: "" } });

  const result = rule.first?.cloneAfter({ value: "2" });

  assert(result === rule.last);
  assertEquals(rule.toString(), "a {z-index: 1;z-index: 2}");
});

Deno.test("before() insert before current node", () => {
  const rule = new Rule({ selector: "a", raws: { after: "" } });
  rule.append({ prop: "z-index", value: "1", raws: { before: "" } });

  const result = rule.first?.before("color: black");

  assert(result === rule.last);
  assertEquals(rule.toString(), "a {color: black;z-index: 1}");
});

Deno.test("after() insert after current node", () => {
  const rule = new Rule({ selector: "a", raws: { after: "" } });
  rule.append({ prop: "z-index", value: "1", raws: { before: "" } });

  const result = rule.first?.after("color: black");

  assert(result === rule.first);
  assertEquals(rule.toString(), "a {z-index: 1;color: black}");
});

Deno.test("next() returns next node", () => {
  const css = parse("a{one:1;two:2}");
  const a = css.first;
  assert(a.first?.next() === a.last);
  assert(typeof a.last?.next() === "undefined");
});

Deno.test("next() returns undefined on no parent", () => {
  const css = parse("");
  assert(typeof css.next() === "undefined");
});

Deno.test("prev() returns previous node", () => {
  const css = parse("a{one:1;two:2}");
  const a = css.first;
  assert(a.last?.prev() === a.first);
  assert(typeof a.first?.prev() === "undefined");
});

Deno.test("prev() returns undefined on no parent", () => {
  const css = parse("");
  assert(typeof css.prev() === "undefined");
});

Deno.test("toJSON() cleans parents inside", () => {
  const rule = new Rule({ selector: "a" });
  rule.append({ prop: "color", value: "b" });

  const json = rule.toJSON();
  assert(typeof json.parent === "undefined");
  assert(typeof json.nodes[0].parent === "undefined");

  assertEquals(
    JSON.stringify(rule),
    '{"raws":{},"selector":"a","type":"rule","nodes":[{"raws":{},"prop":"color","value":"b","type":"decl"}],"inputs":[]}',
  );
});

Deno.test("toJSON() converts custom properties", () => {
  const root = new Root();
  root._cache = [1];
  root._hack = {
    toJSON() {
      return "hack";
    },
  };

  assertEquals(root.toJSON(), {
    type: "root",
    nodes: [],
    raws: {},
    inputs: [],
    _hack: "hack",
    _cache: [1],
  });
});

Deno.test("raw() has shortcut to stringifier", () => {
  const rule = new Rule({ selector: "a" });
  assertEquals(rule.raw("before"), "");
});

Deno.test("root() returns root", () => {
  const css = parse("@page{a{color:black}}");
  const page = css.first;
  const a = page.first;
  const color = a.first;
  assert(color.root() === css);
});

Deno.test("root() returns parent of parents", () => {
  const rule = new Rule({ selector: "a" });
  rule.append({ prop: "color", value: "black" });
  assert(rule.first?.root() === rule);
});

Deno.test("root() returns self on root", () => {
  const rule = new Rule({ selector: "a" });
  assert(rule.root() === rule);
});

Deno.test("cleanRaws() cleans style recursivelly", () => {
  const css = parse("@page{a{color:black}}");
  css.cleanRaws();

  assertEquals(
    css.toString(),
    "@page {\n    a {\n        color: black\n    }\n}",
  );
  const page = css.first;
  const a = page.first;
  const color = a.first;
  assert(typeof page.raws.before === "undefined");
  assert(typeof color.raws.before === "undefined");
  assert(typeof page.raws.between === "undefined");
  assert(typeof color.raws.between === "undefined");
  assert(typeof page.raws.after === "undefined");
});

Deno.test("cleanRaws() keeps between on request", () => {
  const css = parse("@page{a{color:black}}");
  css.cleanRaws(true);

  assertEquals(css.toString(), "@page{\n    a{\n        color:black\n    }\n}");
  const page = css.first;
  const a = page.first;
  const color = a.first;
  assert(typeof page.raws.between !== "undefined");
  assert(typeof color.raws.between !== "undefined");
  assert(typeof page.raws.before === "undefined");
  assert(typeof color.raws.before === "undefined");
  assert(typeof page.raws.after === "undefined");
});

Deno.test("positionInside() returns position when node starts mid-line", () => {
  const css = parse("a {  one: X  }");
  const a = css.first;
  const one = a.first;
  assertEquals(one.positionInside(6), { line: 1, column: 12 });
});

Deno.test("positionInside() returns position when before contains newline", () => {
  const css = parse("a {\n  one: X}");
  const a = css.first;
  const one = a.first;
  assertEquals(one.positionInside(6), { line: 2, column: 9 });
});

Deno.test("positionInside() returns position when node contains newlines", () => {
  const css = parse("a {\n\tone: 1\n\t\tX\n3}");
  const a = css.first;
  const one = a.first;
  assertEquals(one.positionInside(10), { line: 3, column: 4 });
});
