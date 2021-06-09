import { assertEquals } from "./deps.js";
import { parse, Rule } from "../mod.js";

Deno.test("initializes with properties", () => {
  const rule = new Rule({ selector: "a" });
  assertEquals(rule.selector, "a");
});

Deno.test("returns array in selectors", () => {
  const rule = new Rule({ selector: "a,b" });
  assertEquals(rule.selectors, ["a", "b"]);
});

Deno.test("trims selectors", () => {
  const rule = new Rule({ selector: ".a\n, .b  , .c" });
  assertEquals(rule.selectors, [".a", ".b", ".c"]);
});

Deno.test("is smart about selectors commas", () => {
  const rule = new Rule({
    selector: "[foo='a, b'], a:-moz-any(:focus, [href*=','])",
  });
  assertEquals(rule.selectors, [
    "[foo='a, b']",
    "a:-moz-any(:focus, [href*=','])",
  ]);
});

Deno.test("receive array in selectors", () => {
  const rule = new Rule({ selector: "i, b" });
  rule.selectors = ["em", "strong"];
  assertEquals(rule.selector, "em, strong");
});

Deno.test("saves separator in selectors", () => {
  const rule = new Rule({ selector: "i,\nb" });
  rule.selectors = ["em", "strong"];
  assertEquals(rule.selector, "em,\nstrong");
});

Deno.test("uses between to detect separator in selectors", () => {
  const rule = new Rule({ selector: "b", raws: { between: "" } });
  rule.selectors = ["b", "strong"];
  assertEquals(rule.selector, "b,strong");
});

Deno.test("uses space in separator be default in selectors", () => {
  const rule = new Rule({ selector: "b" });
  rule.selectors = ["b", "strong"];
  assertEquals(rule.selector, "b, strong");
});

Deno.test("selectors works in constructor", () => {
  const rule = new Rule({ selectors: ["a", "b"] });
  assertEquals(rule.selector, "a, b");
});

Deno.test("inserts default spaces", () => {
  const rule = new Rule({ selector: "a" });
  assertEquals(rule.toString(), "a {}");
  rule.append({ prop: "color", value: "black" });
  assertEquals(rule.toString(), "a {\n    color: black\n}");
});

Deno.test("clones spaces from another rule", () => {
  const root = parse("b{\n  }");
  const rule = new Rule({ selector: "em" });
  root.append(rule);
  assertEquals(root.toString(), "b{\n  }\nem{\n  }");
});

Deno.test("uses different spaces for empty rules", () => {
  const root = parse("a{}\nb{\n a:1\n}");
  const rule = new Rule({ selector: "em" });
  root.append(rule);
  assertEquals(root.toString(), "a{}\nb{\n a:1\n}\nem{}");

  rule.append({ prop: "top", value: "0" });
  assertEquals(root.toString(), "a{}\nb{\n a:1\n}\nem{\n top:0\n}");
});
