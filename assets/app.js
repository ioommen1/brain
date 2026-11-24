// Tiny static site: posts are listed in content/posts.json and written in Markdown.
(function () {
  const app = document.getElementById("app");
  const SECTIONS = {
    concepts: { title: "Product Concepts", blurb: "Ideas for products I wish existed, worked through from problem to wedge." },
    thoughts: { title: "Thoughts", blurb: "Shorter notes on technology, markets, and how things get built." },
    memos: { title: "Investment Memos", blurb: "Structured analysis of companies and markets. Thesis, risks, and what would change my mind." },
  };
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

  function listItem(p) {
    const tag = p.ticker ? `<span class="tag">${esc(p.ticker)}</span>` : p.status ? `<span class="tag status">${esc(p.status)}</span>` : "";
    return `<li><a href="#/${p.section}/${p.slug}">
      <span class="t">${tag}${esc(p.title)}</span>
      <span class="d">${fmtDate(p.date)}</span>
      <span class="s">${esc(p.summary)}</span></a></li>`;
  }

  function home() {
    let html = `<section class="intro">
      <h1>${site.headline}</h1>
      ${site.intro.map((p) => `<p>${p}</p>`).join("")}
    </section>`;
    for (const key of Object.keys(SECTIONS)) {
      const items = posts.filter((p) => p.section === key).slice(0, 3);
      html += `<div class="section-title"><span>${SECTIONS[key].title}</span><a href="#/${key}">All →</a></div>
        <ul class="post-list">${items.map(listItem).join("")}</ul>`;
    }
    app.innerHTML = html;
  }

  function section(key) {
    const items = posts.filter((p) => p.section === key);
    const tags = [...new Set(items.flatMap((p) => p.tags || []))];
    app.innerHTML = `<div class="page-head"><h1>${SECTIONS[key].title}</h1><p>${SECTIONS[key].blurb}</p></div>
      ${tags.length ? `<div class="filters"><button class="on" data-tag="">All</button>${tags.map((t) => `<button data-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
      <ul class="post-list" id="list">${items.map(listItem).join("")}</ul>`;
    app.querySelectorAll(".filters button").forEach((b) => b.addEventListener("click", () => {
      app.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b));
      const t = b.dataset.tag;
      document.getElementById("list").innerHTML = items.filter((p) => !t || (p.tags || []).includes(t)).map(listItem).join("");
    }));
  }

  async function article(key, slug) {
    const p = posts.find((x) => x.section === key && x.slug === slug);
    if (!p) return notFound();
    const md = await fetch(`content/${key}/${slug}.md`).then((r) => (r.ok ? r.text() : "")).catch(() => "");
    const memo = p.memo
      ? `<div class="memo-box">${Object.entries(p.memo).map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`
      : "";
    app.innerHTML = `<article class="article">
      <a class="back" href="#/${key}">← ${SECTIONS[key].title}</a>
      <div class="article-meta">${fmtDate(p.date)}${p.readTime ? ` · ${esc(p.readTime)}` : ""}${(p.tags || []).length ? ` · ${p.tags.map(esc).join(", ")}` : ""}</div>
      <h1>${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary)}</p>
      ${memo}
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
    app.innerHTML = `<div class="page-head"><h1>Not found</h1><p><a href="#/">Go home</a></p></div>`;
  }

  function route() {
    const [, key, slug] = (location.hash.replace(/^#/, "") || "/").split("/");
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === key));
    if (!key) home();
    else if (key === "about") about();
    else if (SECTIONS[key] && slug) article(key, slug);
    else if (SECTIONS[key]) section(key);
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
