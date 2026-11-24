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
    const kicker = p.ticker || p.status || SECTIONS[p.section].title;
    return `<div class="art" style="background:linear-gradient(160deg, ${a} 0%, ${b} 140%)">
      <span class="orb" style="width:60%;aspect-ratio:1;background:${b};right:-${10 + (h % 20)}%;top:${15 + (h % 30)}%"></span>
      <span class="kicker" style="position:relative">${esc(kicker)}</span>
      <span class="mark" style="position:relative">${esc(p.mark || p.title)}</span>
    </div>`;
  }

  const card = (p) => `<a class="card" href="#/${p.section}/${p.slug}">
      <div class="cover">${cover(p)}</div>
      <div class="title">${esc(p.title)}</div>
      <div class="sub">${esc(p.subtitle || p.summary)}</div>
    </a>`;

  const note = (p) => `<li><a href="#/${p.section}/${p.slug}">
      <span><span class="t">${esc(p.title)}</span><span class="s">${esc(p.summary)}</span></span>
      <span class="d">${fmtDate(p.date)}</span></a></li>`;

  function section(key, withIntro) {
    const S = SECTIONS[key];
    const items = posts.filter((p) => p.section === key);
    const tags = [...new Set(items.flatMap((p) => p.tags || []))];
    const render = (list) => S.layout === "gallery"
      ? `<div class="gallery">${list.map(card).join("")}</div>`
      : `<ul class="notes">${list.map(note).join("")}</ul>`;
    app.innerHTML = `
      ${withIntro ? `<section class="intro"><h1>${site.headline}</h1>${site.intro.map((p) => `<p>${p}</p>`).join("")}</section>` : ""}
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
    const hero = SECTIONS[key].layout === "gallery" ? `<div class="hero"><div class="cover">${cover(p)}</div></div>` : "";
    app.innerHTML = `<article class="article">
      <a class="back" href="#/${key}">← ${SECTIONS[key].title}</a>
      <div class="article-meta">${fmtDate(p.date)}${p.readTime ? ` · ${esc(p.readTime)}` : ""}${(p.tags || []).length ? ` · ${p.tags.map(esc).join(", ")}` : ""}</div>
      <h1>${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary)}</p>
      ${hero}${memo}
      <div class="prose">${marked.parse(md)}</div>
      ${key === "memos" ? `<p class="disclaimer">These are personal views for discussion only and are not investment advice. I may hold positions in securities mentioned.</p>` : ""}
    </article>`;
    window.scrollTo(0, 0);
  }

  async function about() {
    const md = await fetch("content/about.md").then((r) => r.text()).catch(() => "");
    app.innerHTML = `<article class="article"><h1>About</h1><div class="prose">${marked.parse(md)}</div></article>`;
  }

  function notFound() {
    app.innerHTML = `<div class="intro"><h1>Not found</h1><p><a href="#/">Go home</a></p></div>`;
  }

  function route() {
    const [, key, slug] = (location.hash.replace(/^#/, "") || "/").split("/");
    const active = key || "concepts";
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === active));
    if (!key) section("concepts", true);
    else if (key === "about") about();
    else if (SECTIONS[key] && slug) article(key, slug);
    else if (SECTIONS[key]) section(key, false);
    else notFound();
  }

  fetch("content/posts.json")
    .then((r) => r.json())
    .then((data) => {
      site = data.site;
      posts = data.posts.sort((a, b) => b.date.localeCompare(a.date));
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(() => { app.innerHTML = "<p>Could not load content. If opening locally, run a local server (see README).</p>"; });
})();
