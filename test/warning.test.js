import { assert, assertEquals } from "./deps.js";
import { resolve } from "../lib/deps.js";
import { decl, parse, Warning } from "../mod.js";

Deno.test("outputs simple warning", () => {
  const warning = new Warning("text");
  assertEquals(warning.toString(), "text");
});

Deno.test("outputs warning with plugin", () => {
  const warning = new Warning("text", { plugin: "plugin" });
  assertEquals(warning.toString(), "plugin: text");
});

Deno.test("outputs warning with position", () => {
  const root = parse("a{}");
  const warning = new Warning("text", { node: root.first });
  assertEquals(warning.toString(), "<css input>:1:1: text");
});

Deno.test("outputs warning with plugin and node", () => {
  const file = resolve("a.css");
  const root = parse("a{}", { from: file });
  const warning = new Warning("text", {
    plugin: "plugin",
    node: root.first,
  });
  assertEquals(warning.toString(), `plugin: ${file}:1:1: text`);
});

Deno.test("outputs warning with index", () => {
  const file = resolve("a.css");
  const root = parse("@rule param {}", { from: file });
  const warning = new Warning("text", {
    plugin: "plugin",
    node: root.first,
    index: 7,
  });
  assertEquals(warning.toString(), `plugin: ${file}:1:8: text`);
});

Deno.test("outputs warning with word", () => {
  const file = resolve("a.css");
  const root = parse("@rule param {}", { from: file });
  const warning = new Warning("text", {
    plugin: "plugin",
    node: root.first,
    word: "am",
  });
  assertEquals(warning.toString(), `plugin: ${file}:1:10: text`);
});

Deno.test("generates warning without source", () => {
  const node = decl({ prop: "color", value: "black" });
  const warning = new Warning("text", { node });
  assertEquals(warning.toString(), "<css input>: text");
});

Deno.test("has line and column is undefined by default", () => {
  const warning = new Warning("text");
  assert(typeof warning.line === "undefined");
  assert(typeof warning.column === "undefined");
});

Deno.test("gets position from node", () => {
  const root = parse("a{}");
  const warning = new Warning("text", { node: root.first });
  assertEquals(warning.line, 1);
  assertEquals(warning.column, 1);
});

Deno.test("gets position from word", () => {
  const root = parse("a b{}");
  const warning = new Warning("text", { node: root.first, word: "b" });
  assertEquals(warning.line, 1);
  assertEquals(warning.column, 3);
});

Deno.test("gets position from index", () => {
  const root = parse("a b{}");
  const warning = new Warning("text", { node: root.first, index: 2 });
  assertEquals(warning.line, 1);
  assertEquals(warning.column, 3);
});
