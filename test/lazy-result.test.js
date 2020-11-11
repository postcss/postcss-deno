import { assert, assertEquals } from "./deps.js";
import { mozilla } from "../lib/deps.js";
import LazyResult from "../lib/lazy-result.js";
import Processor from "../lib/processor.js";

let processor = new Processor();

Deno.test("contains AST", () => {
  let result = new LazyResult(processor, "a {}", {});
  assertEquals(result.root.type, "root");
});

Deno.test("will stringify css", () => {
  let result = new LazyResult(processor, "a {}", {});
  assertEquals(result.css, "a {}");
});

Deno.test("stringifies css", () => {
  let result = new LazyResult(processor, "a {}", {});
  assertEquals(`${result}`, result.css);
});

Deno.test("has content alias for css", () => {
  let result = new LazyResult(processor, "a {}", {});
  assertEquals(result.content, "a {}");
});

Deno.test("has map only if necessary", () => {
  let result1 = new LazyResult(processor, "", {});
  assert(typeof result1.map === "undefined");

  let result2 = new LazyResult(processor, "", {});
  assert(typeof result2.map === "undefined");

  let result3 = new LazyResult(processor, "", { map: { inline: false } });
  assert(result3.map instanceof mozilla.SourceMapGenerator);
});

Deno.test("contains options", () => {
  let result = new LazyResult(processor, "a {}", { to: "a.css" });
  assertEquals(result.opts, { to: "a.css" });
});

Deno.test("contains warnings", () => {
  let result = new LazyResult(processor, "a {}", {});
  assertEquals(result.warnings(), []);
});

Deno.test("contains messages", () => {
  let result = new LazyResult(processor, "a {}", {});
  assertEquals(result.messages, []);
});
