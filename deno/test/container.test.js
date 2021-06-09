import { assert, assertEquals, assertMatch, assertThrows } from "./deps.js";
import { Declaration, parse, Root, Rule } from "../mod.js";

const example = "a { a: 1; b: 2 }" +
  "/* a */" +
  "@keyframes anim {" +
  "/* b */" +
  "to { c: 3 }" +
  "}" +
  "@media all and (min-width: 100) {" +
  "em { d: 4 }" +
  "@page {" +
  "e: 5;" +
  "/* c */" +
  "}" +
  "}";

Deno.test("throws error on declaration without value", () => {
  assertThrows(() => {
    new Rule().append({ prop: "color", vlaue: "black" });
  });
});

Deno.test("throws error on unknown node type", () => {
  assertThrows(() => {
    new Rule().append({ foo: "bar" });
  });
});

Deno.test("push() adds child without checks", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.push(new Declaration({ prop: "c", value: "3" }));
  assertEquals(rule.toString(), "a { a: 1; b: 2; c: 3 }");
  assert(rule.nodes.length === 3);
});

Deno.test("each() iterates", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const indexes = [];

  const result = rule.each((decl, i) => {
    indexes.push(i);
    assert(decl === rule.nodes[i]);
  });

  assert(typeof result === "undefined");
  assertEquals(indexes, [0, 1]);
});

Deno.test("each() iterates with prepend", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  let size = 0;

  rule.each(() => {
    rule.prepend({ prop: "color", value: "aqua" });
    size += 1;
  });

  assertEquals(size, 2);
});

Deno.test("each() iterates with prepend insertBefore", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  let size = 0;

  rule.each((decl) => {
    if (decl.type === "decl" && decl.prop === "a") {
      rule.insertBefore(decl, { prop: "c", value: "3" });
    }
    size += 1;
  });

  assertEquals(size, 2);
});

Deno.test("each() iterates with append insertBefore", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  let size = 0;

  rule.each((decl, i) => {
    if (decl.type === "decl" && decl.prop === "a") {
      rule.insertBefore(i + 1, { prop: "c", value: "3" });
    }
    size += 1;
  });

  assertEquals(size, 3);
});

Deno.test("each() iterates with prepend insertAfter", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  let size = 0;

  rule.each((_decl, i) => {
    rule.insertAfter(i - 1, { prop: "c", value: "3" });
    size += 1;
  });

  assertEquals(size, 2);
});

Deno.test("each() iterates with append insertAfter", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  let size = 0;

  rule.each((decl, i) => {
    if (decl.type === "decl" && decl.prop === "a") {
      rule.insertAfter(i, { prop: "c", value: "3" });
    }
    size += 1;
  });

  assertEquals(size, 3);
});

Deno.test("each() iterates with remove", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  let size = 0;

  rule.each(() => {
    rule.removeChild(0);
    size += 1;
  });

  assertEquals(size, 2);
});

Deno.test("each() breaks iteration", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const indexes = [];

  const result = rule.each((_decl, i) => {
    indexes.push(i);
    return false;
  });

  assert(result === false);
  assertEquals(indexes, [0]);
});

Deno.test("each() allows to change children", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const props = [];

  rule.each((decl) => {
    if (decl.type === "decl") {
      props.push(decl.prop);
      rule.nodes = [rule.last, rule.first];
    }
  });

  assertEquals(props, ["a", "a"]);
});

Deno.test("walk() iterates", () => {
  const types = [];
  const indexes = [];

  const result = parse(example).walk((node, i) => {
    types.push(node.type);
    indexes.push(i);
  });

  assert(typeof result === "undefined");
  assertEquals(types, [
    "rule",
    "decl",
    "decl",
    "comment",
    "atrule",
    "comment",
    "rule",
    "decl",
    "atrule",
    "rule",
    "decl",
    "atrule",
    "decl",
    "comment",
  ]);
  assertEquals(indexes, [0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1]);
});

Deno.test("walk() breaks iteration", () => {
  const indexes = [];

  const result = parse(example).walk((_decl, i) => {
    indexes.push(i);
    return false;
  });

  assert(result === false);
  assertEquals(indexes, [0]);
});

Deno.test("walk() adds CSS position to error stack", () => {
  const error = new Error("T");
  error.stack = "Error: T\n    at b (b.js:2:4)\n    at a (a.js:2:1)";
  const root = parse(example, { from: "/c.css" });
  let catched;
  try {
    root.walk(() => {
      throw error;
    });
  } catch (e) {
    catched = e;
  }

  assertEquals(catched.postcssNode.toString(), "a { a: 1; b: 2 }");
  assertEquals(
    catched.stack.replace(/.:\\/i, "/"),
    "Error: T\n    at /c.css:1:1\n    at b (b.js:2:4)\n    at a (a.js:2:1)",
  );
});

Deno.test("walkDecls() iterates", () => {
  const props = [];
  const indexes = [];

  const result = parse(example).walkDecls((decl, i) => {
    props.push(decl.prop);
    indexes.push(i);
  });

  assert(typeof result === "undefined");
  assertEquals(props, ["a", "b", "c", "d", "e"]);
  assertEquals(indexes, [0, 1, 0, 0, 0]);
});

Deno.test("walkDecls() iterates with changes", () => {
  let size = 0;
  parse(example).walkDecls((decl, i) => {
    decl.parent?.removeChild(i);
    size += 1;
  });
  assertEquals(size, 5);
});

Deno.test("walkDecls() breaks iteration", () => {
  const indexes = [];

  const result = parse(example).walkDecls((_decl, i) => {
    indexes.push(i);
    return false;
  });

  assert(result === false);
  assertEquals(indexes, [0]);
});

Deno.test("walkDecls() filters declarations by property name", () => {
  const css = parse("@page{a{one:1}}b{one:1;two:2}");
  let size = 0;

  css.walkDecls("one", (decl) => {
    assertEquals(decl.prop, "one");
    size += 1;
  });

  assertEquals(size, 2);
});

Deno.test("walkDecls() breaks declarations filter by name", () => {
  const css = parse("@page{a{one:1}}b{one:1;two:2}");
  let size = 0;

  css.walkDecls("one", () => {
    size += 1;
    return false;
  });

  assertEquals(size, 1);
});

Deno.test("walkDecls() filters declarations by property regexp", () => {
  const css = parse("@page{a{one:1}}b{one-x:1;two:2}");
  let size = 0;

  css.walkDecls(/one(-x)?/, () => {
    size += 1;
  });

  assertEquals(size, 2);
});

Deno.test("walkDecls() breaks declarations filters by regexp", () => {
  const css = parse("@page{a{one:1}}b{one-x:1;two:2}");
  let size = 0;

  css.walkDecls(/one(-x)?/, () => {
    size += 1;
    return false;
  });

  assertEquals(size, 1);
});

Deno.test("walkComments() iterates", () => {
  const texts = [];
  const indexes = [];

  const result = parse(example).walkComments((comment, i) => {
    texts.push(comment.text);
    indexes.push(i);
  });

  assert(typeof result === "undefined");
  assertEquals(texts, ["a", "b", "c"]);
  assertEquals(indexes, [1, 0, 1]);
});

Deno.test("walkComments() iterates with changes", () => {
  let size = 0;
  parse(example).walkComments((comment, i) => {
    comment.parent?.removeChild(i);
    size += 1;
  });
  assertEquals(size, 3);
});

Deno.test("walkComments() breaks iteration", () => {
  const indexes = [];

  const result = parse(example).walkComments((_comment, i) => {
    indexes.push(i);
    return false;
  });

  assert(result === false);
  assertEquals(indexes, [1]);
});

Deno.test("walkRules() iterates", () => {
  const selectors = [];
  const indexes = [];

  const result = parse(example).walkRules((rule, i) => {
    selectors.push(rule.selector);
    indexes.push(i);
  });

  assert(typeof result === "undefined");
  assertEquals(selectors, ["a", "to", "em"]);
  assertEquals(indexes, [0, 1, 0]);
});

Deno.test("walkRules() iterates with changes", () => {
  let size = 0;
  parse(example).walkRules((rule, i) => {
    rule.parent?.removeChild(i);
    size += 1;
  });
  assertEquals(size, 3);
});

Deno.test("walkRules() breaks iteration", () => {
  const indexes = [];

  const result = parse(example).walkRules((_rule, i) => {
    indexes.push(i);
    return false;
  });

  assert(result === false);
  assertEquals(indexes, [0]);
});

Deno.test("walkRules() filters by selector", () => {
  let size = 0;
  parse("a{}b{}a{}").walkRules("a", (rule) => {
    assertEquals(rule.selector, "a");
    size += 1;
  });
  assertEquals(size, 2);
});

Deno.test("walkRules() breaks selector filters", () => {
  let size = 0;
  parse("a{}b{}a{}").walkRules("a", () => {
    size += 1;
    return false;
  });
  assertEquals(size, 1);
});

Deno.test("walkRules() filters by regexp", () => {
  let size = 0;
  parse("a{}a b{}b a{}").walkRules(/^a/, (rule) => {
    assertMatch(rule.selector, /^a/);
    size += 1;
  });
  assertEquals(size, 2);
});

Deno.test("walkRules() breaks selector regexp", () => {
  let size = 0;
  parse("a{}b a{}b a{}").walkRules(/^a/, () => {
    size += 1;
    return false;
  });
  assertEquals(size, 1);
});

Deno.test("walkAtRules() iterates", () => {
  const names = [];
  const indexes = [];

  const result = parse(example).walkAtRules((atrule, i) => {
    names.push(atrule.name);
    indexes.push(i);
  });

  assert(typeof result === "undefined");
  assertEquals(names, ["keyframes", "media", "page"]);
  assertEquals(indexes, [2, 3, 1]);
});

Deno.test("walkAtRules() iterates with changes", () => {
  let size = 0;
  parse(example).walkAtRules((atrule, i) => {
    atrule.parent?.removeChild(i);
    size += 1;
  });
  assertEquals(size, 3);
});

Deno.test("walkAtRules() breaks iteration", () => {
  const indexes = [];

  const result = parse(example).walkAtRules((_atrule, i) => {
    indexes.push(i);
    return false;
  });

  assert(result === false);
  assertEquals(indexes, [2]);
});

Deno.test("walkAtRules() filters at-rules by name", () => {
  const css = parse("@page{@page 2{}}@media print{@page{}}");
  let size = 0;

  css.walkAtRules("page", (atrule) => {
    assertEquals(atrule.name, "page");
    size += 1;
  });

  assertEquals(size, 3);
});

Deno.test("walkAtRules() breaks name filter", () => {
  let size = 0;
  parse("@page{@page{@page{}}}").walkAtRules("page", () => {
    size += 1;
    return false;
  });
  assertEquals(size, 1);
});

Deno.test("walkAtRules() filters at-rules by name regexp", () => {
  const css = parse("@page{@page 2{}}@media print{@pages{}}");
  let size = 0;

  css.walkAtRules(/page/, () => {
    size += 1;
  });

  assertEquals(size, 3);
});

Deno.test("walkAtRules() breaks regexp filter", () => {
  let size = 0;
  parse("@page{@pages{@page{}}}").walkAtRules(/page/, () => {
    size += 1;
    return false;
  });
  assertEquals(size, 1);
});

Deno.test("append() appends child", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.append({ prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; b: 2; c: 3 }");
});

Deno.test("append() appends multiple children", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.append({ prop: "c", value: "3" }, { prop: "d", value: "4" });
  assertEquals(rule.toString(), "a { a: 1; b: 2; c: 3; d: 4 }");
});

Deno.test("append() has declaration shortcut", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.append({ prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; b: 2; c: 3 }");
});

Deno.test("append() has rule shortcut", () => {
  const root = new Root();
  root.append({ selector: "a" });
  assertEquals(root.first?.toString(), "a {}");
});

Deno.test("append() has at-rule shortcut", () => {
  const root = new Root();
  root.append({ name: "encoding", params: '"utf-8"' });
  assertEquals(root.first?.toString(), '@encoding "utf-8"');
});

Deno.test("append() has comment shortcut", () => {
  const root = new Root();
  root.append({ text: "ok" });
  assertEquals(root.first?.toString(), "/* ok */");
});

Deno.test("append() receives root", () => {
  const css = parse("a {}");
  css.append(parse("b {}"));
  assertEquals(css.toString(), "a {}b {}");
});

Deno.test("append() reveives string", () => {
  const root = new Root();
  root.append("a{}b{}");
  const a = root.first;
  a.append("color:black");
  assertEquals(root.toString(), "a{color:black}b{}");
});

Deno.test("append() receives array", () => {
  const a = parse("a{ z-index: 1 }");
  const b = parse("b{ width: 1px; height: 2px }");
  const aRule = a.first;
  const bRule = b.first;

  aRule.append(bRule.nodes);
  assertEquals(a.toString(), "a{ z-index: 1; width: 1px; height: 2px }");
  assertEquals(b.toString(), "b{ }");
});

Deno.test("append() move node on insert", () => {
  const a = parse("a{}");
  const b = parse("b{}");

  b.append(a.first);
  const bLast = b.last;
  bLast.selector = "b a";

  assertEquals(a.toString(), "");
  assertEquals(b.toString(), "b{}b a{}");
});

Deno.test("prepend() prepends child", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.prepend({ prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { c: 3; a: 1; b: 2 }");
  assertEquals(rule.first?.raws.before, " ");
});

Deno.test("prepend() prepends multiple children", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.prepend({ prop: "c", value: "3" }, { prop: "d", value: "4" });
  assertEquals(rule.toString(), "a { c: 3; d: 4; a: 1; b: 2 }");
  assertEquals(rule.first?.raws.before, " ");
});

Deno.test("prepend() receive hash instead of declaration", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.prepend({ prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { c: 3; a: 1; b: 2 }");
});

Deno.test("prepend() receives root", () => {
  const css = parse("a {}");
  css.prepend(parse("b {}"));
  assertEquals(css.toString(), "b {}\na {}");
});

Deno.test("prepend() receives string", () => {
  const css = parse("a {}");
  css.prepend("b {}");
  assertEquals(css.toString(), "b {}\na {}");
});

Deno.test("prepend() receives array", () => {
  const a = parse("a{ z-index: 1 }");
  const b = parse("b{ width: 1px; height: 2px }");
  const aRule = a.first;
  const bRule = b.first;

  aRule.prepend(bRule.nodes);
  assertEquals(a.toString(), "a{ width: 1px; height: 2px; z-index: 1 }");
});

Deno.test("prepend() works on empty container", () => {
  const root = parse("");
  root.prepend(new Rule({ selector: "a" }));
  assertEquals(root.toString(), "a {}");
});

Deno.test("insertBefore() inserts child", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.insertBefore(1, { prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; c: 3; b: 2 }");
  assertEquals(rule.nodes[1].raws.before, " ");
});

Deno.test("insertBefore() works with nodes too", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.insertBefore(rule.nodes[1], { prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; c: 3; b: 2 }");
});

Deno.test("insertBefore() receive hash instead of declaration", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.insertBefore(1, { prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; c: 3; b: 2 }");
});

Deno.test("insertBefore() receives array", () => {
  const a = parse("a{ color: red; z-index: 1 }");
  const b = parse("b{ width: 1; height: 2 }");
  const aRule = a.first;
  const bRule = b.first;

  aRule.insertBefore(1, bRule.nodes);
  assertEquals(
    a.toString(),
    "a{ color: red; width: 1; height: 2; z-index: 1 }",
  );
});

Deno.test("insertAfter() inserts child", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.insertAfter(0, { prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; c: 3; b: 2 }");
  assertEquals(rule.nodes[1].raws.before, " ");
});

Deno.test("insertAfter() works with nodes too", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const aDecl = rule.first;
  rule.insertAfter(aDecl, { prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; c: 3; b: 2 }");
});

Deno.test("insertAfter() receive hash instead of declaration", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.insertAfter(0, { prop: "c", value: "3" });
  assertEquals(rule.toString(), "a { a: 1; c: 3; b: 2 }");
});

Deno.test("insertAfter() receives array", () => {
  const a = parse("a{ color: red; z-index: 1 }");
  const b = parse("b{ width: 1; height: 2 }");
  const aRule = a.first;
  const bRule = b.first;

  aRule.insertAfter(0, bRule.nodes);
  assertEquals(
    a.toString(),
    "a{ color: red; width: 1; height: 2; z-index: 1 }",
  );
});

Deno.test("removeChild() removes by index", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.removeChild(1);
  assertEquals(rule.toString(), "a { a: 1 }");
});

Deno.test("removeChild() removes by node", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const bDecl = rule.last;
  rule.removeChild(bDecl);
  assertEquals(rule.toString(), "a { a: 1 }");
});

Deno.test("removeChild() cleans parent in removed node", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const aDecl = rule.first;
  rule.removeChild(aDecl);
});

Deno.test("removeAll() removes all children", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.removeAll();

  assertEquals(rule.toString(), "a { }");
});

Deno.test("replaceValues() replaces strings", () => {
  const css = parse("a{one:1}b{two:1 2}");
  const result = css.replaceValues("1", "A");

  assertEquals(result, css);
  assertEquals(css.toString(), "a{one:A}b{two:A 2}");
});

Deno.test("replaceValues() replaces regpexp", () => {
  const css = parse("a{one:1}b{two:1 2}");
  css.replaceValues(/\d/g, (i) => i + "A");
  assertEquals(css.toString(), "a{one:1A}b{two:1A 2A}");
});

Deno.test("replaceValues() filters properties", () => {
  const css = parse("a{one:1}b{two:1 2}");
  css.replaceValues("1", { props: ["one"] }, "A");
  assertEquals(css.toString(), "a{one:A}b{two:1 2}");
});

Deno.test("replaceValues() uses fast check", () => {
  const css = parse("a{one:1}b{two:1 2}");
  css.replaceValues("1", { fast: "2" }, "A");
  assertEquals(css.toString(), "a{one:1}b{two:A 2}");
});

Deno.test("any() return true if all children return true", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  assert(rule.every((i) => i.type === "decl" && /a|b/.test(i.prop)) === true);
  assert(rule.every((i) => i.type === "decl" && /b/.test(i.prop)) === false);
});

Deno.test("some() return true if all children return true", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  assert(rule.some((i) => i.type === "decl" && i.prop === "b") === true);
  assert(rule.some((i) => i.type === "decl" && i.prop === "c") === false);
});

Deno.test("index() returns child index", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  assertEquals(rule.index(rule.nodes[1]), 1);
});

Deno.test("index() returns argument if it is number", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  assertEquals(rule.index(2), 2);
});

Deno.test("first() works for children-less nodes", () => {
  const atRule = parse('@charset "UTF-*"').first;
  assert(typeof atRule.first === "undefined");
});

Deno.test("last() works for children-less nodes", () => {
  const atRule = parse('@charset "UTF-*"').first;
  assert(typeof atRule.last === "undefined");
});

Deno.test("returns first child", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const aDecl = rule.first;
  assertEquals(aDecl.prop, "a");
});

Deno.test("returns last child", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  const bDecl = rule.last;
  assertEquals(bDecl.prop, "b");
});

Deno.test("normalize() does not normalize new children with exists before", () => {
  const rule = parse("a { a: 1; b: 2 }").first;
  rule.append({ prop: "c", value: "3", raws: { before: "\n " } });
  assertEquals(rule.toString(), "a { a: 1; b: 2;\n c: 3 }");
});

Deno.test("forces Declaration#value to be string", () => {
  const rule = parse("a { a: 1; b: 2 }").first;

  rule.append({ prop: "c", value: 3 });
  const aDecl = rule.first;
  const cDecl = rule.last;
  assertEquals(typeof aDecl.value, "string");
  assertEquals(typeof cDecl.value, "string");
});

Deno.test("updates parent in overrides.nodes in constructor", () => {
  const root = new Root({ nodes: [{ selector: "a" }] });
  const a = root.first;
  assert(a.parent === root);

  root.append({
    selector: "b",
    nodes: [{ prop: "color", value: "black" }],
  });
  const b = root.last;
  const color = b.first;
  assert(color.parent === root.last);
});

Deno.test("allows to clone nodes", () => {
  const root1 = parse("a { color: black; z-index: 1 } b {}");
  const root2 = new Root({ nodes: root1.nodes });
  assertEquals(root1.toString(), "a { color: black; z-index: 1 } b {}");
  assertEquals(root2.toString(), "a { color: black; z-index: 1 } b {}");
});
