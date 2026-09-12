import { validateMotion } from "./motion-model.js";
export const palettes = [
  { name: "Blueprint", paper: "#b9d5ff", ink: "#142955", accent: "#436bdf" },
  { name: "Electric", paper: "#446eff", ink: "#071431", accent: "#b5e7ff" },
  { name: "Periwinkle", paper: "#c9caff", ink: "#303878", accent: "#697be8" },
  { name: "Glacier", paper: "#a6e1ed", ink: "#164650", accent: "#487de2" },
  { name: "Midnight", paper: "#203354", ink: "#d9e9ff", accent: "#86aaff" },
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
  if (value.motion) result.motion = validateMotion(value.motion);
  return result;
}
export function encode(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(validate(value)));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}
export function decode(value) {
  if (value.length > 24000) throw Error("This design link is too large.");
  return validate(
    JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(value), (c) => c.charCodeAt(0)),
      ),
    ),
  );
}
