import { assertEquals } from "./deps.js";
import { list } from "../mod.js";

Deno.test("space() splits list by spaces", () => {
  assertEquals(list.space("a b"), ["a", "b"]);
});

Deno.test("space() trims values", () => {
  assertEquals(list.space(" a  b "), ["a", "b"]);
});

Deno.test("space() checks quotes", () => {
  assertEquals(list.space('"a b\\"" \'\''), ['"a b\\""', "''"]);
});

Deno.test("space() checks functions", () => {
  assertEquals(list.space("f( )) a( () )"), ["f( ))", "a( () )"]);
});

Deno.test("space() works from variable", () => {
  let space = list.space;
  assertEquals(space("a b"), ["a", "b"]);
});

Deno.test("comma() splits list by spaces", () => {
  assertEquals(list.comma("a, b"), ["a", "b"]);
});

Deno.test("comma() adds last empty", () => {
  assertEquals(list.comma("a, b,"), ["a", "b", ""]);
});

Deno.test("comma() checks quotes", () => {
  assertEquals(list.comma('"a,b\\"", \'\''), ['"a,b\\""', "''"]);
});

Deno.test("comma() checks functions", () => {
  assertEquals(list.comma("f(,)), a(,(),)"), ["f(,))", "a(,(),)"]);
});

Deno.test("comma() works from variable", () => {
  let comma = list.comma;
  assertEquals(comma("a, b"), ["a", "b"]);
});
