// 年份
document.getElementById("year").textContent = new Date().getFullYear();

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MONO = '"JetBrains Mono", monospace';

/* ================= 英雄区 ASCII 大标题（跳字组装） ================= */
(function asciiTitle() {
  const el = document.getElementById("asciiTitle");
  if (!el) return;
  const target = [
    "  ▄████  ██▀███   █    ██   ██████ ▄▄▄█████▓",
    " ██▒ ▀█▒▓██ ▒ ██▒ ██  ▓██▒▒██    ▒ ▓  ██▒ ▓▒",
    "▒██░▄▄▄░▓██ ░▄█ ▒▓██  ▒██░░ ▓██▄   ▒ ▓██░ ▒░",
    "░▓█  ██▓▒██▀▀█▄  ▓▓█  ░██░  ▒   ██▒░ ▓██▓ ░ ",
    "░▒▓███▀▒░██▓ ▒██▒▒▒█████▓ ▒██████▒▒  ▒██▒ ░ ",
    " ░▒   ▒ ░ ▒▓ ░▒▓░░▒▓▒ ▒ ▒ ▒ ▒▓▒ ▒ ░  ▒ ░░   ",
    "  ░   ░   ░▒ ░ ▒░░░▒░ ░ ░ ░ ░▒  ░ ░    ░    ",
    "░ ░   ░   ░░   ░  ░░░ ░ ░ ░  ░  ░    ░      ",
    "      ░    ░        ░           ░           ",
  ];
  const glyphs = "アイウエオカキ01#/\\<>*+=結晶虚空王◆◇◈▚▞░▒▓".split("");
  const rows = target.length, cols = Math.max(...target.map((r) => r.length));
  const padded = target.map((r) => r.padEnd(cols, " "));

  if (reduce) { el.textContent = padded.join("\n"); return; }

  const cells = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const ch = padded[y][x];
      cells.push({ x, y, ch, locked: ch === " ", t: Math.random() });
    }
  let settle = 0;
  function frame() {
    settle += 0.012;
    const grid = padded.map((r) => r.split(""));
    for (const c of cells) {
      if (c.locked) continue;
      if (c.t < settle) grid[c.y][c.x] = c.ch;
      else grid[c.y][c.x] = glyphs[(Math.random() * glyphs.length) | 0];
    }
    el.textContent = grid.map((r) => r.join("")).join("\n");
    if (settle < 1.15) requestAnimationFrame(frame);
    else el.textContent = padded.join("\n");
  }
  frame();
})();

/* ================= Hero 舞台：ASCII 场景渲染 + 模式切换 + 鼠标聚光 ================= */
(function stage() {
  const canvas = document.getElementById("stage");
  const wrap = document.getElementById("stageWrap");
  const cursor = document.getElementById("stageCursor");
  const modesEl = document.getElementById("modes");
  if (!canvas || !wrap) return;
  const ctx = canvas.getContext("2d");

  const MODES = {
    chars:   { ramp: " .:-=+*#%@".split(""),        cell: 14, tint: [235, 235, 235] },
    dither:  { ramp: " ░░▒▒▓▓█".split(""),           cell: 12, tint: [220, 220, 220] },
    blocks:  { ramp: " ▁▂▃▄▅▆▇█".split(""),          cell: 12, tint: [200, 200, 200] },
    kana:    { ramp: " ・ノシツナホムヰ王".split(""), cell: 15, tint: [174, 247, 247] },
    crystal: { ramp: " ·◦◇◈◆⬡✦".split(""),           cell: 16, tint: [84, 230, 230] },
    glitch:  { ramp: " .:-=+*#%@".split(""),        cell: 14, tint: [235, 235, 235], glitch: true },
    dots:    { ramp: " .∙•●".split(""),              cell: 10, tint: [230, 230, 230] },
  };
  let mode = MODES.chars;
  let w, h, cols, rows, cell, dpr;
  const mouse = { x: -1, y: -1, tx: -1, ty: -1 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = wrap.getBoundingClientRect();
    w = canvas.width = Math.floor(r.width * dpr);
    h = canvas.height = Math.floor(r.height * dpr);
    cell = Math.floor(mode.cell * dpr);
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    ctx.font = `${Math.floor(cell * 0.9)}px ${MONO}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
  }

  // 多层正弦叠加的“等离子”场，得到柔和流动的云状密度
  function field(x, y, t) {
    const nx = x / cols, ny = y / rows;
    let v = Math.sin(nx * 6 + t * 0.6);
    v += Math.sin((ny * 5 - t * 0.4) * 1.3);
    v += Math.sin((nx + ny) * 4 + t * 0.35);
    v += Math.sin(Math.hypot(nx - 0.5, ny - 0.5) * 12 - t * 0.9) * 0.8;
    v = (v + 3.8) / 7.6;
    // 中心留一块较暗的区域给标题
    const d = Math.hypot((nx - 0.5) * 1.6, ny - 0.5);
    v *= Math.min(1, 0.25 + d * 1.6);
    return Math.max(0, Math.min(1, v));
  }

  let last = 0;
  function frame(ts) {
    if (ts - last > 42 || reduce) {
      last = ts;
      const t = ts / 1000;
      ctx.clearRect(0, 0, w, h);
      // 鼠标缓动
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const ramp = mode.ramp, n = ramp.length - 1;
      const [tr, tg, tb] = mode.tint;
      const glitchRow = mode.glitch && Math.random() < 0.35 ? (Math.random() * rows) | 0 : -1;
      const glitchShift = ((Math.random() * 6) | 0) - 3;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let v = field(x, y, t);
          // 聚光：鼠标附近密度提升
          if (mouse.tx >= 0) {
            const dx = x * cell - mouse.x, dy = y * cell - mouse.y;
            const dist = Math.hypot(dx, dy) / (cell * 9);
            if (dist < 1) v = Math.min(1, v + (1 - dist) * (1 - dist) * 0.7);
          }
          let ch = ramp[Math.round(v * n)];
          if (ch === " ") continue;
          let px = x * cell + cell / 2;
          let color;
          if (mode.glitch && y === glitchRow) {
            px += glitchShift * cell;
            color = Math.random() < 0.5 ? `rgba(255,51,85,${0.4 + v * 0.6})` : `rgba(84,230,230,${0.4 + v * 0.6})`;
          } else {
            color = `rgba(${tr},${tg},${tb},${0.08 + v * 0.75})`;
          }
          ctx.fillStyle = color;
          ctx.fillText(ch, px, y * cell);
        }
      }
      if (reduce) return;
    }
    requestAnimationFrame(frame);
  }

  wrap.addEventListener("pointermove", (e) => {
    const r = wrap.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) * dpr;
    mouse.ty = (e.clientY - r.top) * dpr;
    if (cursor) cursor.style.transform = `translate(${e.clientX - r.left - 19}px, ${e.clientY - r.top - 19}px)`;
  });
  wrap.addEventListener("pointerleave", () => { mouse.tx = mouse.ty = -1; });

  if (modesEl) {
    modesEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      modesEl.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
      mode = MODES[b.dataset.mode] || MODES.chars;
      resize();
      if (reduce) frame(performance.now());
    });
  }

  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();

/* ================= 全屏虚空 ASCII 层（极淡） ================= */
(function voidLayer() {
  const canvas = document.getElementById("void");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const glyphs = "アイウエオカキクケコサ01#$%&/\\<>*+=結晶虚空王之手◆◇◈⬡✦░▒▓".split("");
  let w, h, cols, rows, cell, grid, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    cell = Math.floor(18 * dpr);
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    grid = new Array(cols * rows).fill(0).map(() => ({
      ch: glyphs[(Math.random() * glyphs.length) | 0],
      a: Math.random() * 0.25,
      red: Math.random() < 0.02,
    }));
    ctx.font = `${Math.floor(cell * 0.82)}px ${MONO}`;
    ctx.textBaseline = "top";
  }

  let last = 0;
  function frame(ts) {
    if (reduce) return;
    if (ts - last > 70) {
      last = ts;
      ctx.clearRect(0, 0, w, h);
      const churn = (cols * rows) * 0.04;
      for (let i = 0; i < churn; i++) {
        const g = grid[(Math.random() * grid.length) | 0];
        g.ch = glyphs[(Math.random() * glyphs.length) | 0];
        g.a = 0.08 + Math.random() * 0.5;
        g.red = Math.random() < 0.02;
      }
      for (let i = 0; i < grid.length; i++) {
        const g = grid[i];
        g.a *= 0.965;
        if (g.a < 0.03) continue;
        ctx.fillStyle = g.red ? `rgba(255,51,85,${g.a})` : `rgba(220,220,220,${g.a})`;
        ctx.fillText(g.ch, (i % cols) * cell, ((i / cols) | 0) * cell);
      }
    }
    requestAnimationFrame(frame);
  }
  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();

/* ================= 雨滴层 ================= */
(function rain() {
  const canvas = document.getElementById("rain");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, drops;
  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    drops = Array.from({ length: Math.min(180, Math.floor(w / 8)) }, makeDrop);
  }
  function makeDrop() {
    return {
      x: Math.random() * w, y: Math.random() * h,
      len: 8 + Math.random() * 16, speed: 5 + Math.random() * 8,
      thick: 0.4 + Math.random() * 1, alpha: 0.08 + Math.random() * 0.28,
    };
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const d of drops) {
      ctx.strokeStyle = `rgba(230,230,230,${d.alpha})`;
      ctx.lineWidth = d.thick;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
      ctx.stroke();
      d.y += d.speed; d.x -= d.speed * 0.15;
      if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
    }
    requestAnimationFrame(frame);
  }
  addEventListener("resize", resize);
  resize();
  if (!reduce) frame();
})();

/* ================= 滚动抽出结晶虚空之剑 ================= */
(function extract() {
  const section = document.getElementById("weapon");
  const sword = document.getElementById("sword");
  const pct = document.getElementById("pct");
  const bar = document.getElementById("bar");
  const checks = Array.from(document.querySelectorAll("#checks li"));
  if (!section || !sword) return;
  let ticking = false;

  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const total = rect.height - innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    sword.style.setProperty("--p", e.toFixed(4));
    if (pct) pct.textContent = Math.round(p * 100);
    if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    for (const li of checks) li.classList.toggle("on", p >= parseFloat(li.dataset.at));
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", update);
  update();
})();

/* ================= 滚动显现 ================= */
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (reduce || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  els.forEach((e) => io.observe(e));
})();

/* ================= 作品缩略图：ASCII 抖动纹理 ================= */
(function thumbs() {
  const list = document.querySelectorAll(".thumb canvas");
  if (!list.length) return;
  const ramps = [" .:-=+*#%@", " ░▒▓█", " ·◦◇◈◆"];
  list.forEach((canvas, idx) => {
    const ctx = canvas.getContext("2d");
    const seed = parseFloat(canvas.dataset.seed || "1");
    const ramp = ramps[idx % ramps.length].split("");
    let w, h, cols, rows, cell, dpr, t = seed * 10;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = Math.floor(r.width * dpr);
      h = canvas.height = Math.floor(r.height * dpr);
      cell = Math.floor(11 * dpr);
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
      ctx.font = `${Math.floor(cell * 0.9)}px ${MONO}`;
      ctx.textBaseline = "top";
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const nx = x / cols, ny = y / rows;
        let v = Math.sin(nx * (5 + seed) + t) + Math.sin(ny * 6 - t * 0.7 + seed) + Math.sin((nx * ny) * 14 + seed * 3);
        v = Math.max(0, Math.min(1, (v + 3) / 6));
        const ch = ramp[Math.round(v * (ramp.length - 1))];
        if (ch === " ") continue;
        ctx.fillStyle = idx === 2 ? `rgba(84,230,230,${0.1 + v * 0.7})` : `rgba(230,230,230,${0.08 + v * 0.7})`;
        ctx.fillText(ch, x * cell, y * cell);
      }
    }
    let raf = 0;
    const card = canvas.closest(".work");
    if (card && !reduce) {
      card.addEventListener("pointerenter", () => {
        cancelAnimationFrame(raf);
        (function loop() { t += 0.03; draw(); raf = requestAnimationFrame(loop); })();
      });
      card.addEventListener("pointerleave", () => cancelAnimationFrame(raf));
    }
    addEventListener("resize", resize);
    resize();
  });
})();

/* ================= 复制邮箱 ================= */
(function copyMail() {
  const btn = document.getElementById("copyBtn");
  const mail = document.getElementById("mail");
  if (!btn || !mail) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mail.textContent.trim());
      btn.textContent = "copied"; btn.classList.add("done");
      setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("done"); }, 1400);
    } catch (e) {
      btn.textContent = "!";
      setTimeout(() => { btn.textContent = "copy"; }, 1400);
    }
  });
})();

/* ================= 雨声 lofi（WebAudio 合成） ================= */
(function ambient() {
  const btn = document.getElementById("audioToggle");
  if (!btn) return;
  const label = btn.querySelector(".audio-label");
  let ctx, master, playing = false, nodes = [];

  function noiseBuffer(c) {
    const len = c.sampleRate * 2;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  function start() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1600;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 300;
    src.connect(hp); hp.connect(lp); lp.connect(master); src.start();
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08; lfoGain.gain.value = 400;
    lfo.connect(lfoGain); lfoGain.connect(lp.frequency); lfo.start();
    nodes = [src, lfo];
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);
  }
  function stop() {
    if (!ctx) return;
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    const old = ctx;
    setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch (e) {} }); old.close(); }, 700);
    ctx = null;
  }
  btn.addEventListener("click", () => {
    playing = !playing;
    if (playing) { start(); btn.classList.add("playing"); btn.setAttribute("aria-pressed", "true"); label.textContent = "rain on"; }
    else { stop(); btn.classList.remove("playing"); btn.setAttribute("aria-pressed", "false"); label.textContent = "rain off"; }
  });
})();
