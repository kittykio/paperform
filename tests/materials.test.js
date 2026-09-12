import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fonts,
  patterns,
  stickers,
  sanitizeMaterials,
} from "../src/library.js";
import { templates, validate, encode, decode, defaults } from "../src/model.js";
import { initial, validateMotion } from "../src/motion-model.js";
test("All new templates and fonts survive a saved design roundtrip", () => {
  for (const template of templates) {
    const design = validate({ ...defaults, ...template });
    assert.deepEqual(decode(encode(design)), design);
  }
  for (const font of Object.keys(fonts))
    assert.equal(validate({ ...defaults, font }).font, font);
});
test("Decoration imports constrain sizes and discard unknown stickers", () => {
  const result = sanitizeMaterials({
    frame: "script",
    stickers: [
      { kind: "star", x: 99, y: -9, size: 999, rotation: 500, color: "bad" },
      { kind: "unknown" },
    ],
  });
  assert.equal(result.frame, "none");
  assert.equal(result.stickers.length, 1);
  assert.equal(result.stickers[0].x, 1);
  assert.equal(result.stickers[0].size, 160);
  assert.equal(result.stickers[0].rotation, 180);
});
test("Font families are accepted by motion design validation", () => {
  for (const f of Object.values(fonts)) {
    const d = initial();
    d.layers[0].font = f.family;
    assert.equal(validateMotion(d).layers[0].font, f.family);
  }
});
test("Creative library exposes unique identifiers and bounded sticker lists", () => {
  assert.equal(new Set(stickers.map((s) => s[0])).size, stickers.length);
  assert.equal(new Set(patterns).size, patterns.length);
  assert.equal(
    sanitizeMaterials({ stickers: Array(20).fill({ kind: "star" }) }).stickers
      .length,
    12,
  );
});

test("Custom card colors survive links and reject unsafe or malformed values", () => {
  const v = validate({
    ...defaults,
    customColors: {
      paper: "#123456",
      ink: "#fedcba",
      accent: "bad",
      unknown: "#112233",
    },
  });
  assert.deepEqual(v.customColors, { paper: "#123456", ink: "#fedcba" });
  assert.deepEqual(decode(encode(v)), v);
});
