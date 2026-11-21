import { test } from "node:test";
import assert from "node:assert";
import { formatSkywards } from "./skywardsFormat.js";

test("empty or missing input stays empty", () => {
  assert.strictEqual(formatSkywards(""), "");
  assert.strictEqual(formatSkywards(undefined), "");
  assert.strictEqual(formatSkywards(null), "");
});

test("digits get the EK prefix and the spacing as the user types", () => {
  assert.strictEqual(formatSkywards("1"), "EK 1");
  assert.strictEqual(formatSkywards("1234"), "EK 1234");
  assert.strictEqual(formatSkywards("12345"), "EK 1234 5");
  assert.strictEqual(formatSkywards("00000001"), "EK 0000 0001");
});

test("a full number stays the same", () => {
  assert.strictEqual(formatSkywards("EK 0000 0001"), "EK 0000 0001");
});

test("typing EK first or pasting without spaces still works", () => {
  assert.strictEqual(formatSkywards("ek00000001"), "EK 0000 0001");
  assert.strictEqual(formatSkywards("EK-0000-0001"), "EK 0000 0001");
  assert.strictEqual(formatSkywards("EK 12"), "EK 12");
});

test("letters and symbols are ignored", () => {
  assert.strictEqual(formatSkywards("abc"), "");
  assert.strictEqual(formatSkywards("EK 12ab34"), "EK 1234");
  assert.strictEqual(formatSkywards("EK "), "");
});

test("more than 8 digits are cut off", () => {
  assert.strictEqual(formatSkywards("EK 0000 000123"), "EK 0000 0001");
});

test("deleting back through the spaces behaves", () => {
  assert.strictEqual(formatSkywards("EK 1234 "), "EK 1234");
  assert.strictEqual(formatSkywards("EK "), "");
});
