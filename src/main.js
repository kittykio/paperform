import {
  fonts,
  patterns,
  stickers,
  stickerColors,
  paintMaterials,
} from "./library.js";
import "./fonts.css";
import "./materials.css";
let selectedSticker = 0;
import { mountMotion } from "./motion.js";
let motion;
import "./style.css";
import "./studio.css";
import {
  palettes,
  templates,
  defaults,
  validate,
  encode,
  decode,
} from "./model.js";
let state = { ...defaults },
  playing = false,
  frame,
  last = 0,
  direction = 1,
  tab = "design";
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let startMessage = "";
try {
  if (location.hash.startsWith("#design="))
    state = decode(location.hash.slice(8));
  else if (localStorage.getItem("paperform-v1"))
    state = validate(JSON.parse(localStorage.getItem("paperform-v1")));
} catch {
  startMessage =
    "Couldn’t load that design. Your studio is ready for a fresh start.";
}
$("#app").innerHTML =
  `<header><a class="brand" href="${location.pathname}"><img src="/mark.svg" alt="">paperform<span>STUDIO</span></a><span class="header-note">WORDS OFF THE PAGE.</span><div class="header-actions"><span id="saved">Saved on this device</span><button id="share">↗ Share design</button><button class="primary" id="export">Export <span>↓</span></button></div></header><main><div class="intro"><div><p class="kicker">INDEPENDENT PAPER & TYPE STUDIO / VOL. 01</p><h1>THINK FLAT.<br><em>MAKE LOUD.</em></h1><p>TYPE IT. FOLD IT. SEND IT. — Give your words a third dimension.</p></div><button id="new" class="quiet">↺ Start fresh</button></div><section class="workspace"><aside class="editor"><div class="tabs"><button data-tab="design" class="active">Design</button><button data-tab="paper">Paper & fold</button><button data-tab="materials">Materials</button></div><div id="controls"></div><div class="editor-tip"><span>✦</span><p>Made to be opened.<br><small>Drag the slider to reveal your creation.</small></p></div></aside><section class="preview" aria-label="Interactive card preview"><div class="preview-top"><span><i></i> LIVE PAPER PREVIEW</span><button id="reset-view" class="quiet">↺ Reset view</button></div><div id="scene"><div id="card"><div class="base"><canvas id="materials-layer" width="960" height="680" aria-hidden="true"></canvas><span class="card-eyebrow"></span><span class="card-note"></span><span class="card-signature"></span><span class="crease"></span></div><div class="art"><div class="motif"></div><h2 id="card-title"></h2></div><div class="flap left"><span>PAPERFORM<br>OPEN A LITTLE WONDER ↗</span></div><div class="flap right"></div></div></div><div class="preview-bottom"><span>YOUR WORDS, WITH ANOTHER DIMENSION</span><label>View <input id="rotation" type="range" min="-25" max="25" aria-label="Rotate preview"></label></div><div class="playback"><button id="play" aria-label="Play unfolding animation">▶</button><span>Closed</span><input id="opening" aria-label="Card opening" type="range" min="0" max="100"><span>Open</span><output id="percent"></output></div></section></section><section class="templates"><div class="section-heading"><h2>GOOD DESIGN STARTS SOMEWHERE.</h2><span>CHOOSE A TEMPLATE, MAKE IT YOURS</span></div><div class="template-grid">${templates.map((t, i) => `<button class="template" data-template="${i}"><div class="mini" style="--paper:${palettes[t.palette].paper};--ink:${palettes[t.palette].ink}"><span>${esc(t.title).replaceAll("\n", "<br>")}</span><b>${{ flower: "✺", star: "✦", heart: "♥", none: "◇" }[t.motif]}</b></div><div class="template-caption"><strong>${t.name}</strong><small>${t.kind} ↗</small></div></button>`).join("")}</div></section></main><footer><a class="brand" href="${location.pathname}"><img src="/mark.svg" alt="">paperform</a><span>NO SMALL IDEAS. JUST SMALL PIECES OF PAPER.</span><span>Crafted in your browser · No account needed</span></footer><div id="toast" role="status"></div><dialog id="export-dialog"><form method="dialog"><button class="close" aria-label="Close export">×</button></form><p class="kicker">SEND A LITTLE WONDER</p><h2>Off the canvas.<br>Into the world.</h2><p>Choose how your creation leaves the studio.</p><button id="png" class="export-option"><b>↓ Image postcard</b><small>A high-resolution PNG of your flat design.</small></button><button id="print" class="export-option"><b>▧ Printable card</b><small>A foldable paper card, with a center-fold guide.</small></button><button id="json" class="export-option"><b>◇ Editable design</b><small>Save a backup and keep creating later.</small></button><label class="import">Import a design <input id="import" type="file" accept=".json,application/json"></label><p class="fine">For an animated reveal, use Share design. Printed cards use a simple center fold.</p></dialog>`;
function notify(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}
function save() {
  if (motion) state.motion = motion.getDesign();
  try {
    localStorage.setItem("paperform-v1", JSON.stringify(state));
    $("#saved").textContent = "Saved on this device";
  } catch {
    $("#saved").textContent = "Storage full · export a backup";
  }
}
function controls() {
  const s = state;
  if (tab === "materials") {
    materialControls();
    return;
  }
  $("#controls").innerHTML =
    tab === "design"
      ? `<div class="control-heading"><span>01</span><h2>Your message</h2></div><label>Small introduction<input data-key="eyebrow" maxlength="160" value="${esc(s.eyebrow)}"></label><label>The big idea <span>MAKE IT PERSONAL</span><textarea data-key="title" rows="3" maxlength="90">${esc(s.title)}</textarea></label><label>A little more to say<textarea data-key="note" rows="2" maxlength="160">${esc(s.note)}</textarea></label><div class="control-heading"><span>02</span><h2>Type with personality</h2></div><label>Font family<select data-key="font">${Object.entries(
          fonts,
        )
          .map(
            ([id, f]) =>
              `<option value="${id}" ${s.font === id ? "selected" : ""}>${f.name}</option>`,
          )
          .join(
            "",
          )}</select></label><div class="font-specimen" style='font-family:${fonts[s.font].family}'>Aa / Make it yours.</div><label class="range-label">Letter size <output id="size-output">${s.size}</output><input type="range" data-key="size" min="34" max="88" value="${s.size}"></label><label>Sign it off<input data-key="signature" maxlength="160" value="${esc(s.signature)}"></label>`
      : `<div class="control-heading"><span>01</span><h2>Pick your paper</h2></div><div class="swatches">${palettes.map((p, i) => `<button data-palette="${i}" aria-label="${p.name}" title="${p.name}" class="${s.palette === i ? "selected" : ""}" style="--swatch:${p.paper};background:${p.paper};color:${p.ink}">Aa</button>`).join("")}</div><p class="fine">${palettes[s.palette].name}</p><label>Paper texture<select data-key="pattern">${patterns.map((v) => `<option ${s.pattern === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><div class="control-heading"><span>02</span><h2>A different dimension</h2></div><div class="fold-options">${[
          ["popup", "↗", "Pop-up", "Words rise from the page"],
          ["accordion", "≋", "Accordion", "A concertina of lettering"],
          ["gate", "◫", "Gatefold", "An opening worth waiting for"],
        ]
          .map(
            ([v, icon, label, desc]) =>
              `<button data-fold="${v}" class="${s.fold === v ? "selected" : ""}"><b>${icon}</b><span>${label}<small>${desc}</small></span></button>`,
          )
          .join(
            "",
          )}</div><label>Paper embellishment<select data-key="motif">${["flower", "star", "heart", "none"].map((v) => `<option ${s.motif === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>`;
}
function render() {
  motion?.syncFold(state.opening);
  const p = palettes[state.palette],
    card = $("#card");
  card.style.setProperty("--paper", p.paper);
  card.style.setProperty("--ink", p.ink);
  card.style.setProperty("--accent", p.accent);
  card.style.setProperty("--open", state.opening / 100);
  card.style.setProperty("--rotation", state.rotation + "deg");
  card.dataset.fold = state.fold;
  card.dataset.pattern = "plain";
  const materials = $("#materials-layer");
  paintMaterials(materials.getContext("2d"), 960, 680, state, p);
  $("#card-title").replaceChildren(
    ...state.title.split("\n").map((line) => {
      const span = document.createElement("span");
      span.className = "type-line";
      span.textContent = line || " ";
      return span;
    }),
  );
  $("#card-title").style.fontFamily = fonts[state.font].family;
  const title = $("#card-title");
  title.style.fontSize = state.size + "px";
  while (
    (title.scrollHeight > 195 || title.scrollWidth > 430) &&
    parseFloat(title.style.fontSize) > 16
  )
    title.style.fontSize = parseFloat(title.style.fontSize) - 1 + "px";
  $(".card-eyebrow").textContent = state.eyebrow;
  $(".card-note").textContent = state.note;
  $(".card-signature").textContent = state.signature;
  $(".motif").textContent = { flower: "✺", star: "✦", heart: "♥", none: "" }[
    state.motif
  ];
  $("#opening").value = state.opening;
  $("#rotation").value = state.rotation;
  $("#percent").textContent = Math.round(state.opening) + "%";
}
function stop() {
  playing = false;
  cancelAnimationFrame(frame);
  $("#play").textContent = "▶";
  $("#play").setAttribute("aria-label", "Play unfolding animation");
}
function animate(time) {
  if (!playing) return;
  state.opening += Math.min(time - last, 40) * 0.025 * direction;
  last = time;
  if (state.opening >= 100) {
    state.opening = 100;
    direction = -1;
  }
  if (state.opening <= 0) {
    state.opening = 0;
    direction = 1;
  }
  render();
  frame = requestAnimationFrame(animate);
}
$("#play").onclick = () => {
  if (playing) {
    stop();
    save();
    return;
  }
  playing = true;
  last = performance.now();
  $("#play").textContent = "Ⅱ";
  $("#play").setAttribute("aria-label", "Pause unfolding animation");
  frame = requestAnimationFrame(animate);
};
$("#opening").oninput = (e) => {
  stop();
  state.opening = +e.target.value;
  render();
  save();
};
$("#rotation").oninput = (e) => {
  state.rotation = +e.target.value;
  render();
  save();
};
$("#reset-view").onclick = () => {
  state.rotation = -9;
  render();
  save();
};
$("#controls").addEventListener("input", (e) => {
  const key = e.target.dataset.key;
  if (!key) return;
  state[key] = key === "size" ? +e.target.value : e.target.value;
  if (key === "size") $("#size-output").textContent = state.size;
  render();
  save();
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  for (const key of ["font", "fold", "palette"])
    if (b.dataset[key] !== undefined) {
      state[key] = key === "palette" ? +b.dataset[key] : b.dataset[key];
      controls();
      render();
      save();
    }
  if (b.dataset.tab) {
    tab = b.dataset.tab;
    document
      .querySelectorAll("[data-tab]")
      .forEach((el) => el.classList.toggle("active", el === b));
    controls();
  }
  if (b.dataset.template !== undefined) {
    stop();
    state = { ...defaults, ...structuredClone(templates[+b.dataset.template]) };
    if (motion) motion.load({ ...motion.getDesign(), fold: false });
    controls();
    render();
    save();
    notify("Template ready. Make it your own.");
  }
});
$("#new").onclick = () => {
  if (motion?.isActive()) {
    motion.reset();
    return;
  }
  if (
    !confirm(
      "Start fresh? Export your current design first if you’d like to keep it.",
    )
  )
    return;
  stop();
  state = { ...defaults };
  controls();
  render();
  save();
};
$("#export").onclick = () =>
  motion?.isActive() ? motion.export() : $("#export-dialog").showModal();
$("#share").onclick = async () => {
  if (motion?.isActive()) {
    motion.share();
    return;
  }
  const url = location.origin + location.pathname + "#design=" + encode(state);
  try {
    await navigator.clipboard.writeText(url);
    notify("Design link copied. Anyone with the link can open it.");
  } catch {
    prompt("Copy your design link:", url);
  }
};
function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#json").onclick = () =>
  download(
    new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    "paperform-design.json",
  );
$("#import").onchange = async (e) => {
  try {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 24000) throw Error("Design file is too large.");
    const next = validate(JSON.parse(await f.text()));
    stop();
    state = next;
    if (next.motion) motion?.load(next.motion);
    controls();
    render();
    save();
    notify("Design imported. Welcome back.");
    $("#export-dialog").close();
  } catch (err) {
    notify(err.message);
  }
  e.target.value = "";
};
function artwork() {
  const c = document.createElement("canvas");
  c.width = 1600;
  c.height = 1100;
  const ctx = c.getContext("2d"),
    p = palettes[state.palette];
  paintMaterials(ctx, c.width, c.height, state, p);
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  function text(value, y, size, font, maxWidth) {
    ctx.font = font.replace("SIZE", size);
    for (const para of value.split("\n")) {
      let line = "";
      for (const ch of para) {
        if (ctx.measureText(line + ch).width > maxWidth) {
          ctx.fillText(line, 800, y);
          y += size * 1.1;
          line = ch;
        } else line += ch;
      }
      ctx.fillText(line, 800, y);
      y += size * 1.1;
    }
    return y;
  }
  text(state.eyebrow, 100, 22, "SIZEpx Arial", 1400);
  const lines = state.title.split("\n").length;
  const size = Math.min(state.size * 2, 380 / Math.max(lines, 1));
  text(state.title, 350, size, `bold SIZEpx ${fonts[state.font].family}`, 1350);
  text(state.note, 860, 28, "SIZEpx Georgia", 1300);
  text(state.signature, 1020, 20, "SIZEpx Arial", 1300);
  ctx.fillStyle = p.accent;
  ctx.font = "130px Georgia";
  ctx.fillText(
    { flower: "✺", star: "✦", heart: "♥", none: "" }[state.motif],
    1400,
    740,
  );
  return c;
}
$("#png").onclick = () => {
  let preview = $("#postcard-result");
  if (!preview) {
    preview = document.createElement("div");
    preview.id = "postcard-result";
    $("#png").after(preview);
  }
  const url = artwork().toDataURL("image/png");
  preview.replaceChildren();
  const image = document.createElement("img");
  image.src = url;
  image.alt = "Your exported postcard";
  image.style.width = "100%";
  const link = document.createElement("a");
  link.href = url;
  link.download = "paperform-postcard.png";
  link.textContent = "Save PNG ↓";
  link.className = "save-png";
  preview.append(image, link);
};
$("#print").onclick = () => {
  const w = window.open("", "_blank");
  if (!w) {
    notify("Allow pop-ups to open the printable card.");
    return;
  }
  const src = artwork().toDataURL();
  w.document.write(
    `<!doctype html><title>Paperform · Printable card</title><style>@page{size:A4 portrait;margin:12mm}body{margin:0;font-family:Arial;text-align:center;color:#555}.sheet{height:260mm;display:flex;flex-direction:column;border:1px solid #bbb}.back{height:50%;display:grid;place-content:center;border-bottom:1px dashed #aaa}.front{height:50%;display:flex;align-items:center}img{width:100%}button{margin:14px;padding:10px}@media print{button,.help{display:none}}</style><button onclick="window.print()">Print card</button><p class="help">Print at 100%. Fold along the dotted center line. This is a flat card, not a pop-up cutting template.</p><div class="sheet"><div class="back">paperform<br><small>Made with a little wonder</small></div><div class="front"><img src="${src}" alt="Your card design"></div></div>`,
  );
  w.document.close();
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stop();
    save();
  }
});
controls();
render();
if (startMessage) notify(startMessage);

motion = mountMotion({
  getCard: () => ({
    ...state,
    ink: palettes[state.palette].ink,
    paper: palettes[state.palette].paper,
  }),
  notify,
  stopFold: stop,
  onChange: (design) => {
    state.motion = design;
    save();
  },
});

function materialControls() {
  const list = state.stickers ?? [];
  selectedSticker = Math.min(selectedSticker, Math.max(0, list.length - 1));
  const item = list[selectedSticker];
  $("#controls").innerHTML =
    `<div class="control-heading"><span>01</span><h2>Sticker shelf</h2></div><p class="fine">Layer up to 12 stickers. Adjust each one below.</p><div class="sticker-shelf">${stickers.map(([id, glyph, name]) => `<button data-add-sticker="${id}" aria-label="Add ${name} sticker" title="${name}">${glyph}</button>`).join("")}</div><label>Frame<select data-material="frame">${["none", "line", "double", "dashed", "corners"].map((v) => `<option ${state.frame === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>${
      item
        ? `<label>Selected sticker<select id="sticker-select">${list.map((v, i) => `<option value="${i}" ${i === selectedSticker ? "selected" : ""}>${i + 1}. ${v.kind}</option>`).join("")}</select></label><div class="sticker-fields">${[
            ["x", "Horizontal", 0, 1, 0.01],
            ["y", "Vertical", 0, 1, 0.01],
            ["size", "Size", 20, 160, 1],
            ["rotation", "Rotation", -180, 180, 1],
          ]
            .map(
              ([k, label, min, max, step]) =>
                `<label>${label}<input data-sticker="${k}" type="number" min="${min}" max="${max}" step="${step}" value="${item[k]}"></label>`,
            )
            .join(
              "",
            )}</div><label>Sticker ink<input data-sticker="color" type="color" value="${item.color}"></label><button id="remove-sticker">Remove sticker</button>`
        : '<p class="fine">Choose a sticker to start decorating.</p>'
    }`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.addSticker) {
    const list = state.stickers ?? [];
    if (list.length >= 12) {
      notify("Twelve stickers maximum. Remove one to make room.");
      return;
    }
    state.stickers = [
      ...list,
      {
        kind: b.dataset.addSticker,
        x: 0.75,
        y: 0.7,
        size: 65,
        rotation: 0,
        color: stickerColors[list.length % stickerColors.length],
      },
    ];
    selectedSticker = state.stickers.length - 1;
    materialControls();
    render();
    save();
  }
  if (b.id === "remove-sticker") {
    state.stickers = state.stickers.filter((_, i) => i !== selectedSticker);
    materialControls();
    render();
    save();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.dataset.material) {
    state.frame = e.target.value;
    render();
    save();
  }
  const key = e.target.dataset.sticker;
  if (key) {
    const item = state.stickers[selectedSticker];
    if (!item) return;
    item[key] =
      key === "color"
        ? e.target.value
        : Math.max(+e.target.min, Math.min(+e.target.max, +e.target.value));
    render();
    save();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "sticker-select") {
    selectedSticker = +e.target.value;
    materialControls();
  }
});
Promise.all(
  Object.values(fonts).map((f) =>
    document.fonts.load(`700 40px ${f.family}`).catch(() => []),
  ),
).then(() => render());
