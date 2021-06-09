import { assert, assertEquals, assertMatch } from "./deps.js";
import { parse, Result } from "../mod.js";

Deno.test("prepend() fixes spaces on insert before first", () => {
  const css = parse("a {} b {}");
  css.prepend({ selector: "em" });
  assertEquals(css.toString(), "em {} a {} b {}");
});

Deno.test("prepend() fixes spaces on multiple inserts before first", () => {
  const css = parse("a {} b {}");
  css.prepend({ selector: "em" }, { selector: "strong" });
  assertEquals(css.toString(), "em {} strong {} a {} b {}");
});

Deno.test("prepend() uses default spaces on only first", () => {
  const css = parse("a {}");
  css.prepend({ selector: "em" });
  assertEquals(css.toString(), "em {}\na {}");
});

Deno.test("append() sets new line between rules in multiline files", () => {
  const a = parse("a {}\n\na {}\n");
  const b = parse("b {}\n");
  assertEquals(a.append(b).toString(), "a {}\n\na {}\n\nb {}\n");
});

Deno.test("insertAfter() does not use before of first rule", () => {
  const css = parse("a{} b{}");
  css.insertAfter(0, { selector: ".a" });
  css.insertAfter(2, { selector: ".b" });

  assert(typeof css.nodes[1].raws.before === "undefined");
  assertEquals(css.nodes[3].raws.before, " ");
  assertEquals(css.toString(), "a{} .a{} b{} .b{}");
});

Deno.test("keeps spaces on moving root", () => {
  const css1 = parse("a{}\nb{}\n");

  const css2 = parse("");
  css2.append(css1);
  assertEquals(css2.toString(), "a{}\nb{}");

  const css3 = parse("\n");
  css3.append(css2.nodes);
  assertEquals(css3.toString(), "a{}\nb{}\n");
});

Deno.test("generates result with map", () => {
  const root = parse("a {}");
  const result = root.toResult({ map: true });

  assert(result instanceof Result);
  assertMatch(result.css, /a {}\n\/\*# sourceMappingURL=/);
});
