const sb = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
const BUCKET = "fotos";
const FOLDER = "reis";
const EMOJIS = ["❤️", "😂", "😮"];

let allReacties = [];

function getNaam() {
  return (localStorage.getItem("fotos-naam") || "").trim();
}

function veiligNaamVan(naam) {
  return naam.replace(/[^a-z0-9]/gi, "_");
}

function naamInBestand(bestandsnaam) {
  const delen = bestandsnaam.split("_");
  return delen.length >= 2 ? delen[1] : "";
}

function leesNaamUitBestand(bestandsnaam) {
  return naamInBestand(bestandsnaam).replace(/_/g, " ");
}

function renderUploadBalk() {
  const balk = document.getElementById("fotos-login-balk");
  const naam = getNaam();
  if (naam) {
    balk.innerHTML = `
      <span class="fotos-ingelogd">📷 Uploaden als <strong>${naam}</strong></span>
      <button class="knop knop--stil" id="fotos-wissel-naam">Wijzig naam</button>
      <label class="knop knop--groen fotos-upload-label">
        Foto's toevoegen
        <input type="file" id="fotos-input" accept="image/*" multiple hidden />
      </label>`;
    document.getElementById("fotos-wissel-naam").addEventListener("click", () => {
      localStorage.removeItem("fotos-naam");
      renderUploadBalk();
      laadFotos();
    });
    document.getElementById("fotos-input").addEventListener("change", uploadFotos);
  } else {
    balk.innerHTML = `
      <form class="fotos-login-form" id="fotos-naam-form">
        <input type="text" placeholder="Jouw naam" id="fotos-naam-input" class="fotos-input" required autocomplete="nickname" />
        <button type="submit" class="knop knop--groen">Doorgaan</button>
      </form>`;
    document.getElementById("fotos-naam-form").addEventListener("submit", e => {
      e.preventDefault();
      const waarde = document.getElementById("fotos-naam-input").value.trim();
      if (!waarde) return;
      localStorage.setItem("fotos-naam", waarde);
      renderUploadBalk();
      laadFotos();
    });
  }
}

async function uploadFotos(e) {
  const bestanden = [...e.target.files];
  if (!bestanden.length) return;
  const naam = getNaam();
  const status = document.getElementById("fotos-status");
  status.textContent = `Uploaden (0/${bestanden.length})…`;

  let ok = 0;
  for (const bestand of bestanden) {
    const veiligNaam = bestand.name.replace(/[^a-z0-9._-]/gi, "_");
    const pad = `${FOLDER}/${Date.now()}_${veiligNaamVan(naam)}_${veiligNaam}`;
    const { error } = await sb.storage.from(BUCKET).upload(pad, bestand, { upsert: false });
    if (!error) ok++;
  }

  status.textContent = ok === bestanden.length
    ? `${ok} foto('s) geüpload! 🎉`
    : `${ok} van ${bestanden.length} geüpload (${bestanden.length - ok} mislukt)`;
  setTimeout(() => { status.textContent = ""; }, 4000);
  e.target.value = "";
  laadFotos();
}

async function verwijderFoto(pad, el) {
  if (!confirm("Deze foto verwijderen?")) return;
  const { error } = await sb.storage.from(BUCKET).remove([pad]);
  if (error) { alert("Verwijderen mislukt: " + error.message); return; }
  el.remove();
}

// ---------- Reacties ----------

async function laadReacties() {
  try {
    const res = await fetch(
      SUPABASE_URL + "posts?kind=eq.reactie&select=id,note,photo_url,naam",
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY } }
    );
    allReacties = await res.json();
  } catch { allReacties = []; }
}

function renderReacties(bestandsnaam) {
  const el = document.querySelector(`.fotos-reacties[data-pad="${CSS.escape(bestandsnaam)}"]`);
  if (!el) return;

  const naam = getNaam();
  const myNaam = naam ? veiligNaamVan(naam) : null;

  el.innerHTML = EMOJIS.map(emoji => {
    const rijen = allReacties.filter(r => r.photo_url === bestandsnaam && r.note === emoji);
    const tel   = rijen.length;
    const ikOok = myNaam && rijen.some(r => r.naam === myNaam);
    return `<button class="reactie-knop${ikOok ? " reactie-knop--actief" : ""}" data-emoji="${emoji}" data-pad="${bestandsnaam}">
      ${emoji}${tel > 0 ? `<span class="reactie-tel">${tel}</span>` : ""}
    </button>`;
  }).join("");

  el.querySelectorAll(".reactie-knop").forEach(btn => {
    btn.addEventListener("click", () => toggleReactie(btn.dataset.pad, btn.dataset.emoji));
  });
}

async function toggleReactie(bestandsnaam, emoji) {
  const naam = getNaam();
  if (!naam) { alert("Kies eerst een naam om te reageren."); return; }
  const myNaam = veiligNaamVan(naam);

  const bestaande = allReacties.find(
    r => r.photo_url === bestandsnaam && r.note === emoji && r.naam === myNaam
  );

  if (bestaande) {
    await fetch(SUPABASE_URL + `posts?id=eq.${bestaande.id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY }
    });
    allReacties = allReacties.filter(r => r.id !== bestaande.id);
  } else {
    const res = await fetch(SUPABASE_URL + "posts", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ kind: "reactie", naam: myNaam, note: emoji, photo_url: bestandsnaam })
    });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) allReacties.push(data[0]);
  }

  renderReacties(bestandsnaam);
}

// ---------- Foto's laden ----------

async function laadFotos() {
  const grid = document.getElementById("fotos-grid");
  grid.innerHTML = `<p class="leeg">Laden…</p>`;

  const { data, error } = await sb.storage.from(BUCKET).list(FOLDER, {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data?.length) {
    grid.innerHTML = `<p class="leeg">Nog geen foto's — upload de eerste!</p>`;
    return;
  }

  const naam = getNaam();
  const myNaam = naam ? veiligNaamVan(naam) : null;

  const fmtDag = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  const urls   = data.map(f => `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${f.name}`);

  // Groepeer per dag
  const groepen = [];
  let huidigeDag = null;
  data.forEach((f, i) => {
    const datum     = f.created_at ? new Date(f.created_at) : null;
    const dagSleutel = datum ? datum.toISOString().slice(0, 10) : "onbekend";
    if (dagSleutel !== huidigeDag) {
      huidigeDag = dagSleutel;
      groepen.push({ label: datum ? fmtDag.format(datum) : "", items: [] });
    }
    groepen[groepen.length - 1].items.push({ f, i, url: urls[i] });
  });

  grid.innerHTML = groepen.map(g => {
    const items = g.items.map(({ f, i, url }) => {
      const pad        = `${FOLDER}/${f.name}`;
      const eigenFoto  = myNaam && naamInBestand(f.name) === myNaam;
      const verwijderKnop = eigenFoto
        ? `<button class="fotos-verwijder" data-pad="${pad}" aria-label="Verwijder foto">✕</button>`
        : "";
      const poster = leesNaamUitBestand(f.name);
      return `<div class="fotos-item-wrap">
        <button class="fotos-item" data-index="${i}" aria-label="Foto vergroten">
          <img src="${url}" alt="${f.name}" loading="lazy" />
        </button>
        ${verwijderKnop}
        ${poster ? `<span class="fotos-poster">${poster}</span>` : ""}
        <div class="fotos-reacties" data-pad="${f.name}"></div>
      </div>`;
    }).join("");
    return `
      <div class="fotos-dag-header">${g.label}</div>
      <div class="fotos-dag-grid">${items}</div>`;
  }).join("");

  grid.querySelectorAll(".fotos-item img").forEach(img => {
    img.addEventListener("error", () => {
      const wrap    = img.closest(".fotos-item-wrap");
      const dagGrid = wrap.closest(".fotos-dag-grid");
      wrap.remove();
      if (!dagGrid.querySelector(".fotos-item-wrap")) {
        dagGrid.previousElementSibling?.remove();
        dagGrid.remove();
      }
    });
  });

  grid.querySelectorAll(".fotos-item").forEach(btn => {
    btn.addEventListener("click", () => openLightbox(urls, parseInt(btn.dataset.index)));
  });

  grid.querySelectorAll(".fotos-verwijder").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      verwijderFoto(btn.dataset.pad, btn.closest(".fotos-item-wrap"));
    });
  });

  // Laad reacties en render ze per foto
  await laadReacties();
  data.forEach(f => renderReacties(f.name));
}

// ---------- Lightbox ----------

let lbUrls = [], lbIndex = 0;

function openLightbox(urls, index) {
  lbUrls  = urls;
  lbIndex = index;

  let lb = document.getElementById("fotos-lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "fotos-lightbox";
    lb.innerHTML = `
      <div class="lb-achtergrond"></div>
      <button class="lb-sluit" aria-label="Sluiten">✕</button>
      <button class="lb-pijl lb-pijl--links" aria-label="Vorige">‹</button>
      <img class="lb-foto" src="" alt="" />
      <button class="lb-pijl lb-pijl--rechts" aria-label="Volgende">›</button>`;
    document.body.appendChild(lb);
    lb.querySelector(".lb-achtergrond").addEventListener("click", sluitLightbox);
    lb.querySelector(".lb-sluit").addEventListener("click", sluitLightbox);
    lb.querySelector(".lb-pijl--links").addEventListener("click", () => navigeerLb(-1));
    lb.querySelector(".lb-pijl--rechts").addEventListener("click", () => navigeerLb(1));
    document.addEventListener("keydown", lbKeydown);
  }

  updateLightbox();
  lb.classList.add("lb--open");
  document.body.classList.add("lb-actief");
}

function sluitLightbox() {
  document.getElementById("fotos-lightbox")?.classList.remove("lb--open");
  document.body.classList.remove("lb-actief");
}

function navigeerLb(richting) {
  lbIndex = (lbIndex + richting + lbUrls.length) % lbUrls.length;
  updateLightbox();
}

function updateLightbox() {
  const foto   = document.querySelector(".lb-foto");
  if (foto) foto.src = lbUrls[lbIndex];
  const links  = document.querySelector(".lb-pijl--links");
  const rechts = document.querySelector(".lb-pijl--rechts");
  if (links)  links.style.display  = lbUrls.length > 1 ? "" : "none";
  if (rechts) rechts.style.display = lbUrls.length > 1 ? "" : "none";
}

function lbKeydown(e) {
  if (!document.getElementById("fotos-lightbox")?.classList.contains("lb--open")) return;
  if (e.key === "Escape")     sluitLightbox();
  if (e.key === "ArrowLeft")  navigeerLb(-1);
  if (e.key === "ArrowRight") navigeerLb(1);
}

renderUploadBalk();
laadFotos();
