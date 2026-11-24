// Tiny static site: posts are listed in content/posts.json and written in Markdown.
(function () {
  const app = document.getElementById("app");
  const SECTIONS = {
    concepts: { title: "Concepts", layout: "gallery" },
    thoughts: { title: "Thoughts", layout: "notes" },
    memos: { title: "Memos", layout: "gallery" },
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

  const card = (p) => `<a class="card" href="#/${p.section}/${p.slug}">
      <div class="cover">${cover(p)}</div>
      <div class="title"><span class="no">${p.no}</span>${esc(p.title)}</div>
      <div class="sub">${esc(p.subtitle || p.summary)}</div>
    </a>`;

  const note = (p) => `<li><a href="#/${p.section}/${p.slug}">
      <span><span class="t"><span class="no">${p.no}</span>${esc(p.title)}</span><span class="s">${esc(p.summary)}</span></span>
      <span class="d">${fmtDate(p.date)}</span></a></li>`;

  function section(key, withIntro) {
    const S = SECTIONS[key];
    const items = posts.filter((p) => p.section === key);
    const tags = [...new Set(items.flatMap((p) => p.tags || []))];
    const render = (list) => S.layout === "gallery"
      ? `<div class="gallery">${list.map(card).join("")}</div>`
      : `<ul class="notes">${list.map(note).join("")}</ul>`;
    app.innerHTML = `
      ${withIntro ? `<section class="intro"><h1>${site.headline}</h1>${site.intro.map((p) => `<p>${p}</p>`).join("")}${site.now ? `<p class="now"><span class="dot"></span>${site.now}</p>` : ""}</section>` : ""}
      ${tags.length ? `<div class="filters"><button class="on" data-tag="">All</button>${tags.map((t) => `<button data-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
      <div id="list">${render(items)}</div>`;
    app.querySelectorAll(".filters button").forEach((b) => b.addEventListener("click", () => {
      app.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b));
      const t = b.dataset.tag;
      document.getElementById("list").innerHTML = render(items.filter((p) => !t || (p.tags || []).includes(t)));
    }));
  }

  async function article(key, slug) {
    const p = posts.find((x) => x.section === key && x.slug === slug);
    if (!p) return notFound();
    const md = await fetch(`content/${key}/${slug}.md`).then((r) => (r.ok ? r.text() : "")).catch(() => "");
    const memo = p.memo
      ? `<div class="memo-box">${Object.entries(p.memo).map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`
      : "";
    const list = posts.filter((x) => x.section === key);
    const next = list[(list.indexOf(p) + 1) % list.length];
    const hero = SECTIONS[key].layout === "gallery" ? `<div class="hero"><div class="cover">${cover(p)}</div></div>` : "";
    app.innerHTML = `<article class="article">
      <a class="back" href="#/${key}">← ${SECTIONS[key].title}</a>
      <div class="article-meta">No. ${p.no} · ${fmtDate(p.date)}${p.readTime ? ` · ${esc(p.readTime)}` : ""}${(p.tags || []).length ? ` · ${p.tags.map(esc).join(", ")}` : ""}</div>
      <h1>${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary)}</p>
      ${hero}${memo}
      <div class="prose">${marked.parse(md)}</div>
      ${next && next !== p ? `<a class="next" href="#/${key}/${next.slug}"><span>Next story</span><strong>${esc(next.title)} →</strong></a>` : ""}
      ${key === "memos" ? `<p class="disclaimer">These are personal views for discussion only and are not investment advice. I may hold positions in securities mentioned.</p>` : ""}
    </article>`;
    window.scrollTo(0, 0);
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
    const active = key || "concepts";
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === active));
    if (!key) section("concepts", true);
    else if (key === "about") about();
    else if (key === "shelf") shelf();
    else if (SECTIONS[key] && slug) article(key, slug);
    else if (SECTIONS[key]) section(key, false);
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
