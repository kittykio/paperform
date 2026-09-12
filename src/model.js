import { fonts, patterns, sanitizeMaterials } from "./library.js";
import { validateMotion } from "./motion-model.js";
export const palettes = [
  { name: "Blueprint", paper: "#b9d5ff", ink: "#142955", accent: "#7860cf" },
  { name: "Butter & ink", paper: "#f4dc83", ink: "#353124", accent: "#8461c7" },
  { name: "Lilac", paper: "#ddc7f2", ink: "#48325b", accent: "#3d8070" },
  { name: "Matcha", paper: "#cce0ae", ink: "#304931", accent: "#8763b8" },
  { name: "Apricot", paper: "#f1c4a0", ink: "#573e30", accent: "#526cc1" },
];
palettes.push(
  { name: "Midnight", paper: "#203354", ink: "#e4edff", accent: "#e6b36a" },
  { name: "Rose", paper: "#edc4d4", ink: "#55354b", accent: "#7766bc" },
  { name: "Ocean", paper: "#afdcd9", ink: "#204b50", accent: "#9a6baf" },
  { name: "Parchment", paper: "#efe2c7", ink: "#493c30", accent: "#74834a" },
  { name: "Monochrome", paper: "#eeeeea", ink: "#242428", accent: "#777784" },
);
export function cardColors(state) {
  return { ...palettes[state.palette], ...state.customColors };
}
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
templates.push(
  {
    id: "birthday",
    name: "Another trip around the sun",
    kind: "Pop-up",
    title: "HAPPY\nBIRTHDAY!",
    note: "Here’s to your next brilliant chapter.",
    eyebrow: "MAKE A WISH",
    palette: 1,
    fold: "popup",
    motif: "none",
    font: "bebas",
    pattern: "confetti",
    frame: "double",
    stickers: [
      {
        kind: "sun",
        x: 0.85,
        y: 0.72,
        size: 60,
        rotation: 12,
        color: "#9867cb",
      },
    ],
  },
  {
    id: "opening",
    name: "Opening night",
    kind: "Gatefold",
    title: "AFTER\nHOURS.",
    note: "Art, conversation, and a very good night.",
    eyebrow: "AN EXHIBITION / OPENING NIGHT",
    palette: 2,
    fold: "gate",
    motif: "star",
    font: "rubik",
    pattern: "grid",
    frame: "corners",
  },
  {
    id: "weekend",
    name: "Slow weekend",
    kind: "Pop-up",
    title: "Take it\neasy.",
    note: "A little room for doing nothing.",
    eyebrow: "OUT OF OFFICE",
    palette: 3,
    fold: "popup",
    motif: "none",
    font: "script",
    pattern: "speckle",
    frame: "none",
    stickers: [
      {
        kind: "cloud",
        x: 0.83,
        y: 0.72,
        size: 65,
        rotation: -10,
        color: "#4b9078",
      },
    ],
  },
  {
    id: "market",
    name: "Sunday market",
    kind: "Accordion",
    title: "GOOD\nTHINGS.",
    note: "Local makers. Fresh finds. Come along.",
    eyebrow: "SUNDAY / 10 AM – 4 PM",
    palette: 4,
    fold: "accordion",
    motif: "flower",
    font: "space",
    pattern: "stripes",
    frame: "line",
  },
  {
    id: "letter",
    name: "A letter to you",
    kind: "Gatefold",
    title: "Dear\nfriend,",
    note: "Some things are better said on paper.",
    eyebrow: "A NOTE WORTH KEEPING",
    palette: 2,
    fold: "gate",
    motif: "heart",
    font: "fraunces",
    pattern: "plain",
    frame: "double",
  },
  {
    id: "launch",
    name: "Something new",
    kind: "Accordion",
    title: "NEXT\nCHAPTER.",
    note: "The beginning of something good.",
    eyebrow: "READY WHEN YOU ARE",
    palette: 0,
    fold: "accordion",
    motif: "none",
    font: "dm",
    pattern: "checker",
    frame: "corners",
    stickers: [
      {
        kind: "arrow",
        x: 0.86,
        y: 0.75,
        size: 60,
        rotation: -35,
        color: "#9867cb",
      },
    ],
  },
);
const templateDirections = [
 {palette:1,font:'bebas',layout:'split',title:'HELLO,\nSUNSHINE.',pattern:'plain',motif:'none',stickers:[{kind:'sun',x:.8,y:.46,size:135,rotation:0,color:'#8a6ac1'}]},
 {palette:5,font:'rubik',layout:'poster',title:'MAKE\nSOME\nNOISE.',pattern:'grid',motif:'none',stickers:[{kind:'bolt',x:.88,y:.76,size:75,rotation:12,color:'#e6b36a'}]},
 {palette:6,font:'script',layout:'center',title:'You & me.',pattern:'plain',motif:'none',frame:'double',stickers:[{kind:'heart',x:.5,y:.7,size:50,rotation:0,color:'#93658b'}]},
 {palette:3,font:'space',layout:'left',title:'a big\nlittle thanks.',pattern:'speckle',motif:'none',frame:'corners',stickers:[{kind:'clover',x:.84,y:.67,size:95,rotation:-18,color:'#658556'}]},
 {palette:4,font:'bebas',layout:'poster',title:'ANOTHER\nGREAT YEAR.',pattern:'confetti',motif:'none',frame:'none',stickers:[{kind:'star',x:.88,y:.22,size:45,rotation:15,color:'#526cc1'}]},
 {palette:9,font:'dm',layout:'left',title:'AFTER\nHOURS_01',pattern:'plain',motif:'none',frame:'line',stickers:[{kind:'circle',x:.83,y:.44,size:125,rotation:0,color:'#929099'}]},
 {palette:7,font:'script',layout:'split',title:'Take it\neasy.',pattern:'waves',motif:'none',frame:'none',stickers:[{kind:'cloud',x:.82,y:.43,size:120,rotation:-8,color:'#568f9a'}]},
 {palette:0,font:'space',layout:'center',title:'THE SUNDAY\nMARKET',pattern:'stripes',motif:'none',frame:'double',stickers:[{kind:'flower',x:.12,y:.7,size:44,rotation:0,color:'#7860cf'},{kind:'flower',x:.88,y:.7,size:44,rotation:20,color:'#7860cf'}]},
 {palette:8,font:'fraunces',layout:'letter',title:'Dear friend,',pattern:'speckle',motif:'none',frame:'none',stickers:[{kind:'heart',x:.84,y:.76,size:28,rotation:-10,color:'#74834a'}]},
 {palette:2,font:'rubik',layout:'split',title:'NEXT\nCHAPTER.',pattern:'checker',motif:'none',frame:'corners',stickers:[{kind:'arrow',x:.84,y:.44,size:105,rotation:-35,color:'#3d8070'}]},
];
templates.forEach((t,i)=>Object.assign(t,templateDirections[i]));
export const defaults = {
  ...templates[0],
  frame: "none",
  stickers: structuredClone(templates[0].stickers??[]),
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
    layout:["center","split","poster","left","letter"],
    motif: ["flower", "star", "heart", "none"],
    font: Object.keys(fonts),
    pattern: patterns,
  }))
    if (options.includes(value[key])) result[key] = value[key];
  for (const [key, min, max] of [
    ["palette", 0, palettes.length - 1],
    ["size", 34, 88],
    ["opening", 0, 100],
    ["rotation", -25, 25],
  ])
    if (Number.isFinite(value[key]))
      result[key] = Math.max(min, Math.min(max, value[key]));
  result.palette = Math.round(result.palette);
  if (value.customColors && typeof value.customColors === "object") {
    const colors = {};
    for (const key of ["paper", "ink", "accent"])
      if (/^#[0-9a-f]{6}$/i.test(value.customColors[key]))
        colors[key] = value.customColors[key];
    if (Object.keys(colors).length) result.customColors = colors;
  }
  Object.assign(result, sanitizeMaterials(value));
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
