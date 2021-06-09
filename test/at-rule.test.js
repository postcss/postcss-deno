import { assert, assertEquals } from "./deps.js";
import { AtRule, parse } from "../mod.js";

Deno.test("initializes with properties", () => {
  const rule = new AtRule({ name: "encoding", params: '"utf-8"' });

  assertEquals(rule.name, "encoding");
  assertEquals(rule.params, '"utf-8"');
  assertEquals(rule.toString(), '@encoding "utf-8"');
});

Deno.test("does not fall on childless at-rule", () => {
  const rule = new AtRule();
  assert(typeof rule.each((i) => i) === "undefined");
});

Deno.test("creates nodes property on prepend()", () => {
  const rule = new AtRule();
  assert(typeof rule.nodes === "undefined");

  rule.prepend("color: black");
  assert(rule.nodes.length === 1);
});

Deno.test("creates nodes property on append()", () => {
  const rule = new AtRule();
  assert(typeof rule.nodes === "undefined");

  rule.append("color: black");
  assert(rule.nodes.length === 1);
});

Deno.test("inserts default spaces", () => {
  const rule = new AtRule({ name: "page", params: 1, nodes: [] });
  assertEquals(rule.toString(), "@page 1 {}");
});

Deno.test("clone spaces from another at-rule", () => {
  const root = parse("@page{}a{}");
  const rule = new AtRule({ name: "page", params: 1, nodes: [] });
  root.append(rule);

  assertEquals(rule.toString(), "@page 1{}");
});
