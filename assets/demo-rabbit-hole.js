// Playable Rabbit Hole demo, shown inside a Spotify-style Now Playing screen.
// Songs and artists are invented; genres are real. No Spotify logo or brand font is used.
(function () {
  const GRAPH = {
    "Indie folk": ["Americana", "Chamber pop"], "Chamber pop": ["Baroque pop", "Art rock"], "Baroque pop": ["French pop", "Bossa nova"],
    "Bossa nova": ["Samba", "Brazilian jazz"], "Samba": ["Choro", "Bossa nova"], "Choro": ["Brazilian jazz", "Samba"],
    "Brazilian jazz": ["Ethio-jazz", "Spiritual jazz"], "Ethio-jazz": ["Desert blues", "Afrobeat"], "Afrobeat": ["Highlife", "Afro-house"],
    "Highlife": ["Palm-wine", "Soukous"], "Americana": ["Bluegrass", "Desert blues"], "Bluegrass": ["Appalachian folk", "Irish folk"],
    "Appalachian folk": ["Ethio-jazz", "Irish folk"], "Art rock": ["Krautrock", "Post-punk"], "Krautrock": ["Ambient", "Kosmische"],
    "Post-punk": ["Coldwave", "Krautrock"], "Ambient": ["Minimalism", "Gagaku"], "French pop": ["City pop", "Yé-yé"],
    "City pop": ["Shibuya-kei", "Synth funk"], "Spiritual jazz": ["Ambient", "Minimalism"], "Desert blues": ["Gnawa", "Ethio-jazz"],
    "Minimalism": ["Gamelan", "Ambient"], "Coldwave": ["Minimal synth", "Ambient"],
  };
  const ALL = [...new Set([...Object.keys(GRAPH), ...Object.values(GRAPH).flat()])];
  const START = { title: "Late Bloom", artist: "Ana Varela", genre: "Bossa nova", hue: 150 };
  const A = ["Golden", "Slow", "Hollow", "Velvet", "Distant", "Paper", "Quiet", "Electric", "Lantern", "Salt", "Midnight", "Copper", "Glass", "Wild", "Low", "Soft"];
  const N = ["River", "Weather", "Rooms", "Orbit", "Harbor", "Echo", "Garden", "Signal", "Tides", "Hours", "Mirrors", "Fields", "Engine", "Letters", "Dust", "Moons"];
  const F = ["Mara", "Kofi", "Ines", "Taro", "Lena", "Odile", "Sami", "Yuki", "Bea", "Tomás", "Nadia", "Elio", "Aster", "Juno"];
  const L = ["Okafor", "Silva", "Mori", "Haddad", "Laurent", "Quinn", "Abebe", "Varga", "Ross", "Nakamura", "Duarte", "Bell"];
  const BANDS = ["The Long Weather", "Small Harbors", "Glass Orchard", "Night Atlas", "Copper Moth", "Velvet Ferry", "Saltwater Choir", "Low Orbit"];
  const rnd = (s) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const pick = (arr, s) => arr[Math.floor(rnd(s) * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const I = {
    down: '<path d="M6 9l6 6 6-6"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 10"/>',
    shuffle: '<path d="M4 7h3l10 10h3M4 17h3l3-3M14 10l3-3h3M18 5l2 2-2 2M18 15l2 2-2 2"/>',
    prev: '<rect x="5" y="5.5" width="2.6" height="13" rx="1.2"/><path d="M19.5 5.8v12.4a.8.8 0 0 1-1.2.7L8.6 12.7a.8.8 0 0 1 0-1.4l9.7-6.2a.8.8 0 0 1 1.2.7z"/>',
    next: '<rect x="16.4" y="5.5" width="2.6" height="13" rx="1.2"/><path d="M4.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.7-6.2a.8.8 0 0 0 0-1.4L5.7 5.1a.8.8 0 0 0-1.2.7z"/>',
    play: '<path d="M8 5.6v12.8a1 1 0 0 0 1.5.9l10-6.4a1 1 0 0 0 0-1.8l-10-6.4A1 1 0 0 0 8 5.6z"/>',
    pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>',
    repeat: '<path d="M5 10V8a2 2 0 0 1 2-2h11l-2-2M19 14v2a2 2 0 0 1-2 2H6l2 2"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
    hole: '<path d="M12.6 11.4a1 1 0 1 1-1.4 1.3 2.2 2.2 0 0 1 2.9-2.9 3.6 3.6 0 0 1-1.1 6.6 5 5 0 0 1-5.6-5.7 6.4 6.4 0 0 1 9.6-4.4 7.8 7.8 0 0 1 2.4 9.9"/>',
    queue: '<path d="M4 7h11M4 12h11M4 17h7M18 14v6M15 17h6"/>',
    share: '<path d="M12 4v11M8 8l4-4 4 4M5 13v6h14v-6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    library: '<path d="M5 4v16M10 4v16M15 5l4 15"/>',
  };
  const ic = (n, cls = "", fill = false) => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" ${fill ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'}>${I[n]}</svg>`;

  function mount(el) {
    let menuAt = { x: 0, y: 0 }, coached = false;
    let trail = [{ ...START }], mode = "album", branch = 0, menu = false, saved = false, playing = true, toast = "";
    let shuffle = true, repeat = false, vol = 0.7, pos = 43;
    const liked = new Set([START.title]);
    const secs = (t) => { const [m, x] = dur(t).split(":"); return +m * 60 + +x; };
    const clock = (v) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
    const seen = new Set([START.title]);
    const ALBUM = [START, { title: "Window Seat", artist: START.artist, genre: START.genre, hue: 150 }, { title: "Agua Morna", artist: START.artist, genre: START.genre, hue: 150 }, { title: "Small Hours", artist: START.artist, genre: START.genre, hue: 150 }];
    const dur = (t) => `${2 + (t.length % 3)}:${String(10 + (t.length * 7) % 49).padStart(2, "0")}`;

    function nextSong() {
      const cur = trail[trail.length - 1], used = new Set(trail.map((x) => x.genre));
      const opts = (GRAPH[cur.genre] || []).filter((g) => !used.has(g));
      const recent = new Set(trail.slice(-8).map((x) => x.genre));
      let pool = opts.length ? opts : ALL.filter((g) => !used.has(g));
      if (!pool.length) pool = (GRAPH[cur.genre] || []).filter((g) => !recent.has(g));
      if (!pool.length) pool = ALL.filter((g) => !recent.has(g));
      const genre = pool[(trail.length + branch) % pool.length];
      let title, artist, k = 0;
      do {
        const sd = trail.length * 31 + branch * 97 + k++;
        title = `${pick(A, sd)} ${pick(N, sd + 3)}`;
        artist = rnd(sd + 7) > 0.45 ? `${pick(F, sd + 5)} ${pick(L, sd + 9)}` : pick(BANDS, sd + 11);
      } while (seen.has(title) && k < 40);
      seen.add(title);
      return { title, artist, genre, hue: (cur.hue + 26 + Math.floor(rnd(trail.length + branch) * 18)) % 360 };
    }
    const art = (x, cls = "") => `<span class="dk-art ${cls}" style="--ah:${x.hue}" aria-hidden="true"></span>`;

    function render() {
      const cur = trail[trail.length - 1], rh = mode === "rabbit", steps = trail.length - 1;
      const main = rh
        ? `<div class="dk-hero" style="--hh:${cur.hue}">
             <div class="dk-hero-art">${trail.slice(-4).map((x) => art(x)).join("")}</div>
             <div class="dk-hero-txt"><small>Rabbit hole</small><div class="dk-title">From ${esc(trail[0].title)}</div>
               <span>${steps ? `${steps} step${steps > 1 ? "s" : ""} · ${esc(trail[0].genre)} → ${esc(cur.genre)}` : "Press next to go one step further"}</span></div>
           </div>
           <div class="dk-bar">
             <button type="button" class="dk-bigplay" aria-label="${playing ? "Pause" : "Play"}">${ic(playing ? "pause" : "play", "", true)}</button>
             <button type="button" class="dk-savebtn${saved ? " on" : ""}">${ic(saved ? "check" : "plus")}${saved ? "Saved" : "Save as playlist"}</button>
           </div>
           <div class="dk-trail" role="list" aria-label="Trail">${trail.map((x, i) => `<button type="button" role="listitem" class="dk-dot${i === trail.length - 1 ? " on" : ""}" data-i="${i}" style="--dh:${x.hue}" title="Branch from ${esc(x.title)}" aria-label="Branch from ${esc(x.title)}"></button>`).join('<i class="dk-link"></i>')}</div>
           <div class="dk-table">${trail.map((x, i) => `<button type="button" class="dk-row${i === trail.length - 1 ? " on" : ""}" data-i="${i}">
               <span class="n">${i === trail.length - 1 && playing ? '<i class="eq"><b></b><b></b><b></b></i>' : i + 1}</span>${art(x, "sm")}
               <span class="t"><b>${esc(x.title)}</b><small>${esc(x.artist)}</small></span><span class="g">${esc(x.genre)}</span><span class="d">${dur(x.title)}</span></button>`).join("")}</div>`
        : `<div class="dk-hero" style="--hh:${START.hue}">
             <div class="dk-hero-art">${art(START)}</div>
             <div class="dk-hero-txt"><small>Album</small><div class="dk-title">${esc(START.title)}</div><span>${esc(START.artist)} · 2024 · 4 songs</span></div>
           </div>
           <div class="dk-bar"><button type="button" class="dk-bigplay" aria-label="${playing ? "Pause" : "Play"}">${ic(playing ? "pause" : "play", "", true)}</button>
</div>
           <div class="dk-table">${ALBUM.map((x, i) => `<button type="button" class="dk-row dk-arow${x.title === cur.title ? " on" : ""}" data-a="${i}"><span class="n">${x.title === cur.title && playing ? '<i class="eq"><b></b><b></b><b></b></i>' : i + 1}</span>
               <span class="t"><b>${esc(x.title)}</b><small>${esc(x.artist)}</small></span><span class="d">${dur(x.title)}</span></button>`).join("")}</div>`;

      el.innerHTML = `<div class="dk-win">
        <div class="dk-top"><span class="dk-lights"><i></i><i></i><i></i></span><button type="button" class="dk-search">${ic("search")}What do you want to play?</button><button type="button" class="dk-av" aria-label="Profile">I</button></div>
        <div class="dk-body">
          <div class="dk-rail"><button type="button" class="dk-lib dk-home" aria-label="Back to album">${ic("library")}</button><button type="button" class="dk-tile dk-home" style="--ah:150" aria-label="Late Bloom album"></button><button type="button" class="dk-tile dk-liked" style="--ah:260" aria-label="Liked Songs"></button>${rh ? art(cur, "dk-tile") : ""}</div>
          <div class="dk-main">${main}</div>
          <div class="dk-side">
            <div class="dk-side-h"><b>${rh ? "Rabbit hole" : esc(START.title)}</b><button type="button" class="dk-more" aria-label="More options">${ic("more", "", true)}</button></div>
            ${art(cur, "big")}
            <div class="dk-np"><span><b>${esc(cur.title)}</b><small>${esc(cur.artist)}</small></span><button type="button" class="dk-ok${liked.has(cur.title) ? "" : " off"}" aria-label="${liked.has(cur.title) ? "Remove from" : "Save to"} Liked Songs">${ic(liked.has(cur.title) ? "check" : "plus")}</button></div>
            ${rh ? `<div class="dk-card"><small>Up next</small><span>One step further from ${esc(cur.genre)}</span></div>` : ""}
          </div>
        </div>
        <div class="dk-player">
          <div class="dk-now">${art(cur, "sm")}<span><b>${esc(cur.title)}</b><small>${esc(cur.artist)}</small></span></div>
          <div class="dk-ctrl">
            <div class="dk-btns">
            <button type="button" class="dk-ib dk-rhbtn${rh ? " on" : coached ? "" : " hint"}" aria-label="${rh ? "In a rabbit hole" : "Go down the rabbit hole from this song"}" title="Go down the rabbit hole">${ic("hole")}</button>
            ${!rh && !coached ? `<span class="dk-coach" role="note"><b>New</b>Go down the rabbit hole from this song</span>` : ""}
              <button type="button" class="dk-ib dk-shuf${shuffle ? " on" : ""}" aria-label="Shuffle">${ic("shuffle")}</button>
              <button type="button" class="dk-ib dk-prev" aria-label="Previous">${ic("prev", "", true)}</button>
              <button type="button" class="dk-play" aria-label="${playing ? "Pause" : "Play"}">${ic(playing ? "pause" : "play", "", true)}</button>
              <button type="button" class="dk-ib dk-next${rh ? " glow" : ""}" aria-label="${rh ? "One step further" : "Next"}">${ic("next", "", true)}</button>
              <button type="button" class="dk-ib dk-rep${repeat ? " on" : ""}" aria-label="Repeat">${ic("repeat")}</button>
            </div>
            <div class="dk-prog"><span class="dk-pos">${clock(pos)}</span><span class="dk-track dk-seek" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="${secs(cur.title)}" aria-valuenow="${Math.floor(pos)}"><i style="width:${pos / secs(cur.title) * 100}%"></i></span><span>${dur(cur.title)}</span></div>
          </div>
          <div class="dk-vol"><button type="button" class="dk-ib dk-q" aria-label="Queue">${ic("queue")}</button><span class="dk-track sm dk-volbar" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(vol * 100)}"><i style="width:${vol * 100}%"></i></span></div>
        </div>
            ${menu ? `<div class="dk-menu" role="menu" style="left:${menuAt.x}px;top:${menuAt.y}px">
              <button type="button" role="menuitem" class="dk-mi">${ic("plus")}Add to playlist</button>
              <button type="button" role="menuitem" class="dk-mi">${ic("queue")}Add to queue</button>
              <button type="button" role="menuitem" class="dk-mi">${ic("radio")}Go to song radio</button>
              <button type="button" role="menuitem" class="dk-mi dk-new">${ic("hole")}Go down the rabbit hole<em>New</em></button>
              <button type="button" role="menuitem" class="dk-mi">${ic("share")}Share</button>
            </div>` : ""}
        ${toast ? `<div class="dk-toast">${esc(toast)}</div>` : ""}
      </div>`;

      const $ = (q) => el.querySelector(q);
      const openMenu = (e, anchor) => {
        e.preventDefault(); e.stopPropagation();
        const w = el.querySelector(".dk-win").getBoundingClientRect(), r = anchor ? anchor.getBoundingClientRect() : { left: e.clientX, right: e.clientX, bottom: e.clientY };
        const x = Math.min(Math.max(8, (anchor ? r.left : r.left) - w.left), w.width - 232), y = Math.min((anchor ? r.bottom + 6 : r.bottom) - w.top, w.height - 250);
        menuAt = { x, y }; menu = true; coached = true; render();
      };
      $(".dk-more").addEventListener("click", (e) => menu ? (menu = false, render()) : openMenu(e, e.currentTarget));
      const cc = $(".dk-btns .dk-coach"), rb = $(".dk-rhbtn");
      if (cc && rb) cc.style.setProperty("--ax", (rb.getBoundingClientRect().left + rb.offsetWidth / 2 - cc.getBoundingClientRect().left - 5) + "px");
      $(".dk-rhbtn").addEventListener("click", () => {
        coached = true; menu = false;
        if (mode === "rabbit") return flash("You're in a rabbit hole. Press next to go one step further.");
        mode = "rabbit"; pos = 0; trail = [trail[trail.length - 1]]; seen.clear(); seen.add(trail[0].title); saved = false; playing = true; flash("Rabbit hole started. Press next.");
      });
      el.querySelectorAll(".dk-row").forEach((r) => r.addEventListener("contextmenu", (e) => openMenu(e, null)));
      el.querySelectorAll(".dk-mi:not(.dk-new)").forEach((b) => b.addEventListener("click", () => { menu = false; render(); }));
      const nw = $(".dk-new"); if (nw) nw.addEventListener("click", () => {
        menu = false; mode = "rabbit"; pos = 0; trail = [trail[trail.length - 1]]; seen.clear(); seen.add(trail[0].title); saved = false; playing = true; flash("Rabbit hole started. Press next.");
      });
      el.querySelectorAll(".dk-bigplay, .dk-play").forEach((b) => b.addEventListener("click", () => { playing = !playing; render(); }));
      $(".dk-next").addEventListener("click", () => {
        pos = 0;
        if (mode !== "rabbit") { const i = ALBUM.findIndex((x) => x.title === cur.title); trail = [{ ...ALBUM[(i + 1) % ALBUM.length] }]; playing = true; render(); return; }
        trail.push(nextSong()); saved = false; playing = true; render();
      });
      $(".dk-prev").addEventListener("click", () => {
        if (pos > 3 || mode !== "rabbit" || trail.length < 2) { pos = 0; tickDom(); return; }
        trail.pop(); pos = 0; render();
      });
      const sv = $(".dk-savebtn"); if (sv) sv.addEventListener("click", () => {
        if (trail.length < 2) return flash("Take a few steps first");
        saved = true; flash(`Saved "Rabbit hole from ${trail[0].title}" to Your Library`);
      });
      el.querySelectorAll(".dk-dot, button.dk-row[data-i]").forEach((d) => d.addEventListener("click", () => {
        const i = +d.dataset.i; if (i === trail.length - 1) return;
        trail = trail.slice(0, i + 1); branch++; saved = false; flash("Branched. The next step takes a new path.");
      }));
      const t = $(".dk-trail"); if (t) t.scrollLeft = t.scrollWidth;
      el.querySelectorAll(".dk-arow").forEach((r) => r.addEventListener("click", () => { trail = [{ ...ALBUM[+r.dataset.a] }]; pos = 0; playing = true; render(); }));
      el.querySelectorAll(".dk-home").forEach((b) => b.addEventListener("click", () => { mode = "album"; trail = [{ ...START }]; pos = 0; menu = false; render(); }));
      $(".dk-liked").addEventListener("click", () => flash(`${liked.size} liked song${liked.size === 1 ? "" : "s"} in this demo`));
      $(".dk-search").addEventListener("click", () => flash("Search isn't part of this concept. Try ⋯ on the right."));
      $(".dk-av").addEventListener("click", () => flash("Signed in as Isaac"));
      $(".dk-ok").addEventListener("click", () => { const k = cur.title; liked.has(k) ? liked.delete(k) : liked.add(k); flash(liked.has(k) ? "Added to Liked Songs" : "Removed from Liked Songs"); });
      $(".dk-shuf").addEventListener("click", () => { shuffle = !shuffle; render(); });
      $(".dk-rep").addEventListener("click", () => { repeat = !repeat; flash(repeat ? "Repeating this song" : "Repeat off"); });
      $(".dk-q").addEventListener("click", () => flash(mode === "rabbit" ? "Up next: one step further" : "Up next: the rest of the album"));
      const setFrom = (bar, e) => { const r = bar.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
      $(".dk-seek").addEventListener("click", (e) => { pos = setFrom(e.currentTarget, e) * secs(cur.title); tickDom(); });
      $(".dk-volbar").addEventListener("click", (e) => { vol = setFrom(e.currentTarget, e); e.currentTarget.firstChild.style.width = vol * 100 + "%"; });
      el.querySelectorAll(".dk-mi:not(.dk-new)").forEach((b) => b.addEventListener("click", () => {
        const msg = { "Add to playlist": "Added to Rabbit hole drafts", "Add to queue": "Added to queue", "Go to song radio": "Song radio stays close to this song. Try the rabbit hole instead.", "Share": "Link copied" }[b.textContent.trim()];
        if (msg) flash(msg);
      }));
    }
    function tickDom() {
      const cur = trail[trail.length - 1], L = secs(cur.title), b = el.querySelector(".dk-seek i"), p = el.querySelector(".dk-pos");
      if (b) b.style.width = Math.min(100, pos / L * 100) + "%"; if (p) p.textContent = clock(pos);
    }
    let last = performance.now();
    (function loop(now) {
      const dt = (now - last) / 1000; last = now;
      if (!el.isConnected) return;
      if (playing) {
        pos += dt;
        const cur = trail[trail.length - 1];
        if (pos >= secs(cur.title)) {
          pos = 0;
          if (repeat) {} else if (mode === "rabbit") { trail.push(nextSong()); saved = false; render(); }
          else { const i = ALBUM.findIndex((x) => x.title === cur.title); trail = [{ ...ALBUM[(i + 1) % ALBUM.length] }]; render(); }
        }
        tickDom();
      }
      requestAnimationFrame(loop);
    })(last);
    el.addEventListener("click", (e) => { if (menu && !e.target.closest(".dk-menu, .dk-more")) { menu = false; render(); } });
    let tt;
    function flash(msg) { toast = msg; render(); clearTimeout(tt); tt = setTimeout(() => { toast = ""; render(); }, 2000); }
    render();
  }
  window.mountDemos = (root) => root.querySelectorAll('.demo[data-demo="rabbit-hole"]').forEach(mount);
})();
