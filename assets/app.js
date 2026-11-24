// Tiny static site: posts are listed in content/posts.json and written in Markdown.
(function () {
  const app = document.getElementById("app");
  const SECTIONS = {
    concepts: { title: "Concepts", layout: "gallery", blurb: "Small problems I noticed, and the products I'd build to fix them." },
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
    const kicker = `No. ${p.no}` + ((p.ticker || p.status) ? ` · ${p.ticker || p.status}` : "");
    return `<div class="art" style="background:linear-gradient(160deg, ${a} 0%, ${b} 140%)">
      <span class="orb" style="width:60%;aspect-ratio:1;background:${b};right:-${10 + (h % 20)}%;top:${15 + (h % 30)}%"></span>
      <span class="kicker" style="position:relative">${esc(kicker)}</span>
      <span class="mark" style="position:relative">${esc(p.mark || p.title)}</span>
    </div>`;
  }

  const LETTER = { concepts: "C", thoughts: "T", memos: "M" };
  const KIND = { concepts: "Concept", thoughts: "Thought", memos: "Memo" };
  const code = (p) => `${LETTER[p.section]}–${p.no}`;
  const shortDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  const row = (p) => `<a class="row" href="#/${p.section}/${p.slug}" data-slug="${p.section}/${p.slug}">
      <span class="r-no mono">${code(p)}</span>
      <span class="r-thumb">${cover(p)}</span>
      <span class="r-main"><span class="r-title">${esc(p.title)}</span><span class="r-sum">${esc(p.subtitle || p.summary)}</span></span>
      <span class="r-kind mono">${esc(p.ticker || p.status || KIND[p.section])}</span>
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
      <div class="season-head mono"><span>${esc(S.label)} · ${esc(S.theme)}</span><span>Week ${String(S.week).padStart(2, "0")} / ${S.weeks}</span></div>
      <div class="weeks">${cells}</div>
      ${site.now ? `<p class="now"><span class="dot"></span>${site.now}</p>` : ""}
    </div>`;
  }

  // keys: "" = everything (home), or a section key
  function index(key) {
    const items = key ? posts.filter((p) => p.section === key) : posts;
    const groups = key
      ? [["", "All"], ...[...new Set(items.flatMap((p) => p.tags || []))].map((t) => [t, t])]
      : [["", "All"], ...Object.keys(SECTIONS).map((k) => [k, SECTIONS[k].title])];
    const count = (g) => !g ? items.length : items.filter((p) => key ? (p.tags || []).includes(g) : p.section === g).length;
    const head = key
      ? `<section class="page-top"><div class="eyebrow mono">${esc(SECTIONS[key].title)} · ${String(items.length).padStart(2, "0")} entries</div><h1>${esc(SECTIONS[key].blurb || SECTIONS[key].title)}</h1></section>`
      : `<section class="hero">
          <div class="eyebrow mono">${esc(site.eyebrow || "")}</div>
          <h1>${site.headline}</h1>
          ${site.intro.map((p) => `<p class="lead">${p}</p>`).join("")}
          ${seasonStrip()}
        </section>`;
    app.innerHTML = `${head}
      <section class="index">
        <div class="filters mono">${groups.map(([g, label], i) => `<button class="${i ? "" : "on"}" data-g="${esc(g)}">${esc(label)}<sup>${String(count(g)).padStart(2, "0")}</sup></button>`).join("")}</div>
        <div class="rows" id="list">${items.map(row).join("")}</div>
      </section>`;
    app.querySelectorAll(".filters button").forEach((b) => b.addEventListener("click", () => {
      app.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b));
      const g = b.dataset.g;
      document.getElementById("list").innerHTML = items.filter((p) => !g || (key ? (p.tags || []).includes(g) : p.section === g)).map(row).join("");
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
    app.innerHTML = `<nav class="crumb"><a href="#/${key}">← ${SECTIONS[key].title}</a><span>/</span><strong>${esc(p.title)}</strong></nav>
    <div class="article-layout">
    <aside class="toc" aria-label="On this page"></aside>
    <article class="article" id="top">
      <div class="spec mono"><span><b>Entry</b>${code(p)}</span><span><b>Filed</b>${shortDate(p.date)}</span>${(p.status || p.ticker) ? `<span><b>${p.ticker ? "Ticker" : "Status"}</b>${esc(p.status || p.ticker)}</span>` : ""}${p.readTime ? `<span><b>Read</b>${esc(p.readTime)}</span>` : ""}</div>
      <h1>${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary)}</p>
      ${hero}${memo}
      <div class="prose">${marked.parse(md)}</div>
      ${key === "memos" ? `<p class="disclaimer">These are personal views for discussion only and are not investment advice. I may hold positions in securities mentioned.</p>` : ""}
    </article></div>`;
    window.scrollTo(0, 0);
    buildToc();
  }

  // ---------- Sidebar table of contents with scroll-spy ----------
  function buildToc() {
    const toc = app.querySelector(".toc"); const heads = [...app.querySelectorAll(".prose h2")];
    if (!toc || heads.length < 2) { toc && toc.remove(); app.querySelector(".article-layout")?.classList.add("no-toc"); return; }
    const targets = [app.querySelector("#top"), ...heads];
    toc.innerHTML = targets.map((h, i) => `<button type="button" data-t="${i}">${i ? esc(h.textContent) : "Overview"}</button>`).join("");
    const btns = [...toc.querySelectorAll("button")];
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    btns.forEach((b) => b.addEventListener("click", () => {
      const t = targets[+b.dataset.t]; const y = t.getBoundingClientRect().top + scrollY - (+b.dataset.t ? 24 : 120);
      scrollTo({ top: Math.max(0, y), behavior: still ? "auto" : "smooth" });
    }));
    const spy = () => {
      if (!toc.isConnected) return removeEventListener("scroll", spy);
      const line = Math.min(innerHeight * 0.3, 160); let cur = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < line) cur = i + 1; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = targets.length - 1;
      btns.forEach((b, i) => b.classList.toggle("on", i === cur));
    };
    addEventListener("scroll", spy, { passive: true }); spy();
  }

  // ---------- Shelf ----------
  async function shelf() {
    const data = await fetch("content/shelf.json").then((r) => r.json()).catch(() => null);
    if (!data) return notFound();
    const cover = (it, cls) => it.cover
      ? `<img class="${cls}" src="${esc(it.cover)}" alt="${esc(it.title)}" loading="lazy">`
      : `<div class="${cls} gen" style="--c:${esc(it.color || "#8d8c88")};--ink:${esc(it.ink || "#fff")}"><span class="gt">${esc(it.title)}</span><span class="gb">${esc(it.by)}</span></div>`;
    const item = {
      cd: (it, i) => `<button class="cd" data-i="${i}" aria-label="${esc(it.title)} by ${esc(it.by)}">
          <span class="disc"></span><span class="case">${cover(it, "art")}<span class="hinge"></span><span class="gloss"></span></span></button>`,
      book: (it, i) => {
        const h = 78 + ((it.title.length * 7) % 22); const w = 34 + Math.min(it.title.length, 28);
        return `<button class="book" data-i="${i}" style="--c:${esc(it.color || "#8d8c88")};--ink:${esc(it.ink || "#fff")};height:${h}%;width:${w}px" aria-label="${esc(it.title)} by ${esc(it.by)}">
          <span class="spine-t">${esc(it.title)}</span><span class="spine-b">${esc(it.by.split(" ").pop())}</span></button>`;
      },
      paper: (it) => {
        const shot = it.cover
          ? `<img src="${esc(it.cover)}" alt="First page of ${esc(it.title)}" loading="lazy">`
          : `<div class="page"><div class="pt">${esc(it.title)}</div><div class="pa">${esc(it.by)}</div><div class="ab">ABSTRACT</div>${[92, 100, 96, 100, 88, 97, 70].map((w) => `<div class="ln" style="width:${w}%"></div>`).join("")}</div>`;
        const link = it.link ? `href="${esc(it.link)}" target="_blank" rel="noopener"` : "";
        return `<article class="paper">
          <a class="shot" ${link}>${shot}</a>
          <div class="meta">${esc(it.by)}${it.venue ? ` · ${esc(it.venue)}` : ""}${it.year ? ` · ${it.year}` : ""}</div>
          <h3>${esc(it.title)}</h3>
          <p class="thoughts">${it.note ? esc(it.note) : "<em>My thoughts on this paper go here.</em>"}</p>
          ${it.link ? `<a class="read" ${link}>Read the paper ↗</a>` : ""}
        </article>`;
      },
      film: (it, i) => `<button class="film" data-i="${i}" aria-label="${esc(it.title)} by ${esc(it.by)}">${cover(it, "poster")}</button>`,
    };
    app.innerHTML = `<section class="intro shelf-intro"><h1>Shelf</h1><p>${esc(data.intro)}</p></section>
      ${data.rows.map((r) => `<section class="shelf-row" data-row="${esc(r.key)}">
        <div class="row-head"><span>${esc(r.title)}</span><span class="count">${r.items.length}</span></div>
        <div class="rack rack-${r.kind}">${r.items.map(item[r.kind]).join("")}</div>
        <div class="detail" aria-live="polite"></div>
      </section>`).join("")}`;
    app.querySelectorAll(".shelf-row").forEach((rowEl, ri) => {
      const row = data.rows[ri]; const detail = rowEl.querySelector(".detail");
      rowEl.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
        const on = b.classList.contains("on");
        rowEl.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("on"));
        if (on) { detail.innerHTML = ""; return; }
        b.classList.add("on");
        const it = row.items[+b.dataset.i];
        detail.innerHTML = `<div class="detail-in"><strong>${esc(it.title)}</strong><span>${esc(it.by)}${it.year ? ` · ${it.year}` : ""}</span>
          <p>${it.note ? esc(it.note) : `<em>A line on why this one stuck goes here.</em>`}</p></div>`;
      }));
    });
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
