// app.js — bouwt de tijdlijn: recaps (episodes.json) + berichten van thuis (Supabase)

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DAG_MS = 24 * 60 * 60 * 1000;
const fmtDag = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });

function dagKey(d) {
  // YYYY-MM-DD in lokale tijd
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function initHeader() {
  const kijklink = document.getElementById("kijklink");
  if (kijklink) kijklink.href = KIJK_URL;

  const nu = new Date();
  const start = new Date(TRIP.vertrek + "T00:00:00");
  const eind = new Date(TRIP.thuiskomst + "T00:00:00");
  const totaal = Math.round((eind - start) / DAG_MS);
  const dag = Math.floor((nu - start) / DAG_MS) + 1;
  const rest = Math.max(0, Math.ceil((eind - nu) / DAG_MS));

  const teller = document.getElementById("dagteller");
  const aftel = document.getElementById("aftel");
  const balk = document.getElementById("voortgang");

  if (nu < start) {
    teller.textContent = `Nog ${Math.ceil((start - nu) / DAG_MS)} nachtjes slapen`;
    aftel.textContent = `vertrek ${fmtDag.format(start)}`;
  } else if (dag > totaal) {
    teller.textContent = "Welkom thuis! 🎉";
    aftel.textContent = "";
    balk.style.width = "100%";
  } else {
    teller.textContent = `Dag ${dag} van ${totaal}`;
    aftel.textContent = rest === 1 ? "morgen weer thuis!" : `nog ${rest} dagen`;
    balk.style.width = `${Math.min(100, Math.round((dag / totaal) * 100))}%`;
  }
}

async function laadRecaps() {
  try {
    const res = await fetch("data/episodes.json", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function laadPosts() {
  try {
    const { data, error } = await sb
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(120);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase:", err.message);
    return [];
  }
}

function kaartRecap(item) {
  const el = document.createElement("article");
  el.className = "kaart";
  el.innerHTML = `
    <span class="label label--loods">Uit de loods</span>
    <h3><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></h3>
    ${item.teaser ? `<p>${item.teaser}</p>` : ""}
    <div class="bron">via <a href="${item.link}" target="_blank" rel="noopener">${item.source || "LoveReality"}</a></div>
  `;
  return el;
}

function kaartPost(post) {
  const el = document.createElement("article");
  el.className = "kaart";
  const foto = post.photo_url
    ? `<img class="foto" src="${post.photo_url}" alt="${post.photo_caption || "Foto van thuis"}" loading="lazy" />`
    : "";
  const caption = post.photo_caption ? `<p>${post.photo_caption}</p>` : "";
  const noot = post.note ? `<div class="noot">${post.note}</div>` : "";
  el.innerHTML = `
    <span class="label label--thuis">${post.kind === "reis" ? "Vanaf de reis" : "Van thuis"}</span>
    ${noot}
    ${foto}
    ${caption}
  `;
  return el;
}

async function bouwTijdlijn() {
  initHeader();
  const [recaps, posts] = await Promise.all([laadRecaps(), laadPosts()]);
  const houder = document.getElementById("tijdlijn");
  houder.innerHTML = "";

  // Alles groeperen per dag
  const dagen = new Map();
  const voegToe = (key, type, item) => {
    if (!dagen.has(key)) dagen.set(key, { recaps: [], posts: [] });
    dagen.get(key)[type].push(item);
  };
  recaps.forEach((r) => voegToe(dagKey(r.date), "recaps", r));
  posts.forEach((p) => voegToe(p.day_date || dagKey(p.created_at), "posts", p));

  const keys = [...dagen.keys()].sort().reverse();
  if (!keys.length) {
    houder.innerHTML = `<p class="leeg">Nog niets te zien — de eerste update komt vanzelf na de volgende aflevering. ✨</p>`;
    return;
  }

  for (const key of keys) {
    const sectie = document.createElement("section");
    sectie.className = "dag";
    const datum = new Date(key + "T12:00:00");
    const vandaag = key === dagKey(new Date());
    sectie.innerHTML = `<h2>${fmtDag.format(datum)}${vandaag ? "<small>vandaag</small>" : ""}</h2>`;

    const { recaps: r, posts: p } = dagen.get(key);
    p.forEach((post) => sectie.appendChild(kaartPost(post)));
    r.forEach((item) => sectie.appendChild(kaartRecap(item)));

    houder.appendChild(sectie);
  }
}

bouwTijdlijn();
