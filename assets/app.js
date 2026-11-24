// Tiny static site: posts are listed in content/posts.json and written in Markdown.
(function () {
  const app = document.getElementById("app");
  const SECTIONS = {
    concepts: { title: "Concepts", layout: "gallery", blurb: "A feature for an app I use, or a new product. One a week." },
    thoughts: { title: "Thoughts", layout: "notes", blurb: "Short notes on products, markets, and what I'm learning." },
    memos: { title: "Memos", layout: "gallery", blurb: "How I'd underwrite a company: thesis, risks, and what it's worth." },
  };
  // Muted palette for generated covers (used when a post has no "cover" image)
  const PALETTE = [
    ["#c4663a", "#e9a26f"], ["#3f5e57", "#7fa597"], ["#4b5a7a", "#93a2c4"],
    ["#8a5a76", "#c99ab4"], ["#6b6a3c", "#b0ad6d"], ["#2f2f2d", "#6d6b66"],
  ];
  let posts = [];
  let site = {};

  document.getElementById("year").textContent = new Date().getFullYear();

  // Theme toggle (remembered per browser)
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

  function cover(p) {
    if (p.cover) return `<img src="${esc(p.cover)}" alt="" loading="lazy">`;
    const h = hash(p.slug);
    const [a, b] = PALETTE[p.palette ?? h % PALETTE.length];
    const kicker = typeLabel(p) || p.ticker || p.status || "";
    return `<div class="art" style="background:linear-gradient(160deg, ${a} 0%, ${b} 140%)">
      <span class="orb" style="width:60%;aspect-ratio:1;background:${b};right:-${10 + (h % 20)}%;top:${15 + (h % 30)}%"></span>
      <span class="kicker" style="position:relative">${esc(kicker)}</span>
      <span class="mark" style="position:relative">${esc(p.mark || p.title)}</span>
    </div>`;
  }

  const LETTER = { concepts: "C", thoughts: "T", memos: "M" };
  const KIND = { concepts: "Concept", thoughts: "Thought", memos: "Memo" };
  const typeLabel = (p) => p.type === "feature" ? `Feature${p.app ? ` · ${p.app}` : ""}` : p.type === "product" ? "New product" : "";
  const code = (p) => `${LETTER[p.section]}–${p.no}`;
  const shortDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const row = (p) => `<a class="row" href="#/${p.section}/${p.slug}" data-slug="${p.section}/${p.slug}">
      <span class="r-no mono">${code(p)}</span>
      <span class="r-thumb">${cover(p)}</span>
      <span class="r-main"><span class="r-title">${esc(p.title)}</span><span class="r-sum">${esc(p.summary)}</span></span>
      <span class="r-kind mono">${esc(typeLabel(p) || p.ticker || p.status || KIND[p.section])}</span>
      <span class="r-date mono">${shortDate(p.date)}</span>
    </a>`;

  function seasonStrip() {
    const S = site.season; if (!S) return "";
    const cells = Array.from({ length: S.weeks }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      const state = i < S.week ? "done" : i === S.week ? "up" : "";
      return `<span class="wk ${state}" title="Week ${n}${state === "up" ? " · up next" : ""}"><i>${n}</i></span>`;
    }).join("");
    return `<div class="season">
      <div class="season-head mono"><span>Week ${String(S.week).padStart(2, "0")} / ${S.weeks}</span></div>
      <div class="weeks">${cells}</div>
    </div>`;
  }

  // keys: "" = everything (home), or a section key
  function index(key) {
    const items = key ? posts.filter((p) => p.section === key) : posts;
    const TYPES = [["feature", "Features"], ["product", "New products"]];
    const groups = key === "concepts"
      ? [["", "All"], ...TYPES]
      : key
      ? [["", "All"], ...[...new Set(items.flatMap((p) => p.tags || []))].map((t) => [t, t])]
      : [["", "All"], ...Object.keys(SECTIONS).map((k) => [k, SECTIONS[k].title])];
    const match = (p, g) => !g || (key === "concepts" ? p.type === g : key ? (p.tags || []).includes(g) : p.section === g);
    const count = (g) => items.filter((p) => match(p, g)).length;
    const head = key
      ? `<section class="page-top${key === "concepts" ? " with-season" : ""}"><h1>${esc(SECTIONS[key].blurb || SECTIONS[key].title)}</h1>${key === "concepts" ? seasonStrip() : ""}</section>`
      : `<section class="hero"><h1>${site.headline}</h1></section>`;
    app.innerHTML = `${head}
      <section class="index">
        <div class="filters mono">${groups.map(([g, label], i) => `<button class="${i ? "" : "on"}" data-g="${esc(g)}">${esc(label)}<sup>${String(count(g)).padStart(2, "0")}</sup></button>`).join("")}</div>
        <div class="rows" id="list">${items.map(row).join("")}</div>
      </section>`;
    app.querySelectorAll(".filters button").forEach((b) => b.addEventListener("click", () => {
      app.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b));
      const g = b.dataset.g;
      document.getElementById("list").innerHTML = items.filter((p) => match(p, g)).map(row).join("");
    }));
  }

  // Floating cover preview that follows the cursor over index rows (desktop)
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const pv = document.createElement("div"); pv.className = "peek"; document.body.appendChild(pv);
    let cur = "";
    addEventListener("mousemove", (e) => {
      const r = e.target.closest && e.target.closest(".row");
      if (!r) { pv.classList.remove("show"); cur = ""; return; }
      if (r.dataset.slug !== cur) {
        cur = r.dataset.slug; const [sec, slug] = cur.split("/");
        const p = posts.find((x) => x.section === sec && x.slug === slug); pv.innerHTML = p ? cover(p) : "";
      }
      pv.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 90}px)`;
      pv.classList.add("show");
    });
    addEventListener("hashchange", () => pv.classList.remove("show"));
  }

  async function article(key, slug) {
    const p = posts.find((x) => x.section === key && x.slug === slug);
    if (!p) return notFound();
    const md = await fetch(`content/${key}/${slug}.md`).then((r) => (r.ok ? r.text() : "")).catch(() => "");
    const memo = p.memo
      ? `<div class="memo-box">${Object.entries(p.memo).map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`
      : "";
    const hero = SECTIONS[key].layout === "gallery" ? `<div class="hero"><div class="cover">${cover(p)}</div></div>` : "";
    const ownOverview = /^\s*##\s+overview/i.test(md);
    app.innerHTML = `<nav class="crumb"><a href="#/${key}">← ${SECTIONS[key].title}</a><span>/</span><strong>${esc(p.title)}</strong></nav>
    ${hero ? `<div class="wide-hero"><div class="cover">${cover(p)}</div></div>` : ""}
    <div class="article-layout">
    <aside class="toc" aria-label="On this page"></aside>
    <article class="article" id="top">
      <h1>${esc(p.title)}</h1>
      <div class="facts">${[
        p.week ? ["Week", String(p.week).padStart(2, "0") + " · " + new Date(p.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })] : ["Date", fmtDate(p.date)],
        typeLabel(p) ? ["Type", typeLabel(p)] : p.ticker ? ["Ticker", p.ticker] : null,
        p.scope ? ["Scope", p.scope] : p.status ? ["Status", p.status] : null,
        p.collaborators ? ["Collaborators", p.collaborators] : null,
      ].filter(Boolean).map(([k, v]) => `<div><span>${k}</span>${(Array.isArray(v) ? v : [v]).map((x) => `<strong>${esc(x)}</strong>`).join("")}</div>`).join("")}</div>
      ${ownOverview ? "" : `<p class="lede">${esc(p.summary)}</p>`}
      ${memo}
      <div class="prose">${marked.parse(md)}</div>
      ${p.type === "feature" && p.app ? `<p class="disclaimer">A personal concept. Not affiliated with or endorsed by ${esc(p.app)}.</p>` : ""}
      ${key === "memos" ? `<p class="disclaimer">These are personal views for discussion only and are not investment advice. I may hold positions in securities mentioned.</p>` : ""}
    </article></div>`;
    window.scrollTo(0, 0);
    buildToc();
  }

  // ---------- Sidebar table of contents with scroll-spy ----------
  function buildToc() {
    const toc = app.querySelector(".toc"); const heads = [...app.querySelectorAll(".prose h2")];
    if (!toc || heads.length < 2) { toc && toc.remove(); app.querySelector(".article-layout")?.classList.add("no-toc"); return; }
    const own = heads[0].textContent.trim().toLowerCase() === "overview";
    const targets = own ? heads : [app.querySelector("#top"), ...heads];
    toc.innerHTML = targets.map((h, i) => `<button type="button" data-t="${i}">${!own && !i ? "Overview" : esc(h.textContent)}</button>`).join("");
    const btns = [...toc.querySelectorAll("button")];
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    btns.forEach((b) => b.addEventListener("click", () => {
      const t = targets[+b.dataset.t]; const y = t.getBoundingClientRect().top + scrollY - (!own && !+b.dataset.t ? 120 : 24);
      scrollTo({ top: Math.max(0, y), behavior: still ? "auto" : "smooth" });
    }));
    const spy = () => {
      if (!toc.isConnected) return removeEventListener("scroll", spy);
      const line = Math.min(innerHeight * 0.3, 160); let cur = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < line) cur = own ? i : i + 1; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = targets.length - 1;
      btns.forEach((b, i) => b.classList.toggle("on", i === cur));
    };
    addEventListener("scroll", spy, { passive: true }); spy();
  }

  // ---------- Shelf: a real bookshelf ----------
  async function shelf() {
    const data = await fetch("content/shelf.json").then((r) => r.json()).catch(() => null);
    if (!data) return notFound();
    const rows = Object.fromEntries(data.rows.map((r) => [r.key, r]));
    const all = []; // flat list so every spine has an index
    const tint = (c) => c || "#8d8c88";
    const styleOf = (it) => ["band", "block", "plain", "rule"][hash(it.title) % 4];

    const spine = (it, kind, last) => {
      const i = all.push({ ...it, kind }) - 1;
      const h = hash(it.title);
      if (kind === "paper") {
        const w = 150 + (h % 50);
        return `<button class="sp paper" data-i="${i}" style="width:${w}px" aria-label="${esc(it.title)}"><span>${esc(it.title)}</span></button>`;
      }
      if (kind === "cd") return `<button class="sp cd" data-i="${i}" style="--c:${tint(it.color)}" aria-label="${esc(it.title)} by ${esc(it.by)}"><span class="t">${esc(it.title)}</span></button>`;
      if (kind === "film") return `<button class="sp film" data-i="${i}" style="--c:${tint(it.color)}" aria-label="${esc(it.title)}"><span class="t">${esc(it.title)}</span><i class="dot"></i></button>`;
      const w = Math.round(24 + Math.min(it.pages || 300, 640) / 640 * 26);
      const ht = 74 + (h % 20);
      return `<button class="sp book s-${styleOf(it)}${last ? " lean" : ""}" data-i="${i}" style="--c:${tint(it.color)};--ink:${it.ink || "#fff"};width:${w}px;height:${ht}%" aria-label="${esc(it.title)} by ${esc(it.by)}">
        <span class="t">${esc(it.title)}</span><i class="dot"></i></button>`;
    };

    const shelfHtml = (keys, si) => {
      const books = keys.filter((k) => rows[k] && rows[k].kind === "book").flatMap((k) => rows[k].items);
      const stand = keys.filter((k) => rows[k] && ["cd", "film"].includes(rows[k].kind));
      const flat = keys.filter((k) => rows[k] && rows[k].kind === "paper").flatMap((k) => rows[k].items);
      let html = books.map((it) => spine(it, "book")).join("");
      stand.forEach((k, n) => { if (n || books.length) html += `<span class="gap"></span>`; html += rows[k].items.map((it) => spine(it, rows[k].kind)).join(""); });
      if (flat.length) html += `<span class="gap"></span><span class="stack">${flat.map((it) => spine(it, "paper")).join("")}</span>`;
      return `<section class="shelf-unit" data-s="${si}">
        <div class="ledge"><div class="row-of">${html}</div></div>
        <div class="plank"></div>
        <div class="pulled" aria-live="polite"></div>
      </section>`;
    };

    app.innerHTML = `${(data.shelves || data.rows.map((r) => [r.key])).map(shelfHtml).join("")}`;

    const detail = (it) => {
      const vis = it.kind === "paper"
        ? `<div class="pv paper-shot">${it.cover ? `<img src="${esc(it.cover)}" alt="">` : `<b>${esc(it.title)}</b><small>${esc(it.by)}</small>${[92, 100, 96, 100, 84, 97].map((w) => `<i style="width:${w}%"></i>`).join("")}`}</div>`
        : `<div class="pv cover-${it.kind}" style="--c:${tint(it.color)};--ink:${it.ink || "#fff"}">${it.cover ? `<img src="${esc(it.cover)}" alt="">` : `<span>${esc(it.title)}</span><small>${esc(it.by)}</small>`}</div>`;
      const kindName = { book: "Book", cd: "Album", film: "Film", paper: "Paper" }[it.kind];
      return `<div class="pulled-in">${vis}<div class="pt">
        <div class="eyebrow mono">${kindName}${it.year ? ` · ${it.year}` : ""}${it.venue ? ` · ${esc(it.venue)}` : ""}</div>
        <h3>${esc(it.title)}</h3><div class="by">${esc(it.by)}</div>
        <p>${it.note ? esc(it.note) : `<span class="muted">Why it stayed on the shelf goes here.</span>`}</p>
        ${it.link ? `<a class="read" href="${esc(it.link)}" target="_blank" rel="noopener">Read the paper ↗</a>` : ""}
      </div><button class="close" aria-label="Put it back">Put back</button></div>`;
    };
    app.querySelectorAll(".shelf-unit").forEach((unit) => {
      const out = unit.querySelector(".pulled");
      const reset = () => { unit.querySelectorAll(".sp.on").forEach((x) => x.classList.remove("on")); out.innerHTML = ""; };
      unit.querySelectorAll(".sp").forEach((b) => b.addEventListener("click", () => {
        const was = b.classList.contains("on"); reset(); if (was) return;
        b.classList.add("on"); out.innerHTML = detail(all[+b.dataset.i]);
        out.querySelector(".close").addEventListener("click", reset);
      }));
    });
  }

  // ---------- Ideas: a plain running list ----------
  async function ideas() {
    const data = await fetch("content/ideas.json").then((r) => r.json()).catch(() => null);
    if (!data) return notFound();
    const list = [...data.ideas].sort((a, b) => b.date.localeCompare(a.date));
    app.innerHTML = `<section class="page-top"><h1>${esc(data.title)}</h1></section>
      <ul class="ideas">${list.map((it) => `<li>
        <span class="i-date mono">${shortDate(it.date)}</span>
        <span class="i-main"><span class="i-title">${esc(it.title)}</span>${it.note ? `<span class="i-note">${esc(it.note)}</span>` : ""}</span>
        ${it.concept ? `<a class="i-link" href="#/concepts/${esc(it.concept)}">Became a concept →</a>` : ""}
      </li>`).join("")}</ul>`;
  }

  async function about() {
    const md = await fetch("content/about.md").then((r) => r.text()).catch(() => "");
    app.innerHTML = `<article class="article"><h1>About</h1><div class="prose">${marked.parse(md)}</div></article>`;
  }

  function notFound() {
    app.innerHTML = `<div class="intro"><h1>Not found</h1><p><a href="#/">Go home</a></p></div>`;
  }

  // Reading progress bar on articles
  const bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  window.addEventListener("scroll", () => {
    const on = !!document.querySelector(".article .prose");
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${on && h > 0 ? scrollY / h : 0})`;
  }, { passive: true });

  // ---------- Loupe cursor (desktop only) ----------
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dot = document.createElement("div"); dot.className = "loupe-dot";
    const ring = document.createElement("div"); ring.className = "loupe-ring"; ring.innerHTML = "<span></span>";
    document.body.append(ring, dot); document.documentElement.classList.add("has-loupe");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px)`; document.documentElement.classList.remove("loupe-out"); });
    document.addEventListener("mouseleave", () => document.documentElement.classList.add("loupe-out"));
    (function tick() { rx += (mx - rx) * (still ? 1 : 0.2); ry += (my - ry) * (still ? 1 : 0.2); ring.style.transform = `translate(${rx}px, ${ry}px)`; requestAnimationFrame(tick); })();
    addEventListener("mousedown", () => ring.classList.add("press")); addEventListener("mouseup", () => ring.classList.remove("press"));
  }

  function route() {
    const [, key, slug] = (location.hash.replace(/^#/, "") || "/").split("/");
    const active = key || "";
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === active));
    if (!key) index("");
    else if (key === "about") about();
    else if (key === "shelf") shelf();
    else if (key === "ideas") ideas();
    else if (SECTIONS[key] && slug) article(key, slug);
    else if (SECTIONS[key]) index(key);
    else notFound();
  }

  fetch("content/posts.json")
    .then((r) => r.json())
    .then((data) => {
      site = data.site;
      posts = data.posts.sort((a, b) => b.date.localeCompare(a.date));
      for (const key of Object.keys(SECTIONS)) {
        const list = posts.filter((p) => p.section === key);
        list.forEach((p, i) => { p.no = String(list.length - i).padStart(2, "0"); });
      }
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(() => { app.innerHTML = "<p>Could not load content. If opening locally, run a local server (see README).</p>"; });
})();
