const sb = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
const BUCKET = "fotos";
const FOLDER = "reis";

let huidigGebruiker = null;

async function checkLogin() {
  const { data } = await sb.auth.getSession();
  huidigGebruiker = data.session?.user || null;
  renderLoginBalk();
}

function renderLoginBalk() {
  const balk = document.getElementById("fotos-login-balk");
  if (huidigGebruiker) {
    balk.innerHTML = `
      <span class="fotos-ingelogd">Ingelogd als ${huidigGebruiker.email}</span>
      <button class="knop knop--stil fotos-logout-btn" id="fotos-logout">Uitloggen</button>
      <label class="knop knop--groen fotos-upload-label">
        📷 Foto uploaden
        <input type="file" id="fotos-input" accept="image/*" multiple hidden />
      </label>`;
    document.getElementById("fotos-logout").addEventListener("click", uitloggen);
    document.getElementById("fotos-input").addEventListener("change", uploadFotos);
  } else {
    balk.innerHTML = `
      <form class="fotos-login-form" id="fotos-login-form">
        <input type="email" placeholder="E-mail" id="fotos-email" class="fotos-input" required />
        <input type="password" placeholder="Wachtwoord" id="fotos-ww" class="fotos-input" required />
        <button type="submit" class="knop knop--groen">Inloggen</button>
      </form>`;
    document.getElementById("fotos-login-form").addEventListener("submit", inloggen);
  }
}

async function inloggen(e) {
  e.preventDefault();
  const email = document.getElementById("fotos-email").value;
  const ww    = document.getElementById("fotos-ww").value;
  const { error } = await sb.auth.signInWithPassword({ email, password: ww });
  if (error) { alert("Inloggen mislukt: " + error.message); return; }
  await checkLogin();
}

async function uitloggen() {
  await sb.auth.signOut();
  huidigGebruiker = null;
  renderLoginBalk();
}

async function uploadFotos(e) {
  const bestanden = [...e.target.files];
  if (!bestanden.length) return;
  const status = document.getElementById("fotos-status");
  status.textContent = `Uploaden (0/${bestanden.length})…`;

  let ok = 0;
  for (const bestand of bestanden) {
    const naam = `${FOLDER}/${Date.now()}_${bestand.name.replace(/[^a-z0-9._-]/gi, "_")}`;
    const { error } = await sb.storage.from(BUCKET).upload(naam, bestand, { upsert: false });
    if (!error) ok++;
  }
  status.textContent = `${ok} foto('s) geüpload!`;
  setTimeout(() => { status.textContent = ""; }, 3000);
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

async function init() {
  await checkLogin();
  laadFotos();
}

init();
