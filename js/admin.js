// admin.js — inloggen + berichten plaatsen

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginPaneel = document.getElementById("loginPaneel");
const postPaneel = document.getElementById("postPaneel");
const loginStatus = document.getElementById("loginStatus");
const postStatus = document.getElementById("postStatus");

function toonStatus(el, tekst, ok = true) {
  el.textContent = tekst;
  el.className = "status " + (ok ? "status--ok" : "status--fout");
}

async function checkSessie() {
  const { data } = await sb.auth.getSession();
  const ingelogd = !!data.session;
  loginPaneel.hidden = ingelogd;
  postPaneel.hidden = !ingelogd;
}

loginPaneel.addEventListener("submit", async (e) => {
  e.preventDefault();
  toonStatus(loginStatus, "Bezig…");
  const { error } = await sb.auth.signInWithPassword({
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("wachtwoord").value,
  });
  if (error) {
    toonStatus(loginStatus, "Inloggen mislukt: " + error.message, false);
  } else {
    toonStatus(loginStatus, "");
    checkSessie();
  }
});

document.getElementById("uitloggen").addEventListener("click", async () => {
  await sb.auth.signOut();
  checkSessie();
});

postPaneel.addEventListener("submit", async (e) => {
  e.preventDefault();
  const knop = document.getElementById("verstuur");
  knop.disabled = true;
  toonStatus(postStatus, "Bezig met plaatsen…");

  try {
    const naam = document.getElementById("naam").value.trim();
    const noot = document.getElementById("noot").value.trim();
    const bestand = document.getElementById("foto").files[0];
    const onderschrift = document.getElementById("onderschrift").value.trim();

    if (!noot && !bestand) {
      throw new Error("Schrijf een noot of kies een foto — allebei leeg heeft weinig zin. 😉");
    }

    let photo_url = null;
    if (bestand) {
      const ext = (bestand.name.split(".").pop() || "jpg").toLowerCase();
      const pad = `${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from("fotos").upload(pad, bestand, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (upErr) throw upErr;
      photo_url = sb.storage.from("fotos").getPublicUrl(pad).data.publicUrl;
    }

    const { error } = await sb.from("posts").insert({
      naam: naam || null,
      note: noot || null,
      photo_url,
      photo_caption: onderschrift || null,
      kind: "thuis",
    });
    if (error) throw error;

    toonStatus(postStatus, "Geplaatst! Ze ziet het bij de volgende refresh. ✅");
    postPaneel.reset();
  } catch (err) {
    toonStatus(postStatus, "Mislukt: " + err.message, false);
  } finally {
    knop.disabled = false;
  }
});

checkSessie();
