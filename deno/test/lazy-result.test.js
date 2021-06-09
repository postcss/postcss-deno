import { assert, assertEquals } from "./deps.js";
import { SourceMapGenerator } from "../lib/source_map.ts";
import LazyResult from "../lib/lazy-result.js";
import Processor from "../lib/processor.js";

const processor = new Processor();

Deno.test("contains AST", () => {
  const result = new LazyResult(processor, "a {}", {});
  assertEquals(result.root.type, "root");
});

Deno.test("will stringify css", () => {
  const result = new LazyResult(processor, "a {}", {});
  assertEquals(result.css, "a {}");
});

Deno.test("stringifies css", () => {
  const result = new LazyResult(processor, "a {}", {});
  assertEquals(`${result}`, result.css);
});

Deno.test("has content alias for css", () => {
  const result = new LazyResult(processor, "a {}", {});
  assertEquals(result.content, "a {}");
});

Deno.test("has map only if necessary", () => {
  const result1 = new LazyResult(processor, "", {});
  assert(typeof result1.map === "undefined");

  const result2 = new LazyResult(processor, "", {});
  assert(typeof result2.map === "undefined");

  const result3 = new LazyResult(processor, "", { map: { inline: false } });
  assert(result3.map instanceof SourceMapGenerator);
});

Deno.test("contains options", () => {
  const result = new LazyResult(processor, "a {}", { to: "a.css" });
  assertEquals(result.opts, { to: "a.css" });
});

Deno.test("contains warnings", () => {
  const result = new LazyResult(processor, "a {}", {});
  assertEquals(result.warnings(), []);
});

Deno.test("contains messages", () => {
  const result = new LazyResult(processor, "a {}", {});
  assertEquals(result.messages, []);
});
