/* ==========================================================================
   Brick Wall · Descargas — lógica del dashboard
   ========================================================================== */
(() => {
  const C = window.BRICKWALL_CONFIG || {};
  const I = window.BW_ICONS || {};
  const A = window.BWAudio || { play() {}, unlock: () => Promise.resolve(), music: () => Promise.resolve(), setEnabled() {}, setVolume() {}, onChange() {}, mediaVolume: () => 0.3, state: {} };
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const body = document.body;
  const app = $("app");
  const stage = $("stage");
  const orb = $("orb");
  const wires = $("wires");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqCompact = window.matchMedia("(max-width: 860px), (max-height: 600px)");
  const ORDER = ["windows", "macos", "linux"].filter((k) => C.platforms && C.platforms[k]);
  const isSoon = (k) => !!(C.platforms[k] && C.platforms[k].comingSoon);
  const AVAIL = ORDER.filter((k) => !isSoon(k));

  const BRAND = {
    discord: "#8c96ff", youtube: "#ff5a6a", tiktok: "#25f4ee", kick: "#53fc18",
    twitch: "#b07dff", instagram: "#ff7aa8", x: "#ffffff"
  };

  /* ---------------------------------------------------------- Utilidades */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const isSet = (url) => !!url && url !== "#" && !/TU-USUARIO|TU-REPO/.test(url);
  const host = (url) => { try { return new URL(url).host.replace(/^www\./, ""); } catch { return ""; } };
  let iconUid = 0;
  const icon = (key) => (I[key] || "")
    .replace(/id="([^"]+)"/g, (_, id) => `id="${id}-${++iconUid}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${iconUid})`);
  const fmtSize = (b) => b >= 1e9 ? `${(b / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 2 })} GB` : `${(b / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} MB`;
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "").toUpperCase();

  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2800);
  }

  function retrigger(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function detectOS() {
    const ua = navigator.userAgent || "";
    const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    const s = `${plat} ${ua}`.toLowerCase();
    if (/android|iphone|ipad|ipod/.test(s)) return null;
    if (/win/.test(s)) return "windows";
    if (/mac/.test(s)) return "macos";
    if (/linux|x11|cros/.test(s)) return "linux";
    return null;
  }

  /* ---------------------------------------------------------- Contenido fijo */
  const logo = C.logo || "assets/logo.png";
  $$("img").forEach((img) => { if (img.getAttribute("src") === "assets/logo.png") img.src = logo; });
  let version = C.version && C.version !== "auto" ? C.version : "";
  if (C.brand) $("brand-name").textContent = C.brand;
  $("brand-mark").innerHTML = I.bricks || "";
  $("dd-icon").innerHTML = icon("community");
  $("dd-chev").innerHTML = I.chevron || "";
  $("dl-icon").innerHTML = I.download || "";
  $("help-icon").innerHTML = icon("discord");
  $("help-go").innerHTML = I.external || "";
  $("err-warn").innerHTML = I.warning || "";
  $("p-notes").innerHTML = (C.notes || []).map((n) => `<li>${rich(n)}</li>`).join("");

  const setReleases = (url) => {
    if (!isSet(url)) return;
    $("releases").href = url;
    $("releases").hidden = false;
  };
  setReleases(C.releasesUrl);

  // Copyright de la esquina
  $("year").textContent = new Date().getFullYear();
  if (C.footer) $("copy-text").textContent = C.footer;

  /* ---------------------------------------------------------- Datos de plataformas */
  const assets = {};
  const EXT = { windows: /\.(exe|msi)$/i, macos: /\.(dmg|pkg)$/i, linux: /\.(appimage|deb|rpm|tar\.gz)$/i };
  const urlOf = (k) => {
    const p = C.platforms[k];
    if (isSet(p.url)) return p.url;
    return assets[k] ? assets[k].browser_download_url : "";
  };
  const metaOf = (k) => {
    const p = C.platforms[k];
    if (isSoon(k)) return "PRÓXIMAMENTE";
    const right = assets[k] ? fmtSize(assets[k].size) : p.arch;
    return [p.format, right].filter(Boolean).join(" · ").toUpperCase();
  };

  /* ---------------------------------------------------------- Menú principal */
  const detected = detectOS();
  const menuEls = [];

  ORDER.forEach((k, i) => {
    const p = C.platforms[k];
    const soon = isSoon(k);
    const li = document.createElement("li");
    li.setAttribute("role", "none");
    const el = document.createElement("button");
    el.type = "button";
    el.className = "item" + (soon ? " is-soon" : "");
    el.setAttribute("role", "menuitem");
    el.setAttribute("aria-label", soon ? `${p.label}: próximamente` : `${p.label}: ver instalador`);
    el.tabIndex = -1;
    el.style.setProperty("--i", i + 1);
    el.style.setProperty("--arc", `${Math.round(Math.sin((Math.PI * (i + 0.5)) / ORDER.length) * 30 - 8)}px`);
    el.innerHTML = `
      <span class="item__socket"><span class="item__icon" aria-hidden="true">${icon(k)}</span></span>
      <span class="item__link" aria-hidden="true"></span>
      <span class="item__glow"><span class="item__body">
        <span class="item__label">${esc(p.label)}</span>
        <span class="item__lcd lcd" data-meta="${k}">${esc(metaOf(k))}</span>
      </span></span>
      ${k === detected ? '<span class="item__tag"><i class="led led--sm"></i>TU SISTEMA</span>' : ""}`;
    li.appendChild(el);
    $("menu").appendChild(li);
    menuEls.push(el);

    el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse" && screen === "home" && focusIdx !== i) setFocus(i);
    });
    el.addEventListener("focus", () => { if (screen === "home") setFocus(i); });
    el.addEventListener("click", () => {
      setFocus(i, { sound: false });
      if (isSoon(k)) {
        retrigger(el, "is-glitch");
        showSoon(k);
        return;
      }
      retrigger(el, "is-press");
      go("platform", { platform: k });
    });
  });

  // Foco inicial: tu sistema si está disponible; si no, el primero disponible
  let focusIdx = Math.max(0, ORDER.indexOf(AVAIL.includes(detected) ? detected : AVAIL[0] || ORDER[0]));

  function setFocus(i, { sound = true } = {}) {
    const n = menuEls.length;
    if (!n) return;
    i = ((i % n) + n) % n;
    const changed = focusIdx !== i;
    focusIdx = i;
    menuEls.forEach((el, j) => {
      el.classList.toggle("is-focus", j === i);
      el.tabIndex = j === i ? 0 : -1;
    });
    if (changed) {
      if (sound) A.play("move");
      retrigger(orb, "is-pulse");
      followWires(650);
    }
  }

  const refreshMeta = () => $$("[data-meta]").forEach((el) => (el.textContent = metaOf(el.dataset.meta)));

  /* ---------------------------------------------------------- Próximamente (fallo) */
  const err = $("err");
  let errOpen = false;
  let errReturn = null;

  function showSoon(k) {
    const p = C.platforms[k];
    const cs = C.comingSoon || {};
    errReturn = document.activeElement;
    $("err-icon").innerHTML = icon(k);
    $("err-sub").textContent = `LAUNCHER PARA ${p.label.toUpperCase()}`;
    $("err-title").textContent = (cs.title || "Próximamente").toUpperCase();
    $("err-msg").textContent = cs.text || "Disculpen las molestias.";
    A.play("error");
    retrigger(app, "is-glitching");
    const g = $("glitch");
    g.classList.remove("is-on");
    void g.offsetWidth;
    g.classList.add("is-on");
    setTimeout(() => g.classList.remove("is-on"), 520);
    setTimeout(() => {
      err.hidden = false;
      errOpen = true;
      app.inert = true;
      $("err-ok").focus({ preventScroll: true });
    }, 180);
  }

  function closeSoon() {
    if (!errOpen) return;
    errOpen = false;
    err.hidden = true;
    app.inert = false;
    A.play("back");
    const t = errReturn && document.contains(errReturn) ? errReturn : menuEls[focusIdx];
    if (t) t.focus({ preventScroll: true });
  }

  $("err-ok").addEventListener("click", closeSoon);
  err.addEventListener("click", (e) => { if (e.target === err) closeSoon(); });

  /* ---------------------------------------------------------- Ayuda en Discord */
  const help = C.help || {};
  if (help.title) $("help-title").textContent = help.title;
  $("help-text").textContent = help.text || "";
  const helpBtn = $("help-btn");
  const discordURL = () => {
    const s = (C.socials || []).find((x) => x.icon === "discord");
    return (s && isSet(s.url) && s.url) || discordInvite || "";
  };
  let discordInvite = "";
  const syncHelp = () => { helpBtn.href = discordURL() || "#"; };
  syncHelp();
  helpBtn.addEventListener("click", (e) => {
    if (!discordURL()) {
      e.preventDefault();
      A.play("error");
      toast("Añade el enlace de Discord en js/config.js (redes sociales)");
    } else {
      A.play("link");
    }
  });
  helpBtn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") A.play("move"); });

  /* ---------------------------------------------------------- Instalador */
  let platform = AVAIL.includes(detected) ? detected : AVAIL[0] || ORDER[0];
  const install = $$(".install")[0];
  const dl = $("dl");
  $("p-prev").hidden = $("p-next").hidden = AVAIL.length < 2;

  function fillPlatform(key) {
    const p = C.platforms[key];
    if (!p) return;
    const asset = assets[key];
    $("p-name").textContent = p.label;
    $("p-file").textContent = (asset && asset.name) || p.fileName || "—";
    $("p-req").textContent = p.requirements || "—";
    const size = asset ? fmtSize(asset.size) : p.size;
    $("row-size").hidden = !size;
    $("p-size").textContent = size || "—";
    $("row-dl").hidden = !asset;
    if (asset) $("p-dls").textContent = new Intl.NumberFormat("es-ES", { useGrouping: "always" }).format(asset.download_count);
    $("p-icon").innerHTML = icon(key);
    $("dl-label").textContent = `DESCARGAR PARA ${p.label.toUpperCase()}`;
    const steps = p.steps || [];
    $("p-steps").classList.toggle("steps--simple", steps.every((st) => typeof st === "string"));
    $("p-steps").innerHTML = steps.map((st) => typeof st === "string"
      ? `<li><span>${rich(st)}</span></li>`
      : `<li><b>${esc(st.title)}</b><span>${rich(st.text)}</span></li>`).join("");
    const tips = p.tips || [];
    $("p-tips-wrap").hidden = !tips.length;
    $("p-tips").innerHTML = tips.map((t) => `<li>${rich(t)}</li>`).join("");
    const url = urlOf(key);
    dl.href = url || "#";
    const file = (asset && asset.name) || p.fileName;
    if (file) dl.setAttribute("download", file);
    else dl.removeAttribute("download");
    dl.setAttribute("aria-label", `Descargar ${C.brand || ""} Launcher ${version} para ${p.label}`);
  }

  let swapTimer;
  function switchPlatform(dir) {
    if (screen !== "platform" || AVAIL.length < 2) return;
    const idx = (AVAIL.indexOf(platform) + dir + AVAIL.length) % AVAIL.length;
    platform = AVAIL[idx];
    A.play("switch");
    install.classList.add("is-swapping");
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      fillPlatform(platform);
      install.classList.remove("is-swapping");
    }, 190);
    history.replaceState({ bw: navIdx }, "", `#${platform}`);
    focusIdx = ORDER.indexOf(platform);
  }

  install.addEventListener("scroll", () => {
    install.classList.toggle("is-scrolled", install.scrollTop > 4);
    if (screen === "platform") drawWires();
  }, { passive: true });
  $("p-prev").addEventListener("click", () => switchPlatform(-1));
  $("p-next").addEventListener("click", () => switchPlatform(1));
  $("back").addEventListener("click", () => back());

  dl.addEventListener("click", (e) => {
    const p = C.platforms[platform];
    retrigger(dl, "is-fired");
    retrigger(orb, "is-flare");
    if (!isSet(urlOf(platform))) {
      e.preventDefault();
      A.play("error");
      toast(`El instalador de ${p ? p.label : "esta plataforma"} aún no está configurado.`);
      return;
    }
    A.play("download");
    toast(`Descargando ${(assets[platform] && assets[platform].name) || p.fileName || "el instalador"}…`);
  });

  /* ---------------------------------------------------------- Pantallas */
  let screen = "home";
  let navIdx = 0;
  const screens = { home: $("screen-home"), platform: $("screen-platform") };
  const homeURL = () => location.pathname + location.search;

  function render(next, { sound = null, initial = false } = {}) {
    screen = next;
    body.dataset.screen = next;
    Object.entries(screens).forEach(([k, el]) => {
      const on = k === next;
      el.classList.toggle("is-active", on);
      el.classList.remove("is-entering");
      el.setAttribute("aria-hidden", String(!on));
      el.inert = !on;
    });
    if (!initial) retrigger(screens[next], "is-entering");
    if (next === "platform") { fillPlatform(platform); install.scrollTop = 0; }
    if (next === "home") setFocus(focusIdx, { sound: false });

    if (sound) A.play(sound);
    if (!initial) retrigger(orb, "is-flare");

    wires.classList.add("is-hidden");
    if (mqCompact.matches && !initial) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

    setTimeout(() => {
      if (screen !== next) return;
      drawWires();
      wires.classList.remove("is-hidden");
      followWires(500);
    }, initial ? 1300 : reduced ? 50 : 1050);

    setTimeout(() => {
      if (screen !== next || bootActive || ddOpen || errOpen) return;
      const target = next === "platform" ? dl : menuEls[focusIdx];
      if (target) target.focus({ preventScroll: true });
    }, initial ? 0 : 420);
  }

  function go(next, { platform: p } = {}) {
    if (p) platform = p;
    if (next === screen) return;
    closeDD(false);
    navIdx += 1;
    history.pushState({ bw: navIdx }, "", next === "platform" ? `#${platform}` : homeURL());
    render(next, { sound: "select" });
  }

  function back() {
    if (screen === "home") return;
    if (navIdx > 0) {
      history.back();
    } else {
      history.replaceState({ bw: 0 }, "", homeURL());
      focusIdx = ORDER.indexOf(platform);
      render("home", { sound: "back" });
    }
  }

  function routeFromHash() {
    const h = decodeURIComponent(location.hash.replace("#", "")).toLowerCase();
    if (ORDER.includes(h)) return isSoon(h) ? { screen: "home", soon: h } : { screen: "platform", platform: h };
    if (h === "comunidad" || h === "community") return { screen: "home", community: true };
    return { screen: "home" };
  }

  window.addEventListener("popstate", (e) => {
    const idx = (e.state && e.state.bw) || 0;
    const goingBack = idx < navIdx;
    navIdx = idx;
    const r = routeFromHash();
    if (r.platform) platform = r.platform;
    if (r.screen === "home" && screen === "platform") focusIdx = ORDER.indexOf(platform);
    if (r.screen !== screen) render(r.screen, { sound: goingBack ? "back" : "select" });
    else if (r.screen === "platform") fillPlatform(platform);
  });

  /* ---------------------------------------------------------- Logo de la esquina */
  const brand = $("brand");
  let building = false;
  function buildBricks(sound = true) {
    if (building) return;
    building = true;
    retrigger(brand, "is-building");
    if (sound) A.play("build");
    setTimeout(() => { brand.classList.remove("is-building"); building = false; }, 1100);
  }
  brand.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") buildBricks(); });
  brand.addEventListener("click", (e) => {
    e.preventDefault();
    closeDD(false);
    if (screen !== "home") {
      if (navIdx > 0) history.go(-navIdx);
      else { history.replaceState({ bw: 0 }, "", homeURL()); focusIdx = ORDER.indexOf(platform); render("home", { sound: "back" }); }
    } else {
      building = false;
      buildBricks();
    }
  });

  /* ---------------------------------------------------------- Cables */
  function center(el) {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, r: r.width / 2 };
  }

  function drawWires() {
    if (mqCompact.matches || !body.classList.contains("is-ready")) { wires.innerHTML = ""; return; }
    const o = center(orb.querySelector(".orb__core"));
    const targets = screen === "home"
      ? menuEls.map((el, i) => ({ el: el.querySelector(".item__socket"), on: i === focusIdx }))
      : [{ el: $$("[data-wire]", screens.platform)[0], on: true }];
    let html = "";
    const top = screen === "platform" ? install.getBoundingClientRect().top - stage.getBoundingClientRect().top : -Infinity;
    for (const t of targets) {
      if (!t.el) continue;
      const c = center(t.el);
      if (c.y < top) continue; // el zócalo se ha desplazado fuera de la vista
      const ang = Math.atan2(c.y - o.y, c.x - o.x);
      const sx = o.x + Math.cos(ang) * o.r * 0.98;
      const sy = o.y + Math.sin(ang) * o.r * 0.98;
      const ex = c.x - c.r;
      const ey = c.y;
      const dx = Math.max(30, (ex - sx) * 0.55);
      const d = `M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + dx).toFixed(1)} ${sy.toFixed(1)} ${(ex - dx).toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      html += `<path class="wire${t.on ? " is-on" : ""}" d="${d}"/>`;
      if (t.on) html += `<path class="wire__pulse" pathLength="1" d="${d}"/>`;
    }
    wires.innerHTML = html;
  }

  let followUntil = 0, following = false;
  function followWires(ms) {
    followUntil = Math.max(followUntil, performance.now() + ms);
    if (following) return;
    following = true;
    const step = () => {
      drawWires();
      if (performance.now() < followUntil) requestAnimationFrame(step);
      else following = false;
    };
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------- Orbe orgánico */
  const shells = $$(".shell", orb);
  const shellCfg = [
    { r: 80, amp: 0.16, n: 6, sp: 0.00042, rot: 0.00006, ph: 0 },
    { r: 88, amp: 0.12, n: 7, sp: 0.00031, rot: -0.00004, ph: 2 },
    { r: 74, amp: 0.2, n: 5, sp: 0.00055, rot: 0.00009, ph: 4 }
  ];
  function blob(cfg, t) {
    const pts = [];
    for (let i = 0; i < cfg.n; i++) {
      const a = (i / cfg.n) * Math.PI * 2 + t * cfg.rot;
      const r = cfg.r * (1 + cfg.amp * Math.sin(t * cfg.sp * (1 + i * 0.23) + cfg.ph + i * 1.7));
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[(i - 1 + pts.length) % pts.length];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d + "Z";
  }
  function animateOrb(t) {
    if (!document.hidden) shells.forEach((s, i) => s.setAttribute("d", blob(shellCfg[i], t)));
    if (!reduced) requestAnimationFrame(animateOrb);
  }
  animateOrb(performance.now() + 8000);

  /* ---------------------------------------------------------- Comunidad (desplegable) */
  const dd = $("dd");
  const ddBtn = $("dd-btn");
  let ddOpen = false;
  const socials = (C.socials || []).map((s) => ({ ...s }));

  function renderSocials() {
    $("dd-socials").innerHTML = socials.map((s, i) => {
      const ok = isSet(s.url);
      const meta = s.handle || host(s.url) || "SIN ENLACE";
      return `<li><a class="soc" href="${ok ? esc(s.url) : "#"}" ${ok ? 'target="_blank" rel="noopener noreferrer"' : ""}
        data-i="${i}" style="--brand:${esc(s.color || BRAND[s.icon] || "#a8fbf6")}" aria-label="${esc(s.name)}${ok ? " (se abre en otra pestaña)" : ""}">
        <span class="soc__icon" aria-hidden="true">${icon(s.icon)}</span>
        <span class="soc__txt"><span class="soc__name">${esc(s.name)}</span><span class="soc__meta">${esc(meta)}</span></span>
        <span class="soc__go" aria-hidden="true">${I.external || ""}</span>
      </a></li>`;
    }).join("");
  }
  renderSocials();

  $("dd-socials").addEventListener("click", (e) => {
    const a = e.target.closest(".soc");
    if (!a) return;
    const s = socials[a.dataset.i];
    if (!isSet(s.url)) {
      e.preventDefault();
      A.play("error");
      toast(`Añade el enlace de ${s.name} en js/config.js`);
    } else {
      A.play("link");
    }
  });
  let lastSoc = null;
  $("dd-panel").addEventListener("pointermove", (e) => {
    const a = e.target.closest(".soc, .dd__join");
    if (e.pointerType === "mouse" && a && a !== lastSoc) A.play("move");
    lastSoc = a;
  });

  function openDD() {
    if (ddOpen) return;
    ddOpen = true;
    dd.classList.add("is-open");
    ddBtn.setAttribute("aria-expanded", "true");
    A.play("select");
    setTimeout(() => { const f = $$(".soc", dd)[0]; if (f && document.activeElement === ddBtn) f.focus({ preventScroll: true }); }, 60);
  }
  function closeDD(sound = true, refocus = false) {
    if (!ddOpen) return;
    ddOpen = false;
    dd.classList.remove("is-open");
    ddBtn.setAttribute("aria-expanded", "false");
    if (sound) A.play("back");
    if (refocus) ddBtn.focus({ preventScroll: true });
  }
  ddBtn.addEventListener("click", () => (ddOpen ? closeDD() : openDD()));
  document.addEventListener("pointerdown", (e) => {
    if (ddOpen && !dd.contains(e.target)) closeDD();
  });

  /* ---------------------------------------------------------- Datos reales */
  // GitHub Releases: tamaño, descargas y fecha reales de cada instalador
  async function loadRelease() {
    const gh = C.github || {};
    if (!gh.owner || !gh.repo) return;
    const key = `bw_rel_${gh.owner}/${gh.repo}`;
    let data = null;
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || "null");
      if (cached && Date.now() - cached.t < 10 * 60 * 1000) data = cached.d;
    } catch { /* sin caché */ }
    if (!data) {
      try {
        const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}/releases/latest`, {
          headers: { Accept: "application/vnd.github+json" }
        });
        if (!r.ok) return;
        const j = await r.json();
        data = {
          tag: j.tag_name,
          date: j.published_at,
          assets: (j.assets || []).map((a) => ({ name: a.name, size: a.size, download_count: a.download_count, browser_download_url: a.browser_download_url }))
        };
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch { /* ignorado */ }
      } catch { return; }
    }
    ORDER.forEach((k) => {
      const p = C.platforms[k];
      assets[k] = data.assets.find((a) => a.name === p.fileName) || data.assets.find((a) => EXT[k].test(a.name)) || undefined;
    });
    if (C.version === "auto" && data.tag) version = data.tag;
    if (data.date) {
      $("drive-date-v").textContent = fmtDate(data.date);
      $("drive-date").hidden = false;
    }
    if (!isSet(C.releasesUrl)) setReleases(`https://github.com/${gh.owner}/${gh.repo}/releases`);
    refreshMeta();
    fillPlatform(platform);
    followWires(300);
  }

  // Discord: quién está conectado ahora (widget público del servidor)
  const STATUS = { online: ["EN LÍNEA", ""], idle: ["AUSENTE", "led--amber"], dnd: ["NO MOLESTAR", "led--red"] };

  async function loadDiscord() {
    const id = String((C.discord && C.discord.serverId) || "").trim();
    if (!/^\d{15,22}$/.test(id)) return;
    try {
      const r = await fetch(`https://discord.com/api/guilds/${id}/widget.json`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      renderDiscord(await r.json());
    } catch {
      $("dd-online").hidden = true;
      $("dd-count").hidden = true;
    }
    setTimeout(loadDiscord, 60000);
  }

  function renderDiscord(d) {
    const members = Array.isArray(d.members) ? d.members : [];
    const count = typeof d.presence_count === "number" ? d.presence_count : members.length;
    $("dd-count-n").textContent = count;
    $("dd-count").hidden = false;
    $("dd-online-n").textContent = count;
    $("dd-online").hidden = false;

    const list = $("friends");
    list.innerHTML = "";
    members.slice(0, 40).forEach((m) => {
      const [txt, cls] = STATUS[m.status] || STATUS.online;
      const li = document.createElement("li");
      li.className = "friend";
      li.innerHTML = `
        <span class="friend__av"><img alt="" loading="lazy" referrerpolicy="no-referrer" /><i class="led ${cls}"></i></span>
        <span class="friend__txt"><span class="friend__name"></span><span class="friend__act"></span></span>`;
      const img = li.querySelector("img");
      const initial = () => {
        const sp = document.createElement("span");
        sp.className = "friend__ini";
        sp.textContent = (m.username || "?").charAt(0).toUpperCase();
        img.replaceWith(sp);
      };
      if (m.avatar_url) { img.src = m.avatar_url; img.onerror = initial; } else initial();
      li.querySelector(".friend__name").textContent = m.username || "—";
      li.querySelector(".friend__act").textContent = m.game && m.game.name ? `JUGANDO A ${m.game.name}`.toUpperCase() : txt;
      list.appendChild(li);
    });
    if (count > Math.min(members.length, 40)) {
      const li = document.createElement("li");
      li.className = "friends__more";
      li.textContent = `+ ${count - Math.min(members.length, 40)} más conectados`;
      list.appendChild(li);
    }
    if (d.instant_invite) {
      discordInvite = d.instant_invite;
      syncHelp();
      $("dd-join").href = d.instant_invite;
      $("dd-join").hidden = false;
      const s = socials.find((x) => x.icon === "discord");
      if (s && !isSet(s.url)) { s.url = d.instant_invite; renderSocials(); }
    }
  }

  /* ---------------------------------------------------------- Teclado */
  const typing = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

  function confirm() {
    if (screen === "platform") dl.click();
    else if (menuEls[focusIdx]) menuEls[focusIdx].click();
  }

  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (bootActive) return bootKey(e);
    const k = e.key;

    if (errOpen) {
      if (k === "Escape" || k === "Backspace" || ((k === "Enter" || k === " ") && document.activeElement !== $("err-ok"))) {
        e.preventDefault();
        closeSoon();
      } else if (k === "Tab") {
        e.preventDefault();
        $("err-ok").focus();
      }
      return;
    }

    const el = document.activeElement;
    if (typing(el)) return;

    if (ddOpen) {
      const items = $$(".soc, .dd__join:not([hidden])", dd);
      const at = items.indexOf(el);
      if (k === "Escape" || k === "Backspace") { e.preventDefault(); closeDD(true, true); }
      else if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); items[(at + 1) % items.length].focus(); A.play("move"); }
      else if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); items[(at - 1 + items.length) % items.length].focus(); A.play("move"); }
      return;
    }

    if (k === "ArrowDown" || k === "ArrowUp" || k === "s" || k === "w") {
      if (screen !== "home") return;
      e.preventDefault();
      setFocus(focusIdx + (k === "ArrowDown" || k === "s" ? 1 : -1));
      menuEls[focusIdx].focus({ preventScroll: !mqCompact.matches });
    } else if (k === "ArrowLeft" || k === "ArrowRight" || k === "q" || k === "e") {
      if (screen === "platform") {
        e.preventDefault();
        switchPlatform(k === "ArrowRight" || k === "e" ? 1 : -1);
      }
    } else if (k === "Enter" || k === " ") {
      const own = el && el !== body && (el.matches(".tab-arrow, .back, .releases, .dd__btn, .brand, .help__btn, .snd__toggle") || el.closest(".bar, .snd"));
      if (own) return;
      e.preventDefault();
      if (!e.repeat) confirm();
    } else if (k === "Escape" || k === "Backspace" || k === "b") {
      if (screen === "home") return;
      e.preventDefault();
      back();
    }
  });

  /* ---------------------------------------------------------- Mando */
  let padLoop = null;
  const padPrev = {};
  let axisHold = 0;

  function pollPad() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    if (!pads.length) { padLoop = null; return; }
    const gp = pads[0];
    const pressed = (i) => gp.buttons[i] && gp.buttons[i].pressed;
    const edge = (i) => { const p = pressed(i); const was = padPrev[i]; padPrev[i] = p; return p && !was; };

    if (bootActive) {
      if (edge(0) || edge(9)) startBoot();
      if (edge(1)) finishBoot();
    } else if (errOpen) {
      if (edge(0) || edge(1)) closeSoon();
    } else {
      const now = performance.now();
      const y = gp.axes[1] || 0;
      const x = gp.axes[0] || 0;
      let v = 0, h = 0;
      if (edge(12)) v = -1;
      if (edge(13)) v = 1;
      if (edge(14) || edge(4)) h = -1;
      if (edge(15) || edge(5)) h = 1;
      if (Math.abs(y) > 0.6 && now > axisHold) { v = y > 0 ? 1 : -1; axisHold = now + 260; }
      if (Math.abs(x) > 0.6 && now > axisHold) { h = x > 0 ? 1 : -1; axisHold = now + 320; }
      if (Math.abs(y) < 0.3 && Math.abs(x) < 0.3) axisHold = 0;
      if (edge(3)) (ddOpen ? closeDD() : openDD());
      if (v && screen === "home" && !ddOpen) setFocus(focusIdx + v);
      if (h && screen === "platform") switchPlatform(h);
      if (edge(0) && !ddOpen) confirm();
      if (edge(1)) (ddOpen ? closeDD() : back());
    }
    padLoop = requestAnimationFrame(pollPad);
  }

  window.addEventListener("gamepadconnected", () => {
    toast("Mando conectado · A seleccionar · B atrás · Y comunidad");
    A.unlock();
    if (!padLoop) padLoop = requestAnimationFrame(pollPad);
  });

  /* ---------------------------------------------------------- Sonido: controles */
  const video = $("boot-video");
  const sndUIs = $$("[data-snd]").map((root) => {
    root.innerHTML = `
      <div class="bezel__in">
        <button class="snd__toggle" type="button" aria-pressed="true" aria-label="Silenciar"><span>${I.speaker || ""}</span></button>
        <label class="snd__vol">
          <span class="sr-only">Volumen</span>
          <input type="range" min="0" max="100" step="1" value="40" />
          <span class="snd__meter" aria-hidden="true">${"<i></i>".repeat(10)}</span>
        </label>
        <span class="snd__pct" aria-hidden="true">40%</span>
      </div>`;
    const toggle = root.querySelector(".snd__toggle");
    const input = root.querySelector("input");
    const bars = [...root.querySelectorAll(".snd__meter i")];
    bars.forEach((b, i) => b.style.setProperty("--n", i));
    toggle.addEventListener("click", () => {
      const on = !A.state.enabled;
      A.setEnabled(on);
      A.unlock().then(() => on && A.play("select"));
    });
    input.addEventListener("input", () => {
      A.setVolume(input.value / 100);
      if (!A.state.enabled && Number(input.value) > 0) A.setEnabled(true);
      A.play("move");
    });
    return { root, toggle, input, bars, pct: root.querySelector(".snd__pct") };
  });

  function syncAudioUI(s) {
    sndUIs.forEach((u) => {
      u.toggle.setAttribute("aria-pressed", String(s.enabled));
      u.toggle.setAttribute("aria-label", s.enabled ? "Silenciar" : "Activar sonido");
      u.input.value = Math.round(s.volume * 100);
      u.pct.textContent = s.enabled ? `${Math.round(s.volume * 100)}%` : "MUTE";
      const lit = Math.round(s.volume * u.bars.length);
      u.bars.forEach((b, i) => b.classList.toggle("is-on", i < lit));
      u.root.classList.toggle("is-muted", !s.enabled);
    });
    video.volume = A.mediaVolume();
    video.muted = !s.enabled;
  }
  A.onChange(syncAudioUI);
  setInterval(() => sndUIs.forEach((u) => u.root.classList.toggle("is-playing", !!A.state.playing && A.state.enabled)), 1000);

  const unlockOnce = () => A.unlock();
  window.addEventListener("pointerdown", unlockOnce, { passive: true });
  window.addEventListener("keydown", unlockOnce);

  /* ---------------------------------------------------------- Intro (vídeo) */
  const boot = $("boot");
  const introOn = !(C.intro && C.intro.enabled === false) && !reduced;
  let seen = false;
  try { seen = sessionStorage.getItem("bw_booted") === "1"; } catch { /* ignorado */ }
  let bootActive = introOn && !seen;
  let bootPlaying = false;
  let bootTimer;

  function startBoot() {
    if (!bootActive || bootPlaying) return;
    bootPlaying = true;
    A.unlock();
    video.src = (C.intro && C.intro.video) || "assets/intro.mp4";
    video.volume = A.mediaVolume();
    video.muted = !A.state.enabled;
    boot.classList.add("is-playing");
    $("boot-skip").focus({ preventScroll: true });
    const p = video.play();
    if (p && p.catch) p.catch(() => finishBoot());
    // Red de seguridad por si el vídeo no termina
    bootTimer = setTimeout(finishBoot, 20000);
  }

  video.addEventListener("loadedmetadata", () => {
    clearTimeout(bootTimer);
    bootTimer = setTimeout(finishBoot, (video.duration + 2) * 1000);
  });
  video.addEventListener("timeupdate", () => {
    if (video.duration && video.duration - video.currentTime < 0.7) boot.classList.add("is-ending");
  });
  video.addEventListener("ended", () => finishBoot());
  video.addEventListener("error", () => { if (bootPlaying) finishBoot(); });

  function finishBoot() {
    if (!bootActive) return;
    bootActive = false;
    clearTimeout(bootTimer);
    try { video.pause(); } catch { /* ignorado */ }
    try { sessionStorage.setItem("bw_booted", "1"); } catch { /* ignorado */ }
    boot.classList.add("is-done");
    reveal();
    A.music();
    setTimeout(() => { boot.hidden = true; video.removeAttribute("src"); video.load(); }, 1000);
  }

  function bootKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      const el = document.activeElement;
      if (el === $("boot-omit") || (el && el.closest(".snd"))) return;
      e.preventDefault();
      if (bootPlaying) finishBoot();
      else startBoot();
    } else if (e.key === "Escape") {
      e.preventDefault();
      finishBoot();
    }
  }

  $("boot-start").addEventListener("click", startBoot);
  $("boot-omit").addEventListener("click", finishBoot);
  $("boot-skip").addEventListener("click", finishBoot);

  /* ---------------------------------------------------------- Arranque */
  function reveal() {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    const r = routeFromHash();
    if (r.platform) platform = r.platform;
    history.replaceState({ bw: 0 }, "", r.community || r.soon ? homeURL() : location.href);
    if (r.soon) focusIdx = ORDER.indexOf(r.soon);
    render(r.screen, { initial: true });
    if (r.community) setTimeout(openDD, 700);
    if (r.soon) setTimeout(() => showSoon(r.soon), 900);
  }

  {
    const r = routeFromHash();
    if (r.platform) platform = r.platform;
    body.dataset.screen = r.screen;
    screen = r.screen;
    Object.entries(screens).forEach(([k, el]) => { el.inert = k !== r.screen; });
  }
  setFocus(focusIdx, { sound: false });
  fillPlatform(platform);

  if (bootActive) {
    $("boot-start").focus({ preventScroll: true });
  } else {
    body.classList.add("no-intro");
    boot.hidden = true;
    requestAnimationFrame(reveal);
    A.music(); // empezará en cuanto el navegador permita el audio (primer clic o tecla)
  }

  loadRelease();
  loadDiscord();

  const onResize = () => {
    stage.style.setProperty("--scan-h", `${stage.clientHeight}px`);
    drawWires();
  };
  window.addEventListener("resize", onResize, { passive: true });
  onResize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => followWires(300));
})();
