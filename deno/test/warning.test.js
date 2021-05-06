import { assert, assertEquals } from "./deps.js";
import { resolve } from "../lib/deps.js";
import { decl, parse, Warning } from "../mod.js";

Deno.test("outputs simple warning", () => {
  let warning = new Warning("text");
  assertEquals(warning.toString(), "text");
});

Deno.test("outputs warning with plugin", () => {
  let warning = new Warning("text", { plugin: "plugin" });
  assertEquals(warning.toString(), "plugin: text");
});

Deno.test("outputs warning with position", () => {
  let root = parse("a{}");
  let warning = new Warning("text", { node: root.first });
  assertEquals(warning.toString(), "<css input>:1:1: text");
});

Deno.test("outputs warning with plugin and node", () => {
  let file = resolve("a.css");
  let root = parse("a{}", { from: file });
  let warning = new Warning("text", {
    plugin: "plugin",
    node: root.first,
  });
  assertEquals(warning.toString(), `plugin: ${file}:1:1: text`);
});

Deno.test("outputs warning with index", () => {
  let file = resolve("a.css");
  let root = parse("@rule param {}", { from: file });
  let warning = new Warning("text", {
    plugin: "plugin",
    node: root.first,
    index: 7,
  });
  assertEquals(warning.toString(), `plugin: ${file}:1:8: text`);
});

Deno.test("outputs warning with word", () => {
  let file = resolve("a.css");
  let root = parse("@rule param {}", { from: file });
  let warning = new Warning("text", {
    plugin: "plugin",
    node: root.first,
    word: "am",
  });
  assertEquals(warning.toString(), `plugin: ${file}:1:10: text`);
});

Deno.test("generates warning without source", () => {
  let node = decl({ prop: "color", value: "black" });
  let warning = new Warning("text", { node });
  assertEquals(warning.toString(), "<css input>: text");
});

Deno.test("has line and column is undefined by default", () => {
  let warning = new Warning("text");
  assert(typeof warning.line === "undefined");
  assert(typeof warning.column === "undefined");
});

Deno.test("gets position from node", () => {
  let root = parse("a{}");
  let warning = new Warning("text", { node: root.first });
  assertEquals(warning.line, 1);
  assertEquals(warning.column, 1);
});

Deno.test("gets position from word", () => {
  let root = parse("a b{}");
  let warning = new Warning("text", { node: root.first, word: "b" });
  assertEquals(warning.line, 1);
  assertEquals(warning.column, 3);
});

Deno.test("gets position from index", () => {
  let root = parse("a b{}");
  let warning = new Warning("text", { node: root.first, index: 2 });
  assertEquals(warning.line, 1);
  assertEquals(warning.column, 3);
});
