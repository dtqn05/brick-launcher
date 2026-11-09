(() => {
  const canvas = document.getElementById("net");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0, dpr = 1;
  let angle = 0.6;
  let mouse = { x: 0.5, y: 0.5 }, smooth = { x: 0.5, y: 0.5 };
  let running = true;
  let last = performance.now();

  /* --- Red: esfera de alambre irregular, centrada fuera de pantalla --- */
  const MERIDIANS = 16;
  const PARALLELS = 11;
  const SEG = 36;
  const meridians = Array.from({ length: MERIDIANS }, (_, i) => ({
    lon: (i / MERIDIANS) * Math.PI * 2 + (Math.random() - 0.5) * 0.25,
    wob: Math.random() * 6
  }));
  const parallels = Array.from({ length: PARALLELS }, (_, i) => ({
    lat: -Math.PI / 2 + ((i + 1) / (PARALLELS + 1)) * Math.PI + (Math.random() - 0.5) * 0.12,
    wob: Math.random() * 6
  }));

  /* --- Motas de luz --- */
  let motes = [];
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  {
    const s = sprite.getContext("2d");
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(225,255,255,1)");
    g.addColorStop(0.25, "rgba(90,230,235,0.55)");
    g.addColorStop(1, "rgba(25,180,200,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 32, 32);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(46, Math.round((w * h) / 30000));
    while (motes.length < n) motes.push(mote(true));
    motes.length = n;
    if (reduced) requestAnimationFrame(frame);
  }

  function mote(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20,
      s: Math.random() * 10 + 4,
      vy: -(Math.random() * 0.25 + 0.05),
      vx: (Math.random() - 0.5) * 0.1,
      t: Math.random() * 6.28,
      a: Math.random() * 0.4 + 0.15
    };
  }

  function project(x, y, z, R, cx, cy) {
    // Rotación Y
    const ca = Math.cos(angle), sa = Math.sin(angle);
    let x1 = x * ca + z * sa;
    let z1 = -x * sa + z * ca;
    // Inclinación X
    const tilt = 0.42 + (smooth.y - 0.5) * 0.12;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const y1 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    const f = R * 2.2;
    const s = f / (f + z2 + R * 0.4);
    return [cx + x1 * s, cy + y1 * s, z2];
  }

  function drawNet(time) {
    const R = Math.max(w, h) * 0.78;
    const cx = w * (0.58 + (smooth.x - 0.5) * 0.04);
    const cy = h * 0.56;
    const front = new Path2D();
    const back = new Path2D();

    const line = (pts) => {
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0, z0] = pts[i - 1];
        const [x1, y1, z1] = pts[i];
        const p = (z0 + z1) < 0 ? front : back;
        p.moveTo(x0, y0);
        p.lineTo(x1, y1);
      }
    };

    for (const m of meridians) {
      const pts = [];
      for (let k = 0; k <= SEG; k++) {
        const lat = -Math.PI / 2 + (k / SEG) * Math.PI;
        const r = R * (1 + 0.035 * Math.sin(lat * 3 + m.wob + time * 0.00015));
        pts.push(project(r * Math.cos(lat) * Math.cos(m.lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(m.lon), R, cx, cy));
      }
      line(pts);
    }
    for (const p of parallels) {
      const pts = [];
      for (let k = 0; k <= SEG * 1.5; k++) {
        const lon = (k / (SEG * 1.5)) * Math.PI * 2;
        const r = R * (1 + 0.03 * Math.sin(lon * 4 + p.wob + time * 0.0002));
        pts.push(project(r * Math.cos(p.lat) * Math.cos(lon), r * Math.sin(p.lat), r * Math.cos(p.lat) * Math.sin(lon), R, cx, cy));
      }
      line(pts);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(40, 170, 200, 0.1)";
    ctx.stroke(back);
    ctx.strokeStyle = "rgba(90, 225, 230, 0.2)";
    ctx.stroke(front);
  }

  function drawMotes(dt) {
    ctx.globalCompositeOperation = "lighter";
    for (const m of motes) {
      if (!reduced) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.t += 0.02 * dt;
        if (m.y < -20) Object.assign(m, mote(false));
      }
      const a = m.a * (0.55 + 0.45 * Math.sin(m.t));
      ctx.globalAlpha = a;
      ctx.drawImage(sprite, m.x - m.s / 2, m.y - m.s / 2, m.s, m.s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now) {
    const dt = Math.min(now - last, 50) / 16.67;
    last = now;
    if (running) {
      smooth.x += (mouse.x - smooth.x) * 0.03;
      smooth.y += (mouse.y - smooth.y) * 0.03;
      if (!reduced) angle += 0.00055 * dt;
      ctx.clearRect(0, 0, w, h);
      drawNet(now);
      drawMotes(dt);
    }
    if (!reduced) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX / w;
    mouse.y = e.clientY / h;
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    last = performance.now();
  });

  resize();
  if (!reduced) requestAnimationFrame(frame);

})();
