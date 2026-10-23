/* =========================================================
   THE THRIFT HUB — shared engine
   Lenis smooth scroll · GSAP ScrollTrigger · page transitions
   cart drawer · cursor · split-text reveals · marquee
   ========================================================= */
(() => {
  const P = window.TH_PRODUCTS, L = window.TH_LIFESTYLE;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const page = document.body.dataset.page || "";
  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger, window.Flip || {});
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.config({ force3D: true });

  /* ---------- helpers ---------- */
  const fmt = n => "Rs " + n.toLocaleString("en-PK");
  const byId = id => P.find(p => p.id === id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const media = (src, label, tone = "", cls = "", extra = "") =>
    `<div class="media ${cls}" style="--tone:${tone}" data-label="${esc(label)}">
      <img src="${src}" alt="${esc(label)}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('fail')">${extra}</div>`;
  const sticker = p => p.tag ? `<span class="sticker ${p.tag.startsWith("-") ? "sale" : p.tag === "New" ? "new" : ""}">${p.tag}</span>` : "";
  const thumb = p => `<div class="g-thumb" style="--c:${p.c}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></div>`;
  const card = p => `
    <a class="card" href="product.html?id=${p.id}" data-cursor="${fmt(p.price)}" data-cat="${p.cat}" data-price="${p.price}">
      <div class="g-stage" style="--c:${p.c}" data-tilt>
        <img class="garment" src="${p.img}" alt="${esc(p.name)}" loading="lazy" decoding="async">
        ${sticker(p)}<span class="g-grade">Grade ${p.grade}</span>
        <button class="quick" data-add="${p.id}" type="button">+ Add to bag</button>
      </div>
      <div class="card-info"><div><h3>${p.name}</h3><p class="mono muted" style="margin-top:4px">${p.era} · Size ${p.size}</p></div>
      <p class="price">${fmt(p.price)}${p.was ? `<s>${fmt(p.was)}</s>` : ""}</p></div>
    </a>`;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("th_cart") || "[]").filter(byId); } catch { return this._m || []; } },
    set(v) { this._m = v; try { localStorage.setItem("th_cart", JSON.stringify(v)); } catch {} }
  };
  window.TH = { $, $$, fmt, byId, media, card, thumb, sticker, store, esc, reduce, fine };

  /* text scramble — thrift-receipt glitch */
  const GLY = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789#%&*+=/<>";
  function scramble(el, text = el.dataset.text || el.textContent, dur = .9) {
    el.dataset.text = text;
    if (reduce) { el.textContent = text; return; }
    const o = { p: 0 };
    gsap.killTweensOf(el._o || {}); el._o = o;
    gsap.to(o, { p: 1, duration: dur, ease: "power2.out", onUpdate: () => {
      const n = Math.floor(o.p * text.length);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map(c => c === " " ? " " : GLY[Math.random() * GLY.length | 0]).join("");
    }, onComplete: () => { el.textContent = text; } });
  }
  /* rubber stamp slam */
  function stamp(el, delay = 0) {
    if (reduce) return;
    gsap.fromTo(el, { scale: 2.6, opacity: 0, rotate: -40 }, { scale: 1, opacity: 1, rotate: el.dataset.rot || -12, duration: .45, ease: "power4.in", delay,
      onComplete: () => { gsap.fromTo(el.parentElement, { x: -3 }, { x: 0, duration: .5, ease: "elastic.out(1,.2)" }); } });
  }
  window.TH.scramble = scramble; window.TH.stamp = stamp;

  /* ---------- chrome: header / menu / drawer / footer ---------- */
  const links = [["Shop", "shop.html"], ["Drops", "drops.html"], ["Lookbook", "lookbook.html"], ["About", "about.html"], ["Contact", "contact.html"]];
  const navA = ([t, h]) => `<a href="${h}" class="${location.pathname.endsWith(h) ? "active" : ""}"><span>${t}</span><span>${t}</span></a>`;
  document.body.insertAdjacentHTML("afterbegin", `
    <header class="header ${document.body.dataset.header === "dark" ? "on-dark" : ""}">
      <div class="h-left"><nav class="nav">${links.slice(0, 4).map(navA).join("")}</nav>
        <button class="menu-btn" aria-label="Menu" aria-expanded="false"><i></i><i></i></button></div>
      <a href="index.html" class="logo" aria-label="The Thrift Hub home"><b>TH</b>Thrift Hub</a>
      <div class="h-right"><a class="hide-m link-u" href="contact.html">Help</a><a class="hide-m link-u" href="${window.TH_INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
        <button class="bag-btn" data-open-cart>Bag <span class="bag-count">0</span></button></div>
    </header>
    <div class="mobile-menu" aria-hidden="true"><nav>${[["Home", "index.html"], ...links].map(([t, h]) => `<a href="${h}"><span>${t}</span></a>`).join("")}</nav>
      <div class="row between mono"><a href="${window.TH_INSTAGRAM}" target="_blank" rel="noopener">Instagram ↗</a><span>Pre-loved / 1 of 1</span></div></div>
    <div class="drawer-bg" data-close-cart></div>
    <aside class="drawer" aria-label="Shopping bag">
      <div class="drawer-head"><h3 class="display h-s">Your bag <sup class="mono" id="dCount">0</sup></h3><button class="x-btn" data-close-cart aria-label="Close">✕</button></div>
      <div class="drawer-body" data-lenis-prevent id="dBody"></div>
      <div class="drawer-foot" id="dFoot"></div>
    </aside>
    <div class="cursor"></div><div class="ctag" aria-hidden="true"><i></i><span>Rs 0</span></div>
    <div class="pt">${"<i></i>".repeat(5)}</div>
    <div class="toast" role="status"></div>`);

  if (!document.body.dataset.nofooter) document.body.insertAdjacentHTML("beforeend", `
    <footer class="footer">
      <div class="foot-grid">
        <div><p class="display h-m" style="max-width:12ch">Pre-loved pieces. New stories.</p>
          <p class="muted" style="margin-top:18px;color:rgba(255,255,255,.55);max-width:36ch">Hand-picked thrift & vintage streetwear. Every piece cleaned, graded and one of one.</p></div>
        <div><h4>Shop</h4><ul><li><a class="link-u" href="shop.html">All pieces</a></li><li><a class="link-u" href="shop.html?cat=Jackets">Jackets</a></li><li><a class="link-u" href="shop.html?cat=Hoodies">Hoodies</a></li><li><a class="link-u" href="shop.html?cat=Tees">Tees</a></li><li><a class="link-u" href="drops.html">Weekly drop</a></li></ul></div>
        <div><h4>Brand</h4><ul><li><a class="link-u" href="about.html">Our story</a></li><li><a class="link-u" href="lookbook.html">Lookbook</a></li><li><a class="link-u" href="contact.html">Contact</a></li><li><a class="link-u" href="contact.html#faq">FAQ</a></li></ul></div>
        <div><h4>Follow</h4><ul><li><a class="link-u" href="${window.TH_INSTAGRAM}" target="_blank" rel="noopener">Instagram ↗</a></li><li><a class="link-u" href="contact.html">WhatsApp ↗</a></li></ul></div>
      </div>
      <div class="foot-word" aria-hidden="true">${"THRIFTHUB".split("").map(c => `<span>${c}</span>`).join("")}</div>
      <div class="foot-bottom mono"><span>© ${new Date().getFullYear()} The Thrift Hub</span><span>Cash on delivery · Nationwide shipping</span><a href="#" data-top>Back to top ↑</a></div>
    </footer>`);

  const header = $(".header"), toast = $(".toast");
  const showToast = (msg) => { toast.innerHTML = msg; toast.classList.add("show"); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove("show"), 2600); };
  window.TH.toast = showToast;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.TH.lenis = lenis;
  $$("[data-top]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" }); }));

  /* header hide / glass */
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 40);
    header.classList.toggle("hide", y > lastY && y > 300 && !document.body.classList.contains("menu-open"));
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* mobile menu */
  const mm = $(".mobile-menu"), mb = $(".menu-btn");
  mb.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open); mb.setAttribute("aria-expanded", open); mm.setAttribute("aria-hidden", !open);
    if (open) {
      lenis?.stop();
      gsap.set(mm, { visibility: "visible" });
      gsap.to(mm, { clipPath: "inset(0 0 0% 0)", duration: .8, ease: "expo.inOut" });
      gsap.fromTo($$("nav a span", mm), { yPercent: 110 }, { yPercent: 0, stagger: .06, duration: .9, ease: "expo.out", delay: .35 });
    } else {
      lenis?.start();
      gsap.to(mm, { clipPath: "inset(0 0 100% 0)", duration: .7, ease: "expo.inOut", onComplete: () => gsap.set(mm, { visibility: "hidden" }) });
    }
  });

  /* ---------- cart ---------- */
  const SHIP_FREE = 5000;
  function renderCart() {
    const items = store.get().map(byId), total = items.reduce((s, p) => s + p.price, 0);
    $$(".bag-count").forEach(b => { b.textContent = items.length; });
    $("#dCount").textContent = items.length;
    $("#dBody").innerHTML = items.length ? items.map(p => `
      <div class="c-line">${thumb(p)}
        <div><h4>${p.name}</h4><p class="mono muted" style="margin-top:4px">Size ${p.size} · Grade ${p.grade}</p><button class="rm" data-rm="${p.id}">Remove</button></div>
        <p class="mono">${fmt(p.price)}</p></div>`).join("")
      : `<div class="cart-empty"><p class="display h-m">Bag's empty</p><p class="muted">Every piece is one of one — grab it before someone else does.</p><a class="btn" href="shop.html">Shop pieces <span class="arr">→</span></a></div>`;
    const left = Math.max(0, SHIP_FREE - total);
    $("#dFoot").innerHTML = items.length ? `
      <p style="font-size:14px">${left ? `Add <b>${fmt(left)}</b> more for free shipping` : "You've unlocked <b>free shipping</b> ✳"}</p>
      <div class="ship-bar"><i style="width:${Math.min(100, total / SHIP_FREE * 100)}%"></i></div>
      <div class="row between"><span>Subtotal</span><span class="mono" style="font-size:18px">${fmt(total)}</span></div>
      <a class="btn full" href="checkout.html">Checkout <span class="arr">→</span></a>` : "";
    document.dispatchEvent(new CustomEvent("cart:change"));
  }
  const openCart = () => { document.body.classList.add("cart-open"); lenis?.stop(); };
  const closeCart = () => { document.body.classList.remove("cart-open"); if (!document.body.classList.contains("menu-open")) lenis?.start(); };
  function addToCart(id, fromEl) {
    const c = store.get();
    if (c.includes(id)) { showToast("Already in your bag — it's one of one ✳"); openCart(); return; }
    c.push(id); store.set(c);
    const bump = () => { renderCart(); const b = $(".bag-count"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); };
    const img = fromEl && fromEl.querySelector("img");
    if (img && !reduce && img.offsetWidth) {
      const r = img.getBoundingClientRect(), t = $(".bag-btn").getBoundingClientRect();
      const f = document.createElement("div"); f.className = "fly"; f.innerHTML = `<img src="${img.src}" style="width:100%;height:100%;object-fit:cover">`;
      Object.assign(f.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
      document.body.append(f);
      gsap.to(f, { left: t.left + t.width / 2 - 10, top: t.top + t.height / 2 - 10, width: 20, height: 20, borderRadius: 20, duration: .9, ease: "power3.inOut", onComplete: () => { f.remove(); bump(); } });
    } else bump();
    showToast(`<b>${byId(id).name}</b> added to bag`);
  }
  window.TH.addToCart = addToCart; window.TH.openCart = openCart; window.TH.renderCart = renderCart;
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { e.preventDefault(); e.stopPropagation(); addToCart(add.dataset.add, add.closest(".card,.pdp,.hang") || null); return; }
    const rm = e.target.closest("[data-rm]");
    if (rm) { store.set(store.get().filter(i => i !== rm.dataset.rm)); renderCart(); return; }
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); return; }
    if (e.target.closest("[data-close-cart]")) closeCart();
  });
  addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
  addEventListener("storage", renderCart);
  renderCart();

  /* ---------- page transition ---------- */
  const ptI = $$(".pt i");
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    gsap.set(ptI, { transformOrigin: "bottom" });
    gsap.to(ptI, { scaleY: 1, duration: .55, stagger: .05, ease: "expo.inOut", onComplete: () => { location.href = href; } });
  });
  addEventListener("pageshow", e => { if (e.persisted) gsap.set(ptI, { scaleY: 0 }); });

  /* ---------- split text ---------- */
  function split(el) {
    const nodes = [...el.childNodes]; el.textContent = "";
    const wrap = n => { const w = document.createElement("span"), s = document.createElement("span"); w.className = "w"; s.append(n); w.append(s); el.append(w); };
    nodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) el.append(" "); else wrap(document.createTextNode(t)); });
      else if (n.nodeName === "BR") el.append(n);
      else wrap(n);
    });
    return $$(".w>span", el);
  }
  window.TH.split = split;

  /* ---------- enter animations ---------- */
  const enterQ = [];
  window.TH.onEnter = fn => enterQ.push(fn);
  function runEnter() {
    $$("[data-split='load']").forEach(el => gsap.from(split(el), { yPercent: 115, rotate: 4, duration: 1.3, stagger: .06, ease: "expo.out" }));
    enterQ.forEach(f => f());
  }

  function initScroll() {
    $$("[data-split]:not([data-split='load'])").forEach(el => {
      gsap.from(split(el), { yPercent: 115, duration: 1.2, stagger: .05, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%", once: true,
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: "expo.out", overwrite: true })
    });
    $$("[data-parallax]").forEach(el => {
      const s = parseFloat(el.dataset.parallax) || 15;
      gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-count]").forEach(el => {
      const end = +el.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, ease: "expo.out", onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString(); } }) });
    });
    $$(".rule").forEach(el => gsap.from(el, { scaleX: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
    /* marquees react to scroll velocity + direction */
    $$(".marquee-track").forEach(tr => {
      tr.innerHTML += tr.innerHTML;
      const tw = gsap.to(tr, { xPercent: -50, duration: +(tr.dataset.speed || 22), ease: "none", repeat: -1 });
      tw.totalTime(tw.duration() * 50);
      let dir = 1;
      tw.pause();
      ScrollTrigger.create({ trigger: tr.parentElement, start: "top bottom", end: "bottom top", onToggle: s => tw.paused(!s.isActive), onUpdate: s => {
        dir = s.direction;
        const v = Math.min(Math.abs(s.getVelocity()) / 250, 5);
        gsap.to(tw, { timeScale: dir * (1 + v), duration: .25, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: dir, duration: 1.2 }) });
      } });
    });
    $$("[data-scramble]").forEach(el => { el.dataset.text = el.textContent; ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => scramble(el) }); });
    $$("[data-stamp]").forEach(el => { gsap.set(el, { opacity: 0 }); ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => stamp(el) }); });
    /* footer wordmark */
    const fw = $$(".foot-word span");
    if (fw.length) gsap.from(fw, { yPercent: 100, opacity: 0, stagger: .04, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".foot-word", start: "top 98%" } });
  }

  /* ---------- cursor (price-tag) + magnetic + tilt ---------- */
  if (fine && !reduce) {
    const cur = $(".cursor"), tag = $(".ctag"), lab = $("span", tag);
    const xT = gsap.quickTo(cur, "x", { duration: .3, ease: "power3" }), yT = gsap.quickTo(cur, "y", { duration: .3, ease: "power3" });
    const txT = gsap.quickTo(tag, "x", { duration: .55, ease: "power3" }), tyT = gsap.quickTo(tag, "y", { duration: .55, ease: "power3" });
    const rT = gsap.quickTo(tag, "rotate", { duration: .8, ease: "elastic.out(1,.35)" });
    let lx = 0, lastTilt = null;
    addEventListener("mousemove", e => {
      xT(e.clientX); yT(e.clientY); txT(e.clientX); tyT(e.clientY);
      rT(gsap.utils.clamp(-40, 40, (lx - e.clientX) * 1.6)); lx = e.clientX;
      cur.style.opacity = 1;
      const t = e.target.closest("[data-tilt]");
      if (lastTilt && lastTilt !== t) gsap.to($(".garment", lastTilt) || lastTilt, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1,.4)", overwrite: "auto" });
      if (t) { const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to($(".garment", t) || t, { rotateY: x * 22, rotateX: -y * 16, transformPerspective: 800, duration: .6, ease: "power3", overwrite: "auto" }); }
      lastTilt = t;
    });
    document.addEventListener("mouseover", e => {
      const t = e.target.closest("[data-cursor]");
      if (t && !e.target.closest("button")) {
        if (lab.textContent !== t.dataset.cursor) scramble(lab, t.dataset.cursor, .5);
        document.body.classList.add("tagging");
      } else document.body.classList.remove("tagging");
    });
    let lastMag = null;
    document.addEventListener("mousemove", e => {
      const m = e.target.closest(".btn,[data-magnetic]");
      if (lastMag && lastMag !== m) gsap.to(lastMag, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.4)", overwrite: "auto" });
      if (m) { const r = m.getBoundingClientRect(); gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: "power3", overwrite: "auto" }); }
      lastMag = m;
    }, { passive: true });
  }

  /* ---------- boot ---------- */
  const start = () => {
    initScroll();
    const pre = $(".preloader");
    let seen = false; try { seen = sessionStorage.getItem("th_seen"); sessionStorage.setItem("th_seen", 1); } catch {}
    if (pre && !seen && !reduce) {
      gsap.set(ptI, { scaleY: 0 });
      lenis?.stop(); scrollTo(0, 0);
      const o = { v: 0 }, num = $(".count", pre);
      gsap.timeline()
        .to(o, { v: 100, duration: 1.5, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(o.v)).padStart(3, "0"); } })
        .to($(".bar i", pre), { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
        .from($$(".pre-line span", pre), { yPercent: 110, stagger: .08, duration: 1, ease: "expo.out" }, .1)
        .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" })
        .add(() => { pre.remove(); lenis?.start(); runEnter(); }, "-=.45");
    } else {
      pre?.remove();
      if (reduce) { gsap.set(ptI, { scaleY: 0 }); runEnter(); return; }
      gsap.set(ptI, { scaleY: 1, transformOrigin: "top" });
      gsap.to(ptI, { scaleY: 0, duration: .7, stagger: .05, ease: "expo.inOut", delay: .05 });
      gsap.delayedCall(.35, runEnter);
    }
  };
  window.TH.start = start;
  // pages call TH.start() after building their DOM
})();
