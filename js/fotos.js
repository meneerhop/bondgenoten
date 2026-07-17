const sb = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
const BUCKET = "fotos";
const FOLDER = "reis";

function getNaam() {
  return (localStorage.getItem("fotos-naam") || "").trim();
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
    const pad = `${FOLDER}/${Date.now()}_${naam.replace(/[^a-z0-9]/gi, "_")}_${veiligNaam}`;
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

  grid.innerHTML = data.map(f => {
    const url = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${f.name}`;
    return `<a class="fotos-item" href="${url}" target="_blank" rel="noopener">
      <img src="${url}" alt="${f.name}" loading="lazy" />
    </a>`;
  }).join("");
}

renderUploadBalk();
laadFotos();
