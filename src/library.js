export const fonts = {
  serif: { name: "Classic serif", family: "Georgia" },
  sans: { name: "Clean sans", family: "Arial" },
  mono: { name: "Typewriter", family: "monospace" },
  bebas: { name: "Bebas Neue", family: '"Bebas Neue"' },
  space: { name: "Space Grotesk", family: '"Space Grotesk"' },
  fraunces: { name: "Fraunces", family: '"Fraunces"' },
  dm: { name: "DM Mono", family: '"DM Mono"' },
  rubik: { name: "Rubik Mono One", family: '"Rubik Mono One"' },
  script: { name: "Pacifico", family: '"Pacifico"' },
};
export const patterns = [
  "plain",
  "dots",
  "grid",
  "stripes",
  "confetti",
  "checker",
  "speckle",
  "waves",
];
export const stickers = [
  ["spark", "✦", "Spark"],
  ["star", "★", "Star"],
  ["heart", "♥", "Heart"],
  ["flower", "✿", "Flower"],
  ["sun", "☀", "Sun"],
  ["moon", "☾", "Moon"],
  ["cloud", "☁", "Cloud"],
  ["bolt", "ϟ", "Lightning"],
  ["arrow", "➜", "Arrow"],
  ["burst", "✺", "Burst"],
  ["diamond", "◆", "Diamond"],
  ["circle", "●", "Circle"],
  ["smile", "☺", "Smile"],
  ["music", "♫", "Music"],
  ["peace", "☮", "Peace"],
  ["snow", "❄", "Snowflake"],
  ["clover", "♣", "Clover"],
  ["infinity", "∞", "Infinity"],
];
export const stickerColors = [
  "#5687ff",
  "#9867cb",
  "#4b9078",
  "#d1aa44",
  "#e3a979",
  "#273f65",
  "#ffffff",
];
export function sanitizeMaterials(value) {
  const n = (v, d, min, max) =>
    Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : d;
  return {
    frame: ["none", "line", "double", "dashed", "corners"].includes(value.frame)
      ? value.frame
      : "none",
    stickers: Array.isArray(value.stickers)
      ? value.stickers
          .slice(0, 12)
          .filter((s) => s && stickers.some(([id]) => id === s.kind))
          .map((s) => ({
            kind: s.kind,
            x: n(s.x, 0.8, 0, 1),
            y: n(s.y, 0.75, 0, 1),
            size: n(s.size, 65, 20, 160),
            rotation: n(s.rotation, 0, -180, 180),
            color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : "#5687ff",
          }))
      : [],
  };
}
export function paintMaterials(ctx, w, h, state, palette) {
  ctx.save();
  ctx.scale(w / 480, h / 340);
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, 480, 340);
  ctx.strokeStyle = palette.ink + "25";
  ctx.fillStyle = palette.ink + "20";
  ctx.lineWidth = 1;
  const pattern = state.pattern;
  if (pattern === "grid" || pattern === "dots" || pattern === "checker")
    for (let x = 0; x < 480; x += 18)
      for (let y = 0; y < 340; y += 18) {
        if (pattern === "dots") {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, 7);
          ctx.fill();
        } else if (pattern === "checker") {
          if ((x / 18 + y / 18) % 2 === 0) ctx.fillRect(x, y, 18, 18);
        } else ctx.strokeRect(x, y, 18, 18);
      }
  if (pattern === "stripes")
    for (let x = -340; x < 480; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 340, 340);
      ctx.stroke();
    }
  if (pattern === "speckle" || pattern === "confetti")
    for (let i = 0; i < 240; i++) {
      const x = (i * 127.31) % 480,
        y = (i * 73.17) % 340;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(i);
      ctx.fillStyle =
        pattern === "confetti"
          ? [palette.ink + "28", palette.accent + "55", "#ffffff66"][i % 3]
          : palette.ink + "28";
      ctx.fillRect(
        0,
        0,
        pattern === "confetti" ? 5 : 1.5,
        pattern === "confetti" ? 2 : 1.5,
      );
      ctx.restore();
    }
  if (pattern === "waves")
    for (let y = 0; y < 350; y += 18) {
      ctx.beginPath();
      for (let x = 0; x < 480; x += 2) ctx.lineTo(x, y + Math.sin(x / 16) * 4);
      ctx.stroke();
    }
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.5;
  if (state.frame === "dashed") ctx.setLineDash([5, 4]);
  if (["line", "double", "dashed"].includes(state.frame))
    ctx.strokeRect(11, 11, 458, 318);
  if (state.frame === "double") ctx.strokeRect(16, 16, 448, 308);
  if (state.frame === "corners")
    for (const [x, y, sx, sy] of [
      [12, 12, 1, 1],
      [468, 12, -1, 1],
      [12, 328, 1, -1],
      [468, 328, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(x + 25 * sx, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + 25 * sy);
      ctx.stroke();
    }
  ctx.setLineDash([]);
  for (const s of state.stickers ?? []) {
    ctx.save();
    ctx.translate(s.x * 480, s.y * 340);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.fillStyle = s.color;
    ctx.font = `${s.size}px "Arial Unicode MS",Arial,sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(stickers.find(([id]) => id === s.kind)?.[1] ?? "", 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
