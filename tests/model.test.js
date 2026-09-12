import { test } from "node:test";
import assert from "node:assert/strict";
import { defaults, validate, encode, decode, palettes } from "../src/model.js";
test("Unicode designs survive sharing", () => {
  const state = { ...defaults, title: "こんにちは 🌷\nFor you" };
  assert.deepEqual(decode(encode(state)), validate(state));
});
test("Imported controls are bounded and unknown fields discarded", () => {
  const state = validate({
    opening: 500,
    size: -1,
    palette: 80,
    font: "unsafe",
    title: "x".repeat(200),
    unexpected: "value",
  });
  assert.equal(state.opening, 100);
  assert.equal(state.size, 34);
  assert.equal(state.palette, palettes.length - 1);
  assert.equal(state.font, defaults.font);
  assert.equal(state.title.length, 90);
  assert.equal(state.unexpected, undefined);
});
test("Reject invalid design envelopes", () => {
  assert.throws(() => validate(null));
  assert.throws(() => validate([]));
  assert.throws(() => decode("bad"));
  assert.throws(() => decode("a".repeat(6001)));
});
