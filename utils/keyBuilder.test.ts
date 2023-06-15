import { assertEquals, assertNotEquals } from "$std/testing/asserts.ts";
import { $key } from "./keyBuilder.ts";

Deno.test("key builder test", () => {
  assertEquals($key().my.key(), ["my", "key"]);
});

Deno.test("key builder test 2", () => {
  assertNotEquals($key().my.key(), []);
});
