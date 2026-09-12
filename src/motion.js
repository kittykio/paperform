import {
  initial,
  formats,
  effects,
  validateMotion,
  progress,
  pack,
  unpack,
} from "./motion-model.js";
import "./motion.css";
export function mountMotion({ getCard, notify, stopFold, onChange }) {
  const $ = (s) => document.querySelector(s);
  let design = initial(),
    selected = 1,
    time = 0,
    playing = false,
    raf,
    previous = 0,
    recording = false,
    recorder,
    exportUrl,
    drag = null;
  const cache = new Map();
  const tintCache = new Map();
  try {
    if (location.hash.startsWith("#motion="))
      design = unpack(location.hash.slice(8));
    else if (getCard().motion) design = validateMotion(getCard().motion);
    else if (localStorage.getItem("paperform-motion"))
      design = validateMotion(
        JSON.parse(localStorage.getItem("paperform-motion")),
      );
  } catch {
    notify("Could not load the motion design. Starting with a fresh poster.");
  }
  const nav = document.createElement("div");
  nav.className = "workspace-switch";
  nav.innerHTML =
    '<button id="fold-mode" class="chosen">01 / FOLD STUDIO</button><button id="motion-mode">02 / MOTION STUDIO ↗</button>';
  $(".workspace").before(nav);
  const section = document.createElement("section");
  section.id = "motion-studio";
  section.hidden = true;
  section.innerHTML = `<div class="motion-controls"><p class="kicker">MAKE WORDS PERFORM</p><div class="motion-actions"><button id="add-layer">+ Text</button><button id="from-card">Use card text</button></div><label>Text layer<select id="layer-list"></select></label><div id="layer-controls"></div><button id="delete-layer">Remove layer</button><hr><label>Poster format<select id="poster-format"><option value="square">Square · 1080 × 1080</option><option value="portrait">Portrait · 1080 × 1350</option><option value="landscape">Landscape · 1440 × 810</option></select></label><label>Background<input id="poster-bg" type="color"></label><label><input id="fold-link" type="checkbox"> Tie this animation to the card opening</label><p class="fine">Drag text to move it. Drag the blue cross to position the effect. Coordinates are also editable below.</p></div><div class="motion-stage"><div class="motion-toolbar"><span>LIVE MOTION CANVAS</span><button id="poster-png">PNG ↓</button><button id="poster-video">Export video ↓</button><button id="cancel-video" hidden>Cancel export</button></div><div class="poster-wrap"><canvas id="poster" aria-label="Animated typography poster"></canvas></div><div class="motion-transport"><button id="motion-play">▶ Play</button><input id="motion-time" type="range" min="0" max="6" step="0.01" aria-label="Timeline playhead"><output id="motion-clock">0.00s</output><label>Length <input id="motion-duration" type="number" min="2" max="20" step="1"> s</label><label><input id="motion-loop" type="checkbox"> Loop</label></div><div id="motion-tracks"></div><p id="motion-status" role="status">Select a layer to shape its motion.</p><div class="motion-files"><button id="motion-share">Copy motion link ↗</button><button id="motion-save">Save editable design ↓</button><label>Import design<input id="motion-import" type="file" accept=".json,application/json"></label></div><div id="video-result"></div></div>`;
  nav.after(section);
  const canvas = $("#poster"),
    ctx = canvas.getContext("2d");
  const active = () =>
    design.layers.find((l) => l.id === selected) || design.layers[0];
  const html = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function save() {
    onChange?.(design);
    try {
      localStorage.setItem("paperform-motion", JSON.stringify(design));
    } catch {
      notify("Storage unavailable. Save an editable design backup.");
    }
  }
  function setMode(motion) {
    stop();
    stopFold();
    section.hidden = !motion;
    $(".workspace").hidden = motion;
    $(".templates").hidden = motion;
    $("#fold-mode").classList.toggle("chosen", !motion);
    $("#motion-mode").classList.toggle("chosen", motion);
    if (motion) draw();
    syncFold(getCard().opening);
  }
  $("#fold-mode").onclick = () => setMode(false);
  $("#motion-mode").onclick = () => setMode(true);
  function controls() {
    const l = active();
    selected = l.id;
    $("#layer-list").innerHTML = design.layers
      .map(
        (x, i) =>
          `<option value="${x.id}" ${x.id === selected ? "selected" : ""}>${i + 1}. ${html(x.text.slice(0, 25))}</option>`,
      )
      .join("");
    $("#layer-controls").innerHTML =
      `<label>Words<textarea data-motion="text" maxlength="120" rows="3">${html(l.text)}</textarea></label><label>Effect<select data-motion="effect">${effects.map((v) => `<option ${l.effect === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><div class="motion-pair"><label>Typeface<select data-motion="font">${["Impact", "Georgia", "monospace"].map((v) => `<option ${l.font === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><label>Ink<input data-motion="color" type="color" value="${l.color}"></label></div>${[
        ["size", "Size", 16, 240],
        ["rotation", "Rotation", -180, 180],
        ["intensity", "Intensity", 0, 100],
        ["x", "Position X", 0, 1],
        ["y", "Position Y", 0, 1],
        ["originX", "Effect X", 0, 1],
        ["originY", "Effect Y", 0, 1],
        ["start", "Starts at", 0, design.duration - 0.1],
        ["end", "Ends at", 0.1, design.duration],
      ]
        .map(
          ([key, label, min, max]) =>
            `<label>${label}<input type="number" data-motion="${key}" value="${l[key]}" min="${min}" max="${max}" step="${max <= 20 ? 0.1 : 1}"></label>`,
        )
        .join(
          "",
        )}<label>Easing<select data-motion="easing">${["linear", "smooth", "bounce"].map((v) => `<option ${l.easing === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>`;
    $("#poster-format").value = design.format;
    $("#poster-bg").value = design.background;
    $("#motion-duration").value = design.duration;
    $("#motion-time").max = design.duration;
    $("#motion-loop").checked = design.loop;
    $("#fold-link").checked = design.fold;
    $("#delete-layer").disabled = design.layers.length === 1;
    tracks();
  }
  function tracks() {
    $("#motion-tracks").innerHTML = design.layers
      .map(
        (l) =>
          `<button data-track="${l.id}" class="track ${l.id === selected ? "chosen" : ""}" aria-label="Select ${html(l.text)} timeline"><span>${html(l.text.slice(0, 16))}</span><i style="left:${(l.start / design.duration) * 100}%;width:${((l.end - l.start) / design.duration) * 100}%">${l.effect}</i></button>`,
      )
      .join("");
  }
  function raster(l) {
    const key = JSON.stringify([l.text, l.size, l.font]);
    if (cache.has(key)) return cache.get(key);
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 700;
    const g = c.getContext("2d");
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "white";
    const lines = l.text.split("\n");
    let size = l.size;
    g.font = `bold ${size}px ${l.font}`;
    while (
      (Math.max(...lines.map((t) => g.measureText(t).width)) > 850 ||
        lines.length * size * 1.05 > 650) &&
      size > 10
    ) {
      size--;
      g.font = `bold ${size}px ${l.font}`;
    }
    lines.forEach((s, i) =>
      g.fillText(s, 450, 350 + (i - (lines.length - 1) / 2) * size * 1.05),
    );
    const data = g.getImageData(0, 0, 900, 700).data,
      points = [];
    for (let y = 0; y < 700; y += 5)
      for (let x = 0; x < 900; x += 5)
        if (data[(y * 900 + x) * 4 + 3] > 100) points.push([x - 450, y - 350]);
    const r = { canvas: c, points };
    if (cache.size > 32) cache.clear();
    cache.set(key, r);
    return r;
  }
  function layerDraw(g, l, t, w, h) {
    if (t < l.start || t > l.end) return;
    const phase = progress(l, t),
      cycle = Math.sin(Math.PI * phase),
      a = l.intensity / 100;
    const r = raster(l);
    g.save();
    g.translate(l.x * w, l.y * h);
    g.rotate((l.rotation * Math.PI) / 180);
    g.fillStyle = l.color;
    const tintKey = JSON.stringify([l.text, l.size, l.font, l.color]);
    let tint = tintCache.get(tintKey);
    if (!tint) {
      tint = document.createElement("canvas");
      tint.width = 900;
      tint.height = 700;
      const tg = tint.getContext("2d");
      tg.drawImage(r.canvas, 0, 0);
      tg.globalCompositeOperation = "source-in";
      tg.fillStyle = l.color;
      tg.fillRect(0, 0, 900, 700);
      if (tintCache.size > 32) tintCache.clear();
      tintCache.set(tintKey, tint);
    }
    if (l.effect === "particles") {
      const ox = (l.originX - 0.5) * 900,
        oy = (l.originY - 0.5) * 700;
      r.points.forEach(([x, y], i) => {
        const angle = i * 2.39996;
        const scatter = cycle * a;
        g.fillRect(
          x + ((x - ox) * 1.3 + Math.cos(angle) * 100) * scatter,
          y + ((y - oy) * 1.3 + Math.sin(angle) * 100) * scatter,
          4,
          4,
        );
      });
    } else if (l.effect === "wave") {
      for (let x = 0; x < 900; x += 4) {
        const y =
          Math.sin(x / 80 - phase * Math.PI * 4 - l.originX * 6) *
          a *
          65 *
          cycle;
        g.drawImage(tint, x, 0, 4, 700, x - 450, y - 350, 4, 700);
      }
    } else if (l.effect === "liquid") {
      for (let y = 0; y < 700; y += 3) {
        const offset =
          Math.sin(y / 38 - phase * Math.PI * 4 - l.originY * 6) *
          a *
          65 *
          cycle;
        const stretch =
          1 + Math.sin(y / 80 + phase * Math.PI * 2) * a * 0.16 * cycle;
        g.drawImage(
          tint,
          0,
          y,
          900,
          3,
          -450 * stretch + offset,
          y - 350,
          900 * stretch,
          3,
        );
      }
    } else if (l.effect === "spring") {
      const bounce = Math.sin(phase * Math.PI * 6) * Math.exp(-phase * 4) * a;
      g.translate(
        (l.originX - 0.5) * bounce * 180,
        (l.originY - 0.5) * bounce * 180,
      );
      g.scale(1 + bounce * 0.6, 1 - bounce * 0.45);
      g.drawImage(tint, -450, -350);
    } else g.drawImage(tint, -450, -350);
    g.restore();
  }
  function paint(g, w, h, t) {
    g.fillStyle = design.background;
    g.fillRect(0, 0, w, h);
    g.save();
    g.scale(w / formats[design.format][0], h / formats[design.format][1]);
    for (const l of design.layers)
      layerDraw(g, l, t, ...formats[design.format]);
    g.restore();
  }
  function draw() {
    const [w, h] = formats[design.format];
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    paint(ctx, w, h, time);
    if (!recording) {
      const l = active();
      ctx.save();
      ctx.strokeStyle = "#5687ff";
      ctx.lineWidth = 3;
      const x = l.originX * w,
        y = l.originY * h;
      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x + 14, y);
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x, y + 14);
      ctx.stroke();
      ctx.restore();
    }
    $("#motion-time").value = time;
    $("#motion-clock").textContent = time.toFixed(2) + "s";
  }
  function stop() {
    playing = false;
    cancelAnimationFrame(raf);
    $("#motion-play").textContent = "▶ Play";
  }
  function tick(now) {
    if (!playing) return;
    time += Math.min((now - previous) / 1000, 0.1);
    previous = now;
    if (time >= design.duration) {
      if (design.loop) time %= design.duration;
      else {
        time = design.duration;
        stop();
      }
    }
    draw();
    if (playing) raf = requestAnimationFrame(tick);
  }
  $("#motion-play").onclick = () => {
    if (playing) stop();
    else {
      if (time >= design.duration) time = 0;
      playing = true;
      previous = performance.now();
      $("#motion-play").textContent = "Ⅱ Pause";
      raf = requestAnimationFrame(tick);
    }
  };
  $("#motion-time").oninput = (e) => {
    stop();
    time = +e.target.value;
    draw();
  };
  $("#layer-list").onchange = (e) => {
    selected = +e.target.value;
    controls();
    draw();
  };
  $("#motion-tracks").onclick = (e) => {
    const b = e.target.closest("[data-track]");
    if (b) {
      selected = +b.dataset.track;
      controls();
      draw();
    }
  };
  $("#layer-controls").oninput = (e) => {
    const key = e.target.dataset.motion;
    if (!key) return;
    const l = active();
    l[key] = e.target.type === "number" ? +e.target.value : e.target.value;
    design = validateMotion(design);
    draw();
    save();
    tracks();
  };
  $("#layer-controls").onchange = () => {
    controls();
  };
  $("#add-layer").onclick = () => {
    if (design.layers.length === 8) {
      notify("Eight layers maximum per poster.");
      return;
    }
    design.layers.push({
      ...initial().layers[0],
      id: Math.max(...design.layers.map((l) => l.id)) + 1,
      text: "YOUR WORDS",
      start: 0,
      end: design.duration,
    });
    selected = design.layers.at(-1).id;
    controls();
    draw();
    save();
  };
  $("#delete-layer").onclick = () => {
    if (design.layers.length < 2) return;
    design.layers = design.layers.filter((l) => l.id !== selected);
    design.layers.forEach((l, i) => (l.id = i + 1));
    selected = 1;
    controls();
    draw();
    save();
  };
  $("#from-card").onclick = () => {
    const card = getCard();
    active().text = card.title;
    active().color = card.ink;
    design.background = card.paper;
    controls();
    draw();
    save();
  };
  $("#poster-format").onchange = (e) => {
    design.format = e.target.value;
    draw();
    save();
  };
  $("#poster-bg").oninput = (e) => {
    design.background = e.target.value;
    draw();
    save();
  };
  $("#motion-duration").oninput = (e) => {
    if (!e.target.value || +e.target.value < 2 || +e.target.value > 20) return;
    const old = design.duration;
    design.duration = Math.max(2, Math.min(20, +e.target.value || 6));
    design.layers.forEach((l) => {
      l.start = (l.start / old) * design.duration;
      l.end = (l.end / old) * design.duration;
    });
    time = Math.min(time, design.duration);
    $("#motion-time").max = design.duration;
    tracks();
    draw();
    save();
  };
  $("#motion-loop").onchange = (e) => {
    design.loop = e.target.checked;
    save();
  };
  $("#fold-link").onchange = (e) => {
    design.fold = e.target.checked;
    design.foldLayer = design.layers.findIndex((l) => l.id === selected);
    save();
    notify(
      design.fold
        ? "The selected layer now performs as your card opens."
        : "Fold link disabled.",
    );
  };
  function coords(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  }
  canvas.onpointerdown = (e) => {
    if (recording) return;
    stop();
    const pos = coords(e),
      l = active();
    const origin = Math.hypot(pos.x - l.originX, pos.y - l.originY) < 0.055;
    if (!origin) {
      const hit = [...design.layers]
        .reverse()
        .find(
          (l) => Math.abs(pos.x - l.x) < 0.36 && Math.abs(pos.y - l.y) < 0.16,
        );
      if (hit) selected = hit.id;
    }
    const a = active();
    drag = {
      origin,
      x: pos.x,
      y: pos.y,
      ox: origin ? a.originX : a.x,
      oy: origin ? a.originY : a.y,
    };
    canvas.setPointerCapture(e.pointerId);
    controls();
  };
  canvas.onpointermove = (e) => {
    if (!drag) return;
    const pos = coords(e),
      l = active();
    l[drag.origin ? "originX" : "x"] = Math.max(
      0,
      Math.min(1, drag.ox + pos.x - drag.x),
    );
    l[drag.origin ? "originY" : "y"] = Math.max(
      0,
      Math.min(1, drag.oy + pos.y - drag.y),
    );
    draw();
  };
  canvas.onpointerup = () => {
    drag = null;
    controls();
    save();
  };
  canvas.onpointercancel = () => {
    drag = null;
    save();
  };
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  $("#poster-png").onclick = () => {
    const c = document.createElement("canvas");
    [c.width, c.height] = formats[design.format];
    paint(c.getContext("2d"), c.width, c.height, time);
    c.toBlob((b) => {
      if (b) download(b, "paperform-poster.png");
    });
  };
  $("#motion-save").onclick = () =>
    download(
      new Blob([JSON.stringify(design, null, 2)], { type: "application/json" }),
      "paperform-motion.json",
    );
  $("#motion-import").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 20000) throw Error("Design is too large");
      design = validateMotion(JSON.parse(await file.text()));
      selected = design.layers[0].id;
      time = 0;
      stop();
      controls();
      draw();
      save();
    } catch (err) {
      notify(err.message);
    }
    e.target.value = "";
  };
  $("#motion-share").onclick = async () => {
    const url = location.origin + location.pathname + "#motion=" + pack(design);
    try {
      await navigator.clipboard.writeText(url);
      notify("Motion design link copied.");
    } catch {
      prompt("Copy this motion design link", url);
    }
  };
  let cancelled = false;
  $("#cancel-video").onclick = () => {
    cancelled = true;
    if (recorder?.state === "recording") recorder.stop();
  };
  $("#poster-video").onclick = () => {
    if (recording) return;
    if (!window.MediaRecorder || !canvas.captureStream) {
      notify("Video recording is unavailable in this browser. Try Chrome.");
      return;
    }
    stop();
    const mime = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ].find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) {
      notify("No supported video encoder found.");
      return;
    }
    const output = document.createElement("canvas");
    [output.width, output.height] = formats[design.format];
    const g = output.getContext("2d");
    paint(g, output.width, output.height, 0);
    const stream = output.captureStream(30),
      chunks = [];
    let exportFrame;
    cancelled = false;
    recording = true;
    section
      .querySelectorAll("button,input,select,textarea")
      .forEach((el) => (el.disabled = true));
    $("#cancel-video").hidden = false;
    $("#cancel-video").disabled = false;
    nav.querySelectorAll("button").forEach((el) => (el.disabled = true));
    const finish = () => {
      cancelAnimationFrame(exportFrame);
      stream.getTracks().forEach((t) => t.stop());
      recording = false;
      section
        .querySelectorAll("button,input,select,textarea")
        .forEach((el) => (el.disabled = false));
      nav.querySelectorAll("button").forEach((el) => (el.disabled = false));
      $("#cancel-video").hidden = true;
      controls();
      draw();
    };
    try {
      recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 8000000,
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onerror = () => {
        cancelled = true;
        finish();
        notify("Video export failed. Please try again.");
      };
      recorder.onstop = () => {
        finish();
        if (cancelled) {
          $("#motion-status").textContent = "Export cancelled.";
          return;
        }
        if (exportUrl) URL.revokeObjectURL(exportUrl);
        exportUrl = URL.createObjectURL(new Blob(chunks, { type: mime }));
        const video = document.createElement("video");
        video.controls = true;
        video.src = exportUrl;
        video.loop = true;
        const a = document.createElement("a");
        a.href = exportUrl;
        a.download =
          "paperform-motion." + (mime.includes("mp4") ? "mp4" : "webm");
        a.textContent = "Save video ↓";
        $("#video-result").replaceChildren(video, a);
        $("#motion-status").textContent =
          "Your video is ready to preview and save.";
      };
      recorder.start();
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min((now - start) / 1000, design.duration);
        paint(g, output.width, output.height, t);
        $("#motion-status").textContent =
          `Recording ${t.toFixed(1)} / ${design.duration}s — keep this tab visible`;
        if (t >= design.duration) recorder.stop();
        else exportFrame = requestAnimationFrame(frame);
      };
      exportFrame = requestAnimationFrame(frame);
    } catch {
      finish();
      notify("Video export could not start in this browser.");
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
      if (recording) {
        cancelled = true;
        recorder?.stop();
      }
    }
  });
  const foldCanvas = document.createElement("canvas");
  foldCanvas.id = "fold-motion";
  foldCanvas.width = 900;
  foldCanvas.height = 700;
  $(".art").append(foldCanvas);
  function syncFold(open) {
    const l = design.layers[design.foldLayer ?? 0] ?? design.layers[0];
    foldCanvas.hidden = !design.fold;
    $("#card-title").style.visibility = design.fold ? "hidden" : "";
    if (!design.fold) return;
    const g = foldCanvas.getContext("2d");
    g.clearRect(0, 0, 900, 700);
    layerDraw(
      g,
      { ...l, x: 0.5, y: 0.5, start: 0, end: design.duration },
      (open / 100) * design.duration,
      900,
      700,
    );
  }
  controls();
  draw();
  syncFold(getCard().opening);
  if (location.hash.startsWith("#motion=")) setMode(true);
  return {
    syncFold,
    load: (value) => {
      design = validateMotion(value);
      selected = design.layers[0].id;
      time = 0;
      stop();
      controls();
      draw();
    },
    getDesign: () => design,
    reset: () => {
      if (recording) return;
      if (
        !confirm(
          "Start a new motion poster? Save a design backup to keep this one.",
        )
      )
        return;
      stop();
      design = initial();
      selected = 1;
      time = 0;
      controls();
      draw();
      save();
    },
    isActive: () => !section.hidden,
    share: () => $("#motion-share").click(),
    export: () => $("#poster-video").click(),
  };
}
