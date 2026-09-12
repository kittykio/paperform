import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  validateMotion,
  progress,
  pack,
  unpack,
} from "../src/motion-model.js";
import { validate, encode, decode, defaults } from "../src/model.js";
test("Motion links preserve Unicode, layer timing and effect parameters", () => {
  const d = initial();
  d.layers[0].text = "動く文字 🌊";
  d.layers[0].start = 2;
  d.layers[0].originX = 0.2;
  assert.deepEqual(unpack(pack(d)), validateMotion(d));
});
test("Imported timelines remain bounded and ordered", () => {
  const d = initial();
  d.duration = 99;
  d.layers[0].start = 100;
  d.layers[0].end = -2;
  d.layers[0].size = 999;
  d.format = "constructor";
  const v = validateMotion(d);
  assert.equal(v.duration, 20);
  assert.equal(v.format, "square");
  assert.equal(v.layers[0].size, 240);
  assert.ok(v.layers[0].end > v.layers[0].start);
  assert.ok(v.layers[0].end <= 20);
});
test("Easing has consistent endpoints and remains bounded", () => {
  for (const easing of ["linear", "smooth", "bounce"]) {
    const l = { start: 2, end: 4, easing };
    assert.equal(progress(l, 0), 0);
    assert.equal(progress(l, 5), 1);
    for (let t = 2; t <= 4; t += 0.01)
      assert.ok(progress(l, t) >= 0 && progress(l, t) <= 1);
  }
});
test("Card backups retain linked motion configuration", () => {
  const card = { ...defaults, motion: initial() };
  card.motion.fold = true;
  assert.deepEqual(decode(encode(card)), validate(card));
});
test("Reject malformed or excessive motion links", () => {
  assert.throws(() => validateMotion({ layers: [] }));
  assert.throws(() => unpack("a".repeat(18001)));
});
