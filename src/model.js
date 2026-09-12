export const palettes = [
  { name: "Botanical", paper: "#e6edb6", ink: "#294d3b", accent: "#ff7855" },
  { name: "Studio blue", paper: "#c7d8f0", ink: "#203f82", accent: "#ff795d" },
  { name: "Rosewater", paper: "#f4d3cf", ink: "#963c4f", accent: "#c35332" },
  { name: "Butter", paper: "#f5df92", ink: "#5c452b", accent: "#e66935" },
  { name: "Midnight", paper: "#303e50", ink: "#f5e7c9", accent: "#f9a76b" },
];
export const templates = [
  {
    id: "bloom",
    name: "A little joy",
    kind: "Pop-up",
    title: "HELLO,\nSUNSHINE.",
    note: "A little paper. A lot of possibility.",
    eyebrow: "A NOTE TO BRIGHTEN YOUR DAY",
    palette: 0,
    fold: "popup",
    motif: "flower",
    font: "serif",
  },
  {
    id: "party",
    name: "You’re invited",
    kind: "Accordion",
    title: "LET’S\nMAKE\nNOISE.",
    note: "Good people. Great music. See you there.",
    eyebrow: "SATURDAY · 7 PM · YOUR PLACE",
    palette: 1,
    fold: "accordion",
    motif: "star",
    font: "sans",
  },
  {
    id: "love",
    name: "For your person",
    kind: "Gatefold",
    title: "YOU + ME.\nALWAYS.",
    note: "My favorite place is wherever you are.",
    eyebrow: "SOMETHING WORTH KEEPING",
    palette: 2,
    fold: "gate",
    motif: "heart",
    font: "serif",
  },
  {
    id: "thanks",
    name: "Big little thanks",
    kind: "Pop-up",
    title: "THANK\nYOU.",
    note: "For all the little things that weren’t little.",
    eyebrow: "A SMALL GESTURE, JUST FOR YOU",
    palette: 3,
    fold: "popup",
    motif: "flower",
    font: "sans",
  },
];
export const defaults = {
  ...templates[0],
  size: 66,
  opening: 78,
  pattern: "plain",
  signature: "Made with a little wonder",
  rotation: -9,
};
export function validate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("This isn’t a Paperform design.");
  const result = { ...defaults };
  for (const key of ["title", "note", "eyebrow", "signature"])
    if (typeof value[key] === "string")
      result[key] = value[key].slice(0, key === "title" ? 90 : 160);
  for (const [key, options] of Object.entries({
    fold: ["popup", "accordion", "gate"],
    motif: ["flower", "star", "heart", "none"],
    font: ["serif", "sans", "mono"],
    pattern: ["plain", "dots", "grid"],
  }))
    if (options.includes(value[key])) result[key] = value[key];
  for (const [key, min, max] of [
    ["palette", 0, 4],
    ["size", 34, 88],
    ["opening", 0, 100],
    ["rotation", -25, 25],
  ])
    if (Number.isFinite(value[key]))
      result[key] = Math.max(min, Math.min(max, value[key]));
  result.palette = Math.round(result.palette);
  return result;
}
export function encode(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(validate(value)));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}
export function decode(value) {
  if (value.length > 6000) throw Error("This design link is too large.");
  return validate(
    JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(value), (c) => c.charCodeAt(0)),
      ),
    ),
  );
}
