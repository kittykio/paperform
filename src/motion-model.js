export const formats = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1440, 810],
};
export const effects = ["wave", "spring", "liquid", "particles", "none"];
export const initial = () => ({
  version: 1,
  format: "square",
  background: "#101b33",
  duration: 6,
  loop: true,
  fold: false,
  layers: [
    {
      id: 1,
      text: "MAKE\nWAVES.",
      x: 0.5,
      y: 0.43,
      size: 140,
      rotation: -6,
      color: "#c8deff",
      font: "Impact",
      effect: "wave",
      intensity: 45,
      start: 0,
      end: 6,
      easing: "smooth",
      originX: 0.5,
      originY: 0.5,
    },
    {
      id: 2,
      text: "WORDS OFF THE PAGE / PAPERFORM",
      x: 0.5,
      y: 0.84,
      size: 25,
      rotation: 0,
      color: "#c8deff",
      font: "monospace",
      effect: "spring",
      intensity: 30,
      start: 1,
      end: 6,
      easing: "smooth",
      originX: 0.5,
      originY: 0.5,
    },
  ],
});
export function validateMotion(v) {
  if (!v || !Array.isArray(v.layers) || !v.layers.length)
    throw Error("Invalid motion design");
  const n = (a, d, min, max) =>
    Number.isFinite(a) ? Math.max(min, Math.min(max, a)) : d;
  const hex = (a, d) => (/^#[0-9a-f]{6}$/i.test(a) ? a : d);
  const duration = n(v.duration, 6, 2, 20);
  return {
    version: 1,
    format: Object.hasOwn(formats, v.format) ? v.format : "square",
    background: hex(v.background, "#101b33"),
    duration,
    loop: v.loop !== false,
    fold: !!v.fold,
    foldLayer: Math.floor(
      n(v.foldLayer, 0, 0, Math.min(v.layers.length, 8) - 1),
    ),
    layers: v.layers
      .slice(0, 8)
      .map((l, i) => ({
        id: i + 1,
        text: String(l.text ?? "TYPE").slice(0, 120),
        x: n(l.x, 0.5, 0, 1),
        y: n(l.y, 0.5, 0, 1),
        size: n(l.size, 100, 16, 240),
        rotation: n(l.rotation, 0, -180, 180),
        color: hex(l.color, "#c8deff"),
        font: ["Impact", "Georgia", "monospace"].includes(l.font)
          ? l.font
          : "Impact",
        effect: effects.includes(l.effect) ? l.effect : "wave",
        intensity: n(l.intensity, 40, 0, 100),
        start: n(l.start, 0, 0, duration - 0.1),
        end: n(l.end, duration, 0.1, duration),
        easing: ["linear", "smooth", "bounce"].includes(l.easing)
          ? l.easing
          : "smooth",
        originX: n(l.originX, 0.5, 0, 1),
        originY: n(l.originY, 0.5, 0, 1),
      }))
      .map((l) => ({ ...l, end: Math.max(l.start + 0.1, l.end) })),
  };
}
export function progress(layer, time) {
  const t = Math.max(
    0,
    Math.min(1, (time - layer.start) / (layer.end - layer.start)),
  );
  return layer.easing === "smooth"
    ? t * t * (3 - 2 * t)
    : layer.easing === "bounce"
      ? 1 - Math.pow(1 - t, 2) * Math.abs(Math.cos(t * Math.PI * 3))
      : t;
}
export function pack(v) {
  return btoa(
    Array.from(
      new TextEncoder().encode(JSON.stringify(validateMotion(v))),
      (b) => String.fromCharCode(b),
    ).join(""),
  );
}
export function unpack(s) {
  if (s.length > 18000) throw Error("Design too large");
  return validateMotion(
    JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
      ),
    ),
  );
}
