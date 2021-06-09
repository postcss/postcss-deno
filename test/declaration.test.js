import { assert, assertEquals } from "./deps.js";
import { Declaration, parse, Rule } from "../mod.js";

Deno.test("initializes with properties", () => {
  const decl = new Declaration({ prop: "color", value: "black" });
  assertEquals(decl.prop, "color");
  assertEquals(decl.value, "black");
});

Deno.test("returns boolean important", () => {
  const decl = new Declaration({ prop: "color", value: "black" });
  decl.important = true;
  assertEquals(decl.toString(), "color: black !important");
});

Deno.test("inserts default spaces", () => {
  const decl = new Declaration({ prop: "color", value: "black" });
  const rule = new Rule({ selector: "a" });
  rule.append(decl);
  assertEquals(rule.toString(), "a {\n    color: black\n}");
});

Deno.test("clones spaces from another declaration", () => {
  const root = parse("a{color:black}");
  const rule = root.first;
  const decl = new Declaration({ prop: "margin", value: "0" });
  rule.append(decl);
  assertEquals(root.toString(), "a{color:black;margin:0}");
});

Deno.test("converts value to string", () => {
  const decl = new Declaration({ prop: "color", value: 1 });
  assertEquals(decl.value, "1");
});

Deno.test("detects variable declarations", () => {
  const prop = new Declaration({ prop: "--color", value: "black" });
  assert(prop.variable === true);
  const sass = new Declaration({ prop: "$color", value: "black" });
  assert(sass.variable === true);
  const decl = new Declaration({ prop: "color", value: "black" });
  assert(decl.variable === false);
});
