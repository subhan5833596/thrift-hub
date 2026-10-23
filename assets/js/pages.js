/* =========================================================
   THE THRIFT HUB — page scripts (v2)
   ========================================================= */
(() => {
  const { $, $$, fmt, byId, media, card, thumb, sticker, store, esc, reduce, fine, scramble, stamp } = window.TH;
  const P = window.TH_PRODUCTS, L = window.TH_LIFESTYLE;
  const qs = new URLSearchParams(location.search);
  const clamp = gsap.utils.clamp, rnd = gsap.utils.random;
  const CATS = ["Jackets", "Hoodies", "Tees", "Denim"];
  const go = href => { const a = document.createElement("a"); a.href = href; document.body.append(a); a.click(); a.remove(); };

  function wordsFade(el) {
    const out = [];
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.append(" ");
          else { const s = document.createElement("span"); s.className = "mw"; s.textContent = t; frag.append(s); out.push(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) { n.classList.add("mw"); out.push(n); }
    });
    gsap.to(out, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 50%", scrub: true } });
  }
  function hScroll(section, track, extra = {}) {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    return gsap.to(track, { x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + dist(), pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, ...extra } });
  }
  function batchCards(grid) {
    const cards = $$(".card", grid); gsap.set(cards, { opacity: 0, y: 70 });
    ScrollTrigger.batch(cards, { start: "top 92%", once: true, onEnter: b => {
      gsap.to(b, { opacity: 1, y: 0, stagger: .08, duration: 1.1, ease: "expo.out" });
      gsap.from(b.map(c => $(".garment", c)), { y: -60, rotate: () => rnd(-14, 14), duration: 1.6, stagger: .08, ease: "elastic.out(1,.5)" });
    } });
  }

  /* =====================================================
     HERO — the bale: real pieces fall in, grab & throw
     ===================================================== */
  function bale() {
    const sec = $("#bale"), world = $("#world"), M = window.Matter;
    const mob = innerWidth < 820, list = mob ? P.slice(0, 11) : P;
    const els = list.map(p => {
      const im = new Image(); im.src = p.img; im.alt = p.name; im.className = "bd"; im.draggable = false;
      im.dataset.cursor = fmt(p.price); im.dataset.id = p.id; world.append(im); return im;
    });
    const ready = Promise.all(els.map(im => im.decode ? im.decode().catch(() => {}) : Promise.resolve()));
    let engine, bodies = [], walls = [], running = false, W, H;

    const size = im => {
      const base = mob ? innerWidth * .27 : clamp(110, 190, innerWidth * .108);
      const ar = (im.naturalWidth || 4) / (im.naturalHeight || 5);
      return { w: base * Math.sqrt(ar), h: base / Math.sqrt(ar) };
    };
    function buildWalls() {
      W = sec.clientWidth; H = sec.clientHeight;
      if (walls.length) M.Composite.remove(engine.world, walls);
      const t = 200, o = { isStatic: true };
      walls = [M.Bodies.rectangle(W / 2, H + t / 2, W * 3, t, o), M.Bodies.rectangle(-t / 2, H / 2, t, H * 6, o), M.Bodies.rectangle(W + t / 2, H / 2, t, H * 6, o)];
      M.Composite.add(engine.world, walls);
    }
    function render() {
      bodies.forEach(b => { if (b.isSleeping && b.plugin.drawn) return; b.plugin.drawn = 1; const { el, w, h } = b.plugin; el.style.transform = `translate3d(${b.position.x - w / 2}px,${b.position.y - h / 2}px,0) rotate(${b.angle}rad)`; });
    }
    function staticPile() {
      W = sec.clientWidth; H = sec.clientHeight;
      els.forEach((el, i) => { const { w, h } = size(el); Object.assign(el.style, { width: w + "px", height: h + "px", opacity: 1, transform: `translate(${(i % 6) / 6 * (W - w) + 20}px,${H - h - (i / 6 | 0) * h * .55 - 40}px) rotate(${(i * 37 % 40) - 20}deg)` }); });
    }
    if (!M || reduce) { ready.then(staticPile); return; }

    ready.then(() => {
      engine = M.Engine.create({ enableSleeping: true }); engine.gravity.y = 1.15;
      engine.positionIterations = 8;
      buildWalls();
      bodies = els.map((el, i) => {
        const { w, h } = size(el);
        Object.assign(el.style, { width: w + "px", height: h + "px" });
        const b = M.Bodies.rectangle(rnd(w, W - w), -h - i * (mob ? 120 : 90) - 60, w * .8, h * .8, {
          chamfer: { radius: Math.min(w, h) * .22 }, restitution: .28, friction: .55, frictionAir: .014, density: .0018, angle: rnd(-.8, .8) });
        b.plugin = { el, w, h }; return b;
      });
      M.Composite.add(engine.world, bodies);
      render();
      gsap.ticker.add(() => { if (running) { M.Engine.update(engine, 1000 / 60); render(); } });
      new IntersectionObserver(([e]) => { if (started) running = e.isIntersecting; }).observe(sec);
      let rw; addEventListener("resize", () => { clearTimeout(rw); rw = setTimeout(() => { buildWalls(); bodies.forEach(b => M.Sleeping.set(b, false)); }, 150); });

      /* drag & throw (mouse) */
      if (fine) {
        const mouse = M.Mouse.create(sec);
        sec.removeEventListener("mousewheel", mouse.mousewheel); sec.removeEventListener("DOMMouseScroll", mouse.mousewheel); sec.removeEventListener("wheel", mouse.mousewheel);
        const mc = M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: .18, damping: .1, render: { visible: false } } });
        M.Composite.add(engine.world, mc);
        let t0, p0;
        M.Events.on(mc, "startdrag", e => { e.body.plugin.el.classList.add("dragging"); t0 = Date.now(); p0 = { ...mouse.position }; });
        M.Events.on(mc, "enddrag", e => {
          e.body.plugin.el.classList.remove("dragging");
          if (Date.now() - t0 < 260 && Math.hypot(mouse.position.x - p0.x, mouse.position.y - p0.y) < 6) go("product.html?id=" + e.body.plugin.el.dataset.id);
        });
        /* rummage: moving fast through the pile nudges pieces */
        let lx = 0, ly = 0;
        sec.addEventListener("mousemove", e => {
          const r = sec.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, dx = x - lx, dy = y - ly; lx = x; ly = y;
          if (mc.body || Math.hypot(dx, dy) < 14) return;
          M.Query.point(bodies, { x, y }).forEach(b => M.Sleeping.set(b, false) || M.Body.setVelocity(b, { x: b.velocity.x + dx * .22, y: b.velocity.y + dy * .22 - 2 }));
        });
      } else {
        /* tap to flip */
        sec.addEventListener("click", e => {
          const r = sec.getBoundingClientRect();
          M.Query.point(bodies, { x: e.clientX - r.left, y: e.clientY - r.top }).forEach(b => { M.Sleeping.set(b, false); M.Body.setVelocity(b, { x: rnd(-6, 6), y: -22 }); M.Body.setAngularVelocity(b, rnd(-.35, .35)); });
        });
      }
      /* fast scrolling shakes the bale */
      ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom top", onUpdate: s => {
        const v = s.getVelocity(); if (Math.abs(v) < 900) return;
        bodies.forEach(b => { if (Math.random() < .35) M.Sleeping.set(b, false) || M.Body.setVelocity(b, { x: b.velocity.x + rnd(-3, 3), y: -Math.min(Math.abs(v) / 160, 16) }); });
      } });
      if (started) kick();
    });

    let started = false;
    const kick = () => { if (!engine) return; running = true; els.forEach(el => { el.style.opacity = 1; }); };
    window.TH.onEnter(() => {
      started = true; kick();
      gsap.from(".bale-word span", { yPercent: 110, opacity: 0, stagger: .12, duration: 1.4, ease: "expo.out" });
      gsap.from(".bale-foot > *, .bale-top > *", { y: 30, opacity: 0, stagger: .08, duration: 1, ease: "expo.out", delay: .5 });
      gsap.set("#heroStamp", { opacity: 0 }); stamp($("#heroStamp"), 1.9);
    });
    gsap.to(".bale-word", { yPercent: 25, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
  }

  /* =====================================================
     RAIL — side-on garments turn to face you
     (transform-only: no layout work while animating)
     ===================================================== */
  function rail() {
    const list = P.slice(0, 12), n = list.length, row = $("#railRow"), wrap = $(".rail-wrap");
    const hook = `<svg class="r-hook" viewBox="0 0 16 30" aria-hidden="true"><path d="M8 29V17c0-3 6-4 6-9.5S11 1 8 1 2 3.5 2 7" fill="none" stroke="#5b5348" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    const hanger = `<svg class="hanger" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="M50 1V7L4 25Q0 28 5 29H95Q100 28 96 25L50 7" fill="none" stroke="#8a6b4a" stroke-width="3.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
    row.innerHTML = list.map(p => `<a class="r-item" href="product.html?id=${p.id}" data-cursor="${fmt(p.price)}" aria-label="${esc(p.name)}">${hook}<div class="r-turn">${hanger}${sticker(p)}<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div><span class="r-hit"></span></a>`).join("");
    const items = $$(".r-item", row), turns = $$(".r-turn", row), imgs = $$(".r-turn img", row), hits = $$(".r-hit", row);
    $("#rTot").textContent = String(n).padStart(2, "0");
    let W, w, cur = -1;
    const measure = () => { const pr = document.createElement("i"); pr.style.cssText = "position:absolute;width:var(--W);height:var(--w);visibility:hidden"; wrap.append(pr); W = pr.offsetWidth; w = pr.offsetHeight; pr.remove(); };
    const centerOf = (j, i) => j < i ? j * w + w / 2 : j === i ? i * w + W / 2 : i * w + W + (j - i - 1) * w + w / 2;
    function setActive(i, instant) {
      if (i === cur && !instant) return;
      const prev = cur; cur = i; const d = instant ? 0 : 1, dir = prev < i ? 1 : -1;
      const off = wrap.clientWidth / 2 - (i * w + W / 2);
      items.forEach((it, j) => {
        const on = j === i, x = off + centerOf(j, i) - W / 2;
        hits[j].style.width = (on ? W : w) + "px";
        gsap.to(it, { x, duration: d * 1.05, ease: "expo.out", overwrite: "auto" });
        gsap.to(turns[j], { rotateY: on ? 0 : j < i ? -76 : 76, scale: on ? 1.04 : 1, duration: d * 1.1, ease: "expo.out", overwrite: "auto" });
        if (instant || j === i || j === prev) gsap.to(imgs[j], { opacity: on ? 1 : .78, duration: d * .6, overwrite: "auto" });
      });
      if (!instant) {
        gsap.fromTo(items[i], { rotate: dir * 7 }, { rotate: 0, duration: 2, ease: "elastic.out(1,.25)", overwrite: false });
        [items[i - 1], items[i + 1]].forEach((it, k) => it && gsap.fromTo(it, { rotate: (k ? 1 : -1) * 3 }, { rotate: 0, duration: 1.6, ease: "elastic.out(1,.3)", overwrite: false }));
        const st = $(".sticker", turns[i]); st && gsap.fromTo(st, { rotate: dir * -50 }, { rotate: -14, duration: 1.8, ease: "elastic.out(1,.3)" });
      }
      const p = list[i];
      scramble($("#rName"), p.name, .6);
      scramble($("#rMeta"), `${p.cat} · ${p.era} · Size ${p.size} · Grade ${p.grade}`, .5);
      $("#rDesc").textContent = p.story; gsap.fromTo("#rDesc", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, overwrite: true });
      $("#rPrice").textContent = "Shop — " + fmt(p.price); $("#rBtn").href = "product.html?id=" + p.id; $("#rAdd").dataset.add = p.id;
      $("#rIdx").textContent = String(i + 1).padStart(2, "0"); gsap.to("#rBar", { scaleX: (i + 1) / n, duration: .5, overwrite: true });
    }
    measure(); setActive(0, true);
    let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { measure(); setActive(cur, true); }, 150); });
    ScrollTrigger.create({ trigger: "#rail", start: "top top", end: `+=${n * 24}%`, pin: true, anticipatePin: 1,
      onUpdate: s => setActive(Math.round(s.progress * (n - 1))) });
    if (fine) hits.forEach((h, j) => h.addEventListener("mouseenter", () => setActive(j)));
    gsap.from(turns, { y: -140, opacity: 0, stagger: .05, duration: 1.6, ease: "elastic.out(1,.55)", scrollTrigger: { trigger: "#rail", start: "top 70%" } });
  }

  /* ================= HOME ================= */
  function home() {
    bale(); rail();
    $("#hsTrack").insertAdjacentHTML("beforeend", P.slice(6, 14).map(card).join(""));
    $("#clipImg").src = L.rack;
    const catImg = { Jackets: "leather-bomber", Hoodies: "photo-crew", Tees: "no-days-off", Denim: "flare-denim" };
    $("#catList").innerHTML = CATS.map((c, i) => `
      <a class="cat-item" href="shop.html?cat=${c}" data-img="${byId(catImg[c]).img}">
        <span class="mono muted">0${i + 1}</span><span class="display">${c}</span>
        <span class="row"><span class="mono muted hide-m">${P.filter(p => p.cat === c).length} pieces</span><span class="arr">↗</span></span>
      </a>`).join("");

    wordsFade($("#manifesto"));
    const tw = hScroll($("#hs"), $("#hsTrack"));
    /* cards in the horizontal rail swing in as they arrive */
    $$("#hsTrack .card").forEach(c => gsap.from($(".garment", c), { rotate: -24, y: -80, ease: "none",
      scrollTrigger: { trigger: c, containerAnimation: tw, start: "left right", end: "left 55%", scrub: true } }));

    gsap.timeline({ scrollTrigger: { trigger: "#clip", start: "top top", end: "bottom bottom", scrub: true } })
      .to("#clip .media", { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
      .to("#clipImg", { scale: 1, ease: "none" }, 0);

    const pv = $("#catPreview"), pImg = $("img", pv);
    if (fine) {
      const xT = gsap.quickTo(pv, "x", { duration: .6, ease: "power3" }), yT = gsap.quickTo(pv, "y", { duration: .6, ease: "power3" });
      let lx = 0;
      $("#catList").addEventListener("mousemove", e => { xT(e.clientX - 130); yT(e.clientY - 170); gsap.to(pv, { rotate: clamp(-14, 14, (e.clientX - lx) * .6), duration: .5 }); lx = e.clientX; });
      $("#catList").addEventListener("mouseenter", () => gsap.to(pv, { opacity: 1, scale: 1, duration: .5, ease: "expo.out" }));
      $("#catList").addEventListener("mouseleave", () => gsap.to(pv, { opacity: 0, scale: .6, duration: .4 }));
      $$(".cat-item").forEach(c => c.addEventListener("mouseenter", () => { pImg.src = c.dataset.img; gsap.fromTo(pImg, { scale: .6, rotate: -20 }, { scale: 1, rotate: 0, duration: 1, ease: "elastic.out(1,.5)" }); }));
    }
    $$(".cat-item").forEach(c => gsap.from(c, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 92%" } }));
    $("#newsForm").addEventListener("submit", e => { e.preventDefault(); e.target.reset(); window.TH.toast("You're on the list ✳ See you Friday"); });
  }

  /* ================= SHOP ================= */
  function shop() {
    let cat = CATS.includes(qs.get("cat")) ? qs.get("cat") : "All", sort = "new";
    const grid = $("#grid"), filters = $("#filters");
    $("#total").textContent = P.length;
    filters.innerHTML = ["All", ...CATS].map(c => `<button class="fchip ${c === cat ? "on" : ""}" data-c="${c}" role="tab">${c}<sup>${c === "All" ? P.length : P.filter(p => p.cat === c).length}</sup></button>`).join("");
    grid.innerHTML = P.map(card).join("") + `<p class="empty display h-m" style="display:none">Nothing here right now</p>`;
    const cards = $$(".card", grid);
    cards.forEach((c, i) => { c.dataset.i = i; });
    function apply(animate) {
      const state = animate && window.Flip && !reduce ? Flip.getState(cards) : null;
      const val = c => +c.dataset.price, isSale = c => P[c.dataset.i].was ? 0 : 1;
      const sorted = [...cards].sort((a, b) => sort === "low" ? val(a) - val(b) : sort === "high" ? val(b) - val(a) : sort === "sale" ? isSale(a) - isSale(b) || a.dataset.i - b.dataset.i : a.dataset.i - b.dataset.i);
      let k = 0;
      sorted.forEach(c => { const show = cat === "All" || c.dataset.cat === cat; c.style.display = show ? "" : "none"; c.classList.toggle("big", show && k % 7 === 0 && innerWidth > 520); if (show) k++; grid.insertBefore(c, $(".empty", grid)); });
      $(".empty", grid).style.display = k ? "none" : "";
      if (state) Flip.from(state, { duration: .8, ease: "expo.inOut", absolute: true, scale: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .7, delay: .2 }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: .85, duration: .4 }),
        onComplete: () => ScrollTrigger.refresh() });
      const u = new URL(location); cat === "All" ? u.searchParams.delete("cat") : u.searchParams.set("cat", cat); history.replaceState(null, "", u);
    }
    filters.addEventListener("click", e => {
      const b = e.target.closest(".fchip"); if (!b || b.dataset.c === cat) return;
      cat = b.dataset.c; $$(".fchip", filters).forEach(x => x.classList.toggle("on", x === b)); apply(true);
    });
    $("#sort").addEventListener("change", e => { sort = e.target.value; apply(true); });
    apply(false);
    window.TH.onEnter(() => {
      const vis = cards.filter(c => c.style.display !== "none").slice(0, 8);
      gsap.from(vis, { y: 90, opacity: 0, stagger: .07, duration: 1.2, ease: "expo.out", delay: .2 });
      gsap.from(vis.map(c => $(".garment", c)), { y: -120, rotate: () => rnd(-20, 20), stagger: .07, duration: 1.8, ease: "elastic.out(1,.5)", delay: .3 });
    });
  }

  /* ================= PRODUCT ================= */
  function product() {
    const p = byId(qs.get("id")) || P[0];
    document.title = `${p.name} — The Thrift Hub`;
    const heads = { Jackets: "Built to<br>outlive trends.", Hoodies: "Soft by<br>design.", Tees: "Every fade<br>tells a story.", Denim: "Broken in,<br>not broken." };
    const sizes = p.cat === "Denim" ? ["28", "30", "32", "34", "36"] : ["XS", "S", "M", "L", "XL"];
    const looks = [L.look1, L.look3, L.look2, L.look4];
    const gradeN = { A: 3, B: 2, C: 1 }[p.grade];
    $("#pdp").innerHTML = `
      <div class="pdp-story">
        <a href="shop.html?cat=${p.cat}" class="mono muted link-u" style="align-self:start">← ${p.cat}</a>
        <h2 class="display" data-split="load">${heads[p.cat]}</h2>
        <p class="lead muted">${esc(p.story)}</p>
        <div class="acc">
          <details open><summary>Measurements (flat)</summary><div class="body"><table class="mtable">${Object.entries(p.m).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table></div></details>
          <details><summary>Condition — Grade ${p.grade}</summary><div class="body">${p.grade === "A" ? "Like new. No visible wear, stains or repairs." : p.grade === "B" ? "Light wear — small fading or softening that adds character. Shown in photos." : "Visible character — a mark or repair, shown clearly in photos."}</div></details>
          <details><summary>Shipping & returns</summary><div class="body">Dispatched within 48 hours. Cash on delivery available. If it doesn't match the description, message us within 3 days.</div></details>
        </div>
      </div>
      <div class="pdp-gallery">
        <div class="g-stage" style="--c:${p.c}" data-tilt data-cursor="Zoom" data-z="${p.img}"><img class="garment" src="${p.img}" alt="${esc(p.name)}">${sticker(p)}<span class="stamp" id="pStamp" data-rot="-14">Grade ${p.grade}<small>Checked</small></span></div>
        <div class="g-stage detail" style="--c:${p.c}" data-cursor="Zoom" data-z="${p.img}"><img class="garment" src="${p.img}" alt="Detail of ${esc(p.name)}"><span class="g-grade">Fabric detail</span></div>
        <div class="media" data-label="" data-cursor="Zoom" data-z="${looks[P.indexOf(p) % 4]}" style="--tone:#cfc8bd"><img src="${looks[P.indexOf(p) % 4]}" alt="Styled look" loading="lazy" onerror="this.parentNode.classList.add('fail')"></div>
      </div>
      <div class="pdp-info">
        <div class="row" style="gap:8px;flex-wrap:wrap"><span class="chip light">${p.era}</span><span class="chip light">${p.cat}</span><span class="chip">1 of 1</span></div>
        <h1>${p.name}</h1>
        <span class="pdp-tag" id="pTag">${fmt(p.price)}${p.was ? ` <s>${fmt(p.was)}</s>` : ""}</span>
        <div><div class="row between mono" style="margin-bottom:8px"><span>Condition</span><span>Grade ${p.grade}</span></div><div class="grade">${[1, 2, 3].map(i => `<i class="${i <= gradeN ? "on" : ""}"></i>`).join("")}</div></div>
        <div><div class="row between mono" style="margin-bottom:10px"><span>Size</span><span class="muted">Only size available</span></div>
          <div class="sizes">${sizes.map(s => `<button class="size ${s === p.size ? "on" : ""}" ${s === p.size ? "" : "disabled"} aria-label="Size ${s}">${s}</button>`).join("")}</div></div>
        <button class="btn full" id="addBtn" data-add="${p.id}" style="--h:60px">Add to bag <span class="arr">→</span></button>
        <div class="pdp-badges"><div>🚚 Dispatch in 48h</div><div>💵 Cash on delivery</div><div>🧼 Washed & steamed</div><div>✳ Only one exists</div></div>
      </div>`;
    const addBtn = $("#addBtn");
    const sync = () => { const inBag = store.get().includes(p.id); addBtn.innerHTML = inBag ? `In your bag — view <span class="arr">→</span>` : `Add to bag <span class="arr">→</span>`; inBag ? (addBtn.removeAttribute("data-add"), addBtn.setAttribute("data-open-cart", "")) : (addBtn.setAttribute("data-add", p.id), addBtn.removeAttribute("data-open-cart")); };
    document.addEventListener("cart:change", sync); sync();

    const rel = [...P.filter(x => x.cat === p.cat && x.id !== p.id), ...P.filter(x => x.cat !== p.cat)].slice(0, 4);
    $("#related").innerHTML = rel.map(card).join(""); batchCards($("#related"));

    const g = $$(".pdp-gallery > *");
    window.TH.onEnter(() => {
      gsap.from(g[0], { clipPath: "inset(100% 0% 0% 0% round 18px)", duration: 1.4, ease: "expo.inOut" });
      gsap.from($(".garment", g[0]), { y: -220, rotate: -22, duration: 2.2, ease: "elastic.out(1,.45)", delay: .5 });
      gsap.from(".pdp-info > *, .pdp-story > :not(h2)", { y: 30, opacity: 0, stagger: .06, duration: 1, ease: "expo.out", delay: .25 });
      gsap.set("#pStamp", { opacity: 0 }); stamp($("#pStamp"), 1.2);
      gsap.from("#pTag", { rotate: -25, duration: 2, ease: "elastic.out(1,.3)", delay: .8 });
    });
    g.slice(1).forEach(m => gsap.from(m, { clipPath: "inset(100% 0% 0% 0% round 18px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: m, start: "top 85%" } }));
    gsap.fromTo($(".garment", g[1]), { translate: "0 18%" }, { translate: "0 -18%", ease: "none", scrollTrigger: { trigger: g[1], start: "top bottom", end: "bottom top", scrub: true } });
    g.forEach(m => m.addEventListener("click", () => {
      if (m.classList.contains("fail")) return;
      const z = $("#zoom"); $("img", z).src = m.dataset.z; window.TH.lenis?.stop();
      gsap.to(z, { autoAlpha: 1, duration: .4 }); gsap.fromTo($("img", z), { scale: .85 }, { scale: 1, duration: .7, ease: "expo.out" });
    }));
    $("#zoom").addEventListener("click", () => { gsap.to("#zoom", { autoAlpha: 0, duration: .35 }); window.TH.lenis?.start(); });
  }

  /* ================= DROPS ================= */
  function drops() {
    const ds = ["leather-bomber", "photo-crew", "no-days-off", "flare-denim", "navy-puffer"].map(byId), n = ds.length;
    $("#dStage").innerHTML = ds.map(p => `<div class="d-item"><img src="${p.img}" alt="${esc(p.name)}"></div>`).join("");
    $("#dGrid").innerHTML = ds.map(card).join(""); batchCards($("#dGrid"));
    $("#dSw").remove();
    const items = $$(".d-item"), mob = innerWidth < 820;
    const cluster = [[-80, -25, -12], [0, -40, 5], [80, -18, 10], [-42, 52, -7], [44, 58, 8]];
    items.forEach((it, j) => gsap.set(it, { xPercent: cluster[j][0] * (mob ? .7 : 1), yPercent: cluster[j][1], rotate: cluster[j][2], scale: .72, zIndex: j }));
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#drops", start: "top top", end: `+=${n * 90 + 60}%`, pin: true, scrub: .8, anticipatePin: 1, onUpdate: s => setI(Math.round(s.progress * n)) } });
    ds.forEach((_, i) => items.forEach((it, j) => {
      const a = (j - i) / n * Math.PI * 2;
      tl.to(it, j === i
        ? { xPercent: 0, yPercent: 0, rotate: 0, scale: mob ? 1.05 : 1.3, opacity: 1, zIndex: 10, duration: 1, ease: "power2.inOut" }
        : { xPercent: Math.cos(a) * (mob ? 120 : 230), yPercent: Math.sin(a) * (mob ? 130 : 150), rotate: a * 6, scale: .42, opacity: .3, zIndex: 1, duration: 1, ease: "power2.inOut" }, i);
    }));
    tl.to("#dWord", { xPercent: -30, duration: n, ease: "none" }, 0);
    let cur = -1;
    function setI(k) {
      if (k === cur) return; const prev = cur; cur = k;
      $("#dIdx").textContent = String(k).padStart(2, "0");
      const nm = $("#dName"), p = ds[k - 1];
      if (!p) { scramble(nm, "The full drop"); $("#dMeta").textContent = "Scroll to explore"; $("#dPrice").textContent = ""; $("#dBtn").href = "shop.html"; $("#dBtn").firstChild.textContent = "Shop the drop "; return; }
      scramble(nm, p.name); scramble($("#dMeta"), `${p.era} · Size ${p.size} · Grade ${p.grade}`, .6); $("#dPrice").textContent = fmt(p.price);
      $("#dBtn").href = "product.html?id=" + p.id; $("#dBtn").firstChild.textContent = "View piece ";
      gsap.fromTo($("img", items[k - 1]), { rotate: (k > prev ? 1 : -1) * 12 }, { rotate: 0, duration: 1.8, ease: "elastic.out(1,.3)" });
    }
    setI(0);
    window.TH.onEnter(() => gsap.from(items.map(i => i.firstElementChild), { y: -500, rotate: () => rnd(-60, 60), duration: 1.8, stagger: .1, ease: "bounce.out" }));
    const next = () => { const d = new Date(), t = new Date(d); t.setHours(20, 0, 0, 0); t.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); if (t <= d) t.setDate(t.getDate() + 7); return t; };
    const target = next(), el = k => $(`[data-cd="${k}"]`);
    const tick = () => {
      const s = Math.max(0, (target - new Date()) / 1000 | 0);
      const v = { d: s / 86400 | 0, h: (s % 86400) / 3600 | 0, m: (s % 3600) / 60 | 0, s: s % 60 };
      for (const k in v) { const t = String(v[k]).padStart(2, "0"); if (el(k).textContent !== t) { el(k).textContent = t; if (!reduce) gsap.fromTo(el(k), { yPercent: -20, opacity: .3 }, { yPercent: 0, opacity: 1, duration: .5, ease: "expo.out" }); } }
    };
    tick(); setInterval(tick, 1000);
  }

  /* ================= LOOKBOOK ================= */
  function lookbook() {
    const looks = [[L.look1, "Night shift", "leather-bomber"], [L.look2, "Soft armour", "grey-hoodie"], [L.look3, "Weekend uniform", "sunset-tee"], [L.look4, "Faded glory", "flare-denim"], [L.look5, "Off duty", "green-knit"], [L.look6, "Golden hour", "stripe-tee"], [L.look7, "Layer up", "olive-bomber"]];
    $("#lbTrack").insertAdjacentHTML("beforeend", looks.map(([src, t, id], i) => `
      <a class="lb-frame" href="product.html?id=${id}" data-cursor="Shop look">${media(src, t, "#cfc8bd")}
        <div class="lb-cap"><span class="mono">0${i + 1} — ${t}</span><span class="mono muted">Shop →</span></div></a>`).join(""));
    const tw = hScroll($("#lb"), $("#lbTrack"), {
      onUpdate: s => gsap.set("#lbProg i", { scaleX: s.progress }),
      onToggle: s => gsap.to("#lbProg", { opacity: s.isActive ? 1 : 0, duration: .3 })
    });
    $$(".lb-frame").forEach(f => {
      gsap.fromTo($("img", f), { xPercent: -10 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: f, containerAnimation: tw, start: "left right", end: "right left", scrub: true } });
      gsap.from(f, { rotate: 4, y: 80, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: f, containerAnimation: tw, start: "left 95%" } });
    });
    const mz = [[L.look5, 7, "4/5"], [L.look2, 5, "3/4"], [L.rack2, 4, "3/4"], [L.look6, 4, "3/4"], [L.look3, 4, "3/4"], [L.store, 12, "21/9"]];
    $("#mosaic").innerHTML = mz.map(([s, span, ar], i) => `<div style="grid-column:span ${span};${i === 1 ? "margin-top:20%" : ""}">${media(s, "", "#cfc8bd").replace('class="media ', `style="aspect-ratio:${ar}" class="media `)}</div>`).join("");
    $$("#mosaic .media").forEach(m => {
      gsap.from(m, { clipPath: "inset(30% 10% 30% 10% round 18px)", ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "top 40%", scrub: true } });
      gsap.fromTo($("img", m), { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  /* ================= ABOUT ================= */
  function about() {
    $("#aHero").src = L.store;
    const imgs = [L.rack2, L.flat, L.look7, L.rack];
    $("#stepsImg").innerHTML = imgs.map((s, i) => media(s, "", "#cfc8bd", i ? "" : "on")).join("");
    const si = $$("#stepsImg .media"), st = $$(".step");
    st.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%", onToggle: e => { if (e.isActive) { st.forEach(x => x.classList.toggle("on", x === s)); si.forEach((m, k) => m.classList.toggle("on", k === i)); } } }));
    st[0].classList.add("on");
    wordsFade($("#manifesto"));
  }

  /* ================= CONTACT ================= */
  function contact() {
    $("#igCard").href = window.TH_INSTAGRAM;
    $$("#faq details").forEach(d => d.addEventListener("toggle", () => ScrollTrigger.refresh()));
    $("#cForm").addEventListener("submit", e => {
      e.preventDefault(); let ok = true;
      $$("input,textarea", e.target).forEach(i => { const bad = !i.checkValidity(); i.parentNode.classList.toggle("err", bad); if (bad) ok = false; });
      if (!ok) { window.TH.toast("Please fill in the highlighted fields"); return; }
      e.target.reset(); window.TH.toast("Message sent ✳ We'll reply within a day");
    });
  }

  /* ================= CHECKOUT (receipt) ================= */
  function checkout() {
    const sum = $("#coSum"); sum.classList.add("receipt");
    const now = new Date().toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
    const render = () => {
      const items = store.get().map(byId), sub = items.reduce((s, p) => s + p.price, 0), ship = sub >= 5000 || !sub ? 0 : 250;
      sum.innerHTML = items.length ? `
        <h2 class="display h-s">The Thrift Hub</h2>
        <p class="r-sub">PRE-LOVED · ONE OF ONE<br>${now}</p>
        ${items.map(p => `<div class="co-line">${thumb(p)}<div><p style="font-weight:500;font-family:var(--f-body)">${p.name}</p><p class="muted">SIZE ${p.size} · GRADE ${p.grade}</p><button class="rm" data-rm="${p.id}">Remove</button></div><p>${fmt(p.price)}</p></div>`).join("")}
        <div class="totals"><div><span>Subtotal</span><span>${fmt(sub)}</span></div><div><span>Shipping</span><span>${ship ? fmt(ship) : "FREE"}</span></div><div class="grand"><span>TOTAL</span><span>${fmt(sub + ship)}</span></div></div>
        <div class="barcode"></div><p class="r-sub" style="border:0;margin-top:8px">Thank you for thrifting ✳</p>`
        : `<div class="cart-empty"><p class="display h-m">Your bag is empty</p><a class="btn" href="shop.html">Shop pieces <span class="arr">→</span></a></div>`;
      return { items, total: sub + ship };
    };
    render(); document.addEventListener("cart:change", render);
    window.TH.onEnter(() => {
      gsap.from("#coForm > *:not(h1)", { y: 30, opacity: 0, stagger: .04, duration: 1, ease: "expo.out" });
      if (!reduce) gsap.fromTo(sum, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 -20px 0)", duration: 1.6, ease: "steps(16)", delay: .3 });
    });
    $("#coForm").addEventListener("submit", e => {
      e.preventDefault();
      const { items, total } = render();
      if (!items.length) { window.TH.toast("Your bag is empty"); return; }
      let ok = true;
      $$("input:not([type=radio])", e.target).forEach(i => { const bad = !i.checkValidity(); i.parentNode.classList.toggle("err", bad); if (bad) ok = false; });
      if (!ok) { window.TH.toast("Please fill in the highlighted fields"); return; }
      const no = "TH-" + Math.floor(10000 + Math.random() * 90000);
      const pay = $("input[name=pay]:checked").value;
      const msg = `New order ${no}\n${items.map(p => `• ${p.name} (${p.size}) — ${fmt(p.price)}`).join("\n")}\nTotal: ${fmt(total)}\nPayment: ${pay.toUpperCase()}\nName: ${$("#fn").value}\nPhone: ${$("#fp").value}\nAddress: ${$("#fa").value}, ${$("#fc").value}`;
      store.set([]); window.TH.renderCart();
      $("#coMain").innerHTML = `<section class="success"><div>
        <span class="stamp" id="okStamp" data-rot="-12" style="margin-bottom:20px">Paid<small>${pay === "cod" ? "On delivery" : "Pending"}</small></span>
        <p class="mono eyebrow" style="justify-content:center">Order ${no}</p>
        <h1 class="display h-xl" id="okH" style="margin:20px 0">Thank <span class="italic">you!</span></h1>
        <p class="lead muted" style="margin:0 auto 30px">Your pieces are reserved. We'll confirm your order on WhatsApp and dispatch within 48 hours.</p>
        <div class="row" style="justify-content:center;flex-wrap:wrap">
          ${window.TH_WHATSAPP ? `<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${window.TH_WHATSAPP}?text=${encodeURIComponent(msg)}">Confirm on WhatsApp <span class="arr">→</span></a>` : ""}
          <a class="btn ghost" href="shop.html">Keep shopping <span class="arr">→</span></a></div></div></section>`;
      window.TH.lenis ? window.TH.lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
      gsap.from(window.TH.split($("#okH")), { yPercent: 115, stagger: .08, duration: 1.2, ease: "expo.out" });
      stamp($("#okStamp"), .6);
      ScrollTrigger.refresh();
    });
  }

  const routes = { home, shop, product, drops, lookbook, about, contact, checkout };
  routes[document.body.dataset.page]?.();
  window.TH.start();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
