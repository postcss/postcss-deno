import { assertEquals } from "./deps.js";
import { Comment, parse } from "../mod.js";

Deno.test("toString() inserts default spaces", () => {
  let comment = new Comment({ text: "hi" });
  assertEquals(comment.toString(), "/* hi */");
});

Deno.test("toString() clones spaces from another comment", () => {
  let root = parse("a{} /*hello*/");
  let comment = new Comment({ text: "world" });
  root.append(comment);

  assertEquals(root.toString(), "a{} /*hello*/ /*world*/");
});
