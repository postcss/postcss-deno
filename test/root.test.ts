import { assert, assertEquals, assertMatch } from "./deps.js";
import { parse, Result } from "../mod.js";

Deno.test("prepend() fixes spaces on insert before first", () => {
  let css = parse("a {} b {}");
  css.prepend({ selector: "em" });
  assertEquals(css.toString(), "em {} a {} b {}");
});

Deno.test("prepend() fixes spaces on multiple inserts before first", () => {
  let css = parse("a {} b {}");
  css.prepend({ selector: "em" }, { selector: "strong" });
  assertEquals(css.toString(), "em {} strong {} a {} b {}");
});

Deno.test("prepend() uses default spaces on only first", () => {
  let css = parse("a {}");
  css.prepend({ selector: "em" });
  assertEquals(css.toString(), "em {}\na {}");
});

Deno.test("append() sets new line between rules in multiline files", () => {
  let a = parse("a {}\n\na {}\n");
  let b = parse("b {}\n");
  assertEquals(a.append(b).toString(), "a {}\n\na {}\n\nb {}\n");
});

Deno.test("insertAfter() does not use before of first rule", () => {
  let css = parse("a{} b{}");
  css.insertAfter(0, { selector: ".a" });
  css.insertAfter(2, { selector: ".b" });

  assert(typeof css.nodes[1].raws.before === "undefined");
  assertEquals(css.nodes[3].raws.before, " ");
  assertEquals(css.toString(), "a{} .a{} b{} .b{}");
});

Deno.test("fixes spaces on removing first rule", () => {
  let css = parse("a{}\nb{}\n");
  if (!css.first) throw new Error("No nodes were parsed");
  css.first.remove();
  assertEquals(css.toString(), "b{}\n");
});

Deno.test("keeps spaces on moving root", () => {
  let css1 = parse("a{}\nb{}\n");

  let css2 = parse("");
  css2.append(css1);
  assertEquals(css2.toString(), "a{}\nb{}");

  let css3 = parse("\n");
  css3.append(css2.nodes);
  assertEquals(css3.toString(), "a{}\nb{}\n");
});

Deno.test("generates result with map", () => {
  let root = parse("a {}");
  let result = root.toResult({ map: true });

  assert(result instanceof Result);
  assertMatch(result.css, /a {}\n\/\*# sourceMappingURL=/);
});
