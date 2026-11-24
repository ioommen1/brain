// Playable Rabbit Hole demo. Songs and artists are invented; genres are real.
(function () {
  const GRAPH = {
    "Indie folk": ["Chamber pop", "Americana"], "Chamber pop": ["Baroque pop", "Art rock"], "Baroque pop": ["Bossa nova", "French pop"],
    "Bossa nova": ["Brazilian jazz", "Samba"], "Brazilian jazz": ["Ethio-jazz", "Spiritual jazz"], "Ethio-jazz": ["Afrobeat", "Desert blues"],
    "Afrobeat": ["Highlife", "Afro-house"], "Highlife": ["Palm-wine", "Soukous"], "Americana": ["Bluegrass", "Desert blues"],
    "Bluegrass": ["Irish folk", "Appalachian folk"], "Art rock": ["Krautrock", "Post-punk"], "Krautrock": ["Ambient", "Kosmische"],
    "Post-punk": ["Coldwave", "Krautrock"], "Ambient": ["Gagaku", "Minimalism"], "French pop": ["Yé-yé", "City pop"],
    "City pop": ["Shibuya-kei", "Synth funk"], "Spiritual jazz": ["Ambient", "Minimalism"], "Desert blues": ["Gnawa", "Ethio-jazz"],
    "Samba": ["Choro", "Bossa nova"], "Minimalism": ["Gamelan", "Ambient"], "Coldwave": ["Minimal synth", "Ambient"],
  };
  const ALL = [...new Set([...Object.keys(GRAPH), ...Object.values(GRAPH).flat()])];
  const STARTS = [
    { title: "Paper Lanterns", artist: "The Quiet Hours", genre: "Indie folk", hue: 28 },
    { title: "Static Garden", artist: "Neon Paper", genre: "Art rock", hue: 210 },
    { title: "Late Bloom", artist: "Ana Varela", genre: "Bossa nova", hue: 150 },
  ];
  const A = ["Golden", "Slow", "Hollow", "Velvet", "Distant", "Paper", "Quiet", "Electric", "Lantern", "Salt", "Midnight", "Copper", "Glass", "Wild", "Low", "Soft"];
  const N = ["River", "Weather", "Rooms", "Orbit", "Harbor", "Echo", "Garden", "Signal", "Tides", "Hours", "Mirrors", "Fields", "Engine", "Letters", "Dust", "Moons"];
  const F = ["Mara", "Kofi", "Ines", "Taro", "Lena", "Odile", "Sami", "Yuki", "Bea", "Tomás", "Nadia", "Elio", "Aster", "Juno"];
  const L = ["Okafor", "Silva", "Mori", "Haddad", "Laurent", "Quinn", "Abebe", "Varga", "Ross", "Nakamura", "Duarte", "Bell"];
  const BANDS = ["The Long Weather", "Small Harbors", "Glass Orchard", "Night Atlas", "Copper Moth", "Velvet Ferry", "Saltwater Choir", "Low Orbit"];
  const rnd = (seed) => { let x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const pick = (arr, seed) => arr[Math.floor(rnd(seed) * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function mount(el) {
    let trail = [], branch = 0, saved = null;
    const seen = new Set();

    function nextSong() {
      const cur = trail[trail.length - 1], used = new Set(trail.map((s) => s.genre));
      const opts = (GRAPH[cur.genre] || []).filter((g) => !used.has(g));
      const pool = opts.length ? opts : ALL.filter((g) => !used.has(g));
      const genre = pool[(trail.length + branch) % pool.length];
      let title, artist, k = 0;
      do {
        const s = trail.length * 31 + branch * 97 + k++;
        title = `${pick(A, s)} ${pick(N, s + 3)}`;
        artist = rnd(s + 7) > 0.45 ? `${pick(F, s + 5)} ${pick(L, s + 9)}` : pick(BANDS, s + 11);
      } while (seen.has(title) && k < 40);
      seen.add(title);
      return { title, artist, genre, hue: (cur.hue + 24 + Math.floor(rnd(trail.length + branch) * 18)) % 360 };
    }

    function art(s, size) {
      return `<span class="rh-art" style="--h:${s.hue};width:${size}px;height:${size}px"></span>`;
    }

    function render() {
      if (!trail.length) {
        el.innerHTML = `<div class="rh">
          <div class="rh-top"><span>Start from a song you love</span></div>
          <div class="rh-starts">${STARTS.map((s, i) => `<button type="button" class="rh-start" data-s="${i}">${art(s, 44)}<span><b>${esc(s.title)}</b><i>${esc(s.artist)} · ${esc(s.genre)}</i></span></button>`).join("")}</div>
        </div>`;
        el.querySelectorAll(".rh-start").forEach((b) => b.addEventListener("click", () => {
          const s = STARTS[+b.dataset.s]; trail = [{ ...s }]; seen.clear(); seen.add(s.title); branch = 0; saved = null; render();
        }));
        return;
      }
      const cur = trail[trail.length - 1], steps = trail.length - 1;
      el.innerHTML = `<div class="rh">
        <div class="rh-top"><span>Rabbit hole from <b>${esc(trail[0].title)}</b></span><span>${steps ? `${steps} step${steps > 1 ? "s" : ""} in` : "Starting point"}</span></div>
        <div class="rh-trail" role="list">${trail.map((s, i) => `<button type="button" role="listitem" class="rh-dot${i === trail.length - 1 ? " on" : ""}" data-i="${i}" style="--h:${s.hue}" title="${esc(s.title)} · ${esc(s.genre)}" aria-label="Go back to ${esc(s.title)}"></button>`).join('<span class="rh-link"></span>')}</div>
        <div class="rh-now">${art(cur, 88)}<div class="rh-meta"><div class="rh-genre">${esc(cur.genre)}</div><div class="rh-title">${esc(cur.title)}</div><div class="rh-artist">${esc(cur.artist)}</div></div></div>
        <div class="rh-dist"><span>Where you started</span><div class="rh-bar"><i style="width:${Math.min(100, steps * 11)}%"></i></div><span>Somewhere new</span></div>
        <div class="rh-actions">
          <button type="button" class="rh-go">One step further</button>
          <button type="button" class="rh-save"${steps < 2 ? " disabled" : ""}>Save trail</button>
          <button type="button" class="rh-reset">Start over</button>
        </div>
        ${saved ? `<div class="rh-saved"><div class="rh-saved-h">Saved playlist · Rabbit hole from ${esc(trail[0].title)}</div><ol>${saved.map((s) => `<li>${esc(s.title)} <i>${esc(s.artist)} · ${esc(s.genre)}</i></li>`).join("")}</ol></div>` : ""}
        <div class="rh-hint">Tap any dot to branch from there.</div>
      </div>`;
      el.querySelector(".rh-go").addEventListener("click", () => { trail.push(nextSong()); saved = null; render(); el.querySelector(".rh-go").focus(); });
      el.querySelector(".rh-save").addEventListener("click", () => { saved = trail.slice(); render(); });
      el.querySelector(".rh-reset").addEventListener("click", () => { trail = []; render(); });
      el.querySelectorAll(".rh-dot").forEach((d) => d.addEventListener("click", () => {
        const i = +d.dataset.i; if (i === trail.length - 1) return;
        trail = trail.slice(0, i + 1); branch++; saved = null; render();
      }));
      const t = el.querySelector(".rh-trail"); t.scrollLeft = t.scrollWidth;
    }
    render();
  }
  window.mountDemos = (root) => root.querySelectorAll('.demo[data-demo="rabbit-hole"]').forEach(mount);
})();
