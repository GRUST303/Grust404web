// 年份
document.getElementById("year").textContent = new Date().getFullYear();

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // 每个非空字符有一个“解析进度”，从随机跳字逐渐锁定为目标字符
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

/* ================= 全屏虚空 ASCII 层（跳动布满） ================= */
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
    ctx.font = `${Math.floor(cell * 0.82)}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";
  }

  let last = 0;
  function frame(ts) {
    if (reduce) return;
    if (ts - last > 55) {
      last = ts;
      ctx.clearRect(0, 0, w, h);
      // 随机让一批字跳动 / 改变
      const churn = (cols * rows) * 0.06;
      for (let i = 0; i < churn; i++) {
        const idx = (Math.random() * grid.length) | 0;
        const g = grid[idx];
        g.ch = glyphs[(Math.random() * glyphs.length) | 0];
        g.a = 0.08 + Math.random() * 0.55;
        g.red = Math.random() < 0.02;
      }
      // 缓慢衰减，制造闪烁呼吸
      for (let i = 0; i < grid.length; i++) {
        const g = grid[i];
        g.a *= 0.965;
        if (g.a < 0.03) continue;
        const x = (i % cols) * cell;
        const y = ((i / cols) | 0) * cell;
        ctx.fillStyle = g.red
          ? `rgba(255,51,85,${g.a})`
          : `rgba(84,230,230,${g.a})`;
        ctx.fillText(g.ch, x, y);
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
    const count = Math.min(220, Math.floor(w / 6));
    drops = Array.from({ length: count }, makeDrop);
  }
  function makeDrop() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 16,
      speed: 5 + Math.random() * 8,
      thick: 0.4 + Math.random() * 1,
      alpha: 0.08 + Math.random() * 0.28,
    };
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const d of drops) {
      ctx.strokeStyle = `rgba(174,247,247,${d.alpha})`;
      ctx.lineWidth = d.thick;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      d.x -= d.speed * 0.15;
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
  if (!section || !sword) return;
  let ticking = false;

  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const total = rect.height - innerHeight; // 可滚动距离
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    // 用一段柔和 easing
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    sword.style.setProperty("--p", e.toFixed(4));
    if (pct) pct.textContent = Math.round(p * 100);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", update);
  update();
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
