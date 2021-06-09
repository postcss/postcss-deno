import { assertEquals } from "./deps.js";
import postcss, { Result, Root, Warning } from "../mod.js";
import Processor from "../lib/processor.js";

const processor = new Processor();
const root = new Root();

Deno.test("stringifies", () => {
  const result = new Result(processor, root, {});
  result.css = "a{}";
  assertEquals(`${result}`, result.css);
});

Deno.test("adds warning", () => {
  let warning;
  const plugin = {
    postcssPlugin: "test-plugin",
    Once(css, { result }) {
      warning = result.warn("test", { node: css.first });
    },
  };
  const result = postcss([plugin]).process("a{}").sync();

  assertEquals(
    warning,
    new Warning("test", {
      plugin: "test-plugin",
      node: result.root.first,
    }),
  );

  assertEquals(result.messages, [warning]);
});

Deno.test("allows to override plugin", () => {
  const plugin = {
    postcssPlugin: "test-plugin",
    Once(_css, { result }) {
      result.warn("test", { plugin: "test-plugin#one" });
    },
  };
  const result = postcss([plugin]).process("a{}").sync();

  assertEquals(result.messages[0].plugin, "test-plugin#one");
});

Deno.test("allows Root", () => {
  const css = postcss.parse("a{}");
  const result = new Result(processor, css, {});
  result.warn("TT", { node: css.first });

  assertEquals(result.messages[0].toString(), "<css input>:1:1: TT");
});

Deno.test("returns only warnings", () => {
  const result = new Result(processor, root, {});
  result.messages = [
    { type: "warning", text: "a" },
    { type: "custom" },
    { type: "warning", text: "b" },
  ];
  assertEquals(result.warnings(), [
    { type: "warning", text: "a" },
    { type: "warning", text: "b" },
  ]);
});
