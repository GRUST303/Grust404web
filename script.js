// 年份
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------- 雨滴动画 ---------------- */
(function rain() {
  const canvas = document.getElementById("rain");
  const ctx = canvas.getContext("2d");
  let w, h, drops;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(240, Math.floor(w / 5));
    drops = Array.from({ length: count }, makeDrop);
  }
  function makeDrop() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 18,
      speed: 4 + Math.random() * 7,
      thick: 0.5 + Math.random() * 1.1,
      alpha: 0.1 + Math.random() * 0.35,
    };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const d of drops) {
      ctx.strokeStyle = `rgba(240, 210, 170, ${d.alpha})`;
      ctx.lineWidth = d.thick;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      d.x -= d.speed * 0.15;
      if (d.y > h) {
        d.y = -d.len;
        d.x = Math.random() * w;
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  if (!reduce) frame();
})();

/* ---------------- 雨声 lofi（WebAudio 合成，无版权） ---------------- */
(function ambient() {
  const btn = document.getElementById("audioToggle");
  const label = btn.querySelector(".audio-label");
  let ctx, master, playing = false, nodes = [];

  function buildNoiseBuffer(context) {
    const len = context.sampleRate * 2;
    const buffer = context.createBuffer(1, len, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function start() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);

    // 稳定的雨/白噪 -> 低通，营造闷雨声
    const src = ctx.createBufferSource();
    src.buffer = buildNoiseBuffer(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1600;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 300;
    src.connect(hp); hp.connect(lp); lp.connect(master);
    src.start();

    // 缓慢起伏，让雨声更自然
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 400;
    lfo.connect(lfoGain); lfoGain.connect(lp.frequency);
    lfo.start();

    nodes = [src, lfo];
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);
  }

  function stop() {
    if (!ctx) return;
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    const old = ctx;
    setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); old.close(); }, 700);
    ctx = null;
  }

  btn.addEventListener("click", () => {
    playing = !playing;
    if (playing) { start(); btn.classList.add("playing"); btn.setAttribute("aria-pressed", "true"); label.textContent = "雨声 on"; }
    else { stop(); btn.classList.remove("playing"); btn.setAttribute("aria-pressed", "false"); label.textContent = "雨声 off"; }
  });
})();
