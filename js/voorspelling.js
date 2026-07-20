// voorspelling.js — picks via Supabase, publiek zichtbaar

const PICKS_URL = SUPABASE_URL + "picks";
const NAAM_KEY  = "bondgenoten_mijn_naam";
const API_HDR   = { "apikey": SUPABASE_ANON_KEY };

function mijnNaam()         { return localStorage.getItem(NAAM_KEY); }
function setMijnNaam(naam)  { localStorage.setItem(NAAM_KEY, naam); }
function verwijderNaam()    { localStorage.removeItem(NAAM_KEY); }

async function laadData() {
  const r = await fetch("data/voorspellingen.json", { cache: "no-store" });
  return r.json();
}

async function laadAllePicks() {
  const r = await fetch(`${PICKS_URL}?select=*&order=cyclus_nr.asc`, { headers: API_HDR });
  if (!r.ok) return {};
  const rijen = await r.json();
  const map = {};
  for (const rij of rijen) {
    if (!map[rij.cyclus_nr]) map[rij.cyclus_nr] = {};
    map[rij.cyclus_nr][rij.speler] = rij;
  }
  return map;
}

async function slaPickOp(speler, cyclusNr, keuze) {
  const r = await fetch(PICKS_URL, {
    method: "POST",
    headers: { ...API_HDR, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify({ speler, cyclus_nr: cyclusNr, keuze, gewijzigd_op: new Date().toISOString() }),
  });
  return r.ok;
}

function groepKleur(naam) {
  const k = KANDIDATEN.find(k => k.naam === naam);
  return (k && GROEP_KLEUR[k.groep]) ? GROEP_KLEUR[k.groep] : { bg: "#49534e", tekst: "#f2f3ee" };
}

function groepNaam(naam) {
  const k = KANDIDATEN.find(k => k.naam === naam);
  return k ? k.groep : "";
}

function fmtDatum(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function berekenScores(data, picks) {
  const scores = {};
  data.spelers.forEach(sp => scores[sp] = 0);
  data.cycli.forEach(c => {
    if (!c.winnaar) return;
    data.spelers.forEach(sp => {
      const pickRij = picks[c.nr]?.[sp];
      const keuze = pickRij ? pickRij.keuze : (c.voorspellingen?.[sp] || null);
      if (keuze === c.winnaar) scores[sp]++;
    });
  });
  return scores;
}

function scoreBordHTML(data, scores) {
  const [s1, s2] = data.spelers;
  const max = Math.max(...Object.values(scores), 1);
  return `
    <div class="vsp-scorebord">
      <div class="vsp-speler">
        <div class="vsp-speler-naam">${s1}</div>
        <div class="vsp-score">${scores[s1]}</div>
        <div class="vsp-score-label">punt${scores[s1] !== 1 ? "en" : ""}</div>
      </div>
      <div class="vsp-vs">VS</div>
      <div class="vsp-speler">
        <div class="vsp-speler-naam">${s2}</div>
        <div class="vsp-score">${scores[s2]}</div>
        <div class="vsp-score-label">punt${scores[s2] !== 1 ? "en" : ""}</div>
      </div>
    </div>
    <div class="vsp-balken">
      <div class="vsp-balk-wrap"><div class="vsp-balk vsp-balk--links" style="width:${Math.round((scores[s1]/max)*100)}%"></div></div>
      <div class="vsp-balk-wrap"><div class="vsp-balk vsp-balk--rechts" style="width:${Math.round((scores[s2]/max)*100)}%"></div></div>
    </div>`;
}

function kandidatenOpties(geselecteerd) {
  const actieven = KANDIDATEN.filter(k => k.actief);
  const groepen = [...new Set(actieven.map(k => k.groep))];
  let opts = '<option value="">– kies een kandidaat –</option>';
  groepen.forEach(g => {
    opts += `<optgroup label="${g}">`;
    actieven.filter(k => k.groep === g).forEach(k => {
      opts += `<option value="${k.naam}"${k.naam === geselecteerd ? " selected" : ""}>${k.naam}</option>`;
    });
    opts += `</optgroup>`;
  });
  return opts;
}

function pickChipHTML(naam) {
  if (!naam) return `<div class="vsp-keuze vsp-keuze--leeg">Nog geen voorspelling</div>`;
  const kl = groepKleur(naam);
  return `<div class="vsp-keuze" style="background:${kl.bg};color:${kl.tekst}">${naam}</div>
          <div class="vsp-kaart-sub">${groepNaam(naam)}</div>`;
}

function spelerKaartHTML(s, cyclus, picks, mijn) {
  const pickRij  = picks[cyclus.nr]?.[s];
  const keuze    = pickRij?.keuze || null;
  const gewijzigd = pickRij?.gewijzigd_op || null;
  const isMijn   = s === mijn;

  return `
    <div class="vsp-kaart" id="vsp-kaart-${s}">
      <div class="vsp-kaart-speler-header">
        <span class="vsp-kaart-speler">${s}</span>
        ${isMijn ? `<span class="vsp-jij-badge">jij</span>` : ""}
      </div>
      <div class="vsp-preview" id="vsp-preview-${s}">${pickChipHTML(keuze)}</div>
      <div class="vsp-gewijzigd" id="vsp-datum-${s}">${gewijzigd ? `gewijzigd ${fmtDatum(gewijzigd)}` : ""}</div>
      ${isMijn ? `
        <div id="vsp-edit-${s}" style="display:none;margin-top:8px">
          <select class="vsp-dropdown" id="vsp-select-${s}">${kandidatenOpties(keuze)}</select>
          <div style="display:flex;gap:6px;margin-top:6px">
            <button class="knop knop--groen vsp-opslaan" style="flex:1;font-size:12px;padding:8px 6px"
              data-speler="${s}" data-cyclus="${cyclus.nr}">Opslaan</button>
            <button class="knop knop--stil vsp-annuleer" style="font-size:12px;padding:8px 10px"
              data-speler="${s}">✕</button>
          </div>
          <div class="vsp-status" id="vsp-status-${s}"></div>
        </div>
        <button class="vsp-wijzig-knop" id="vsp-wijzig-${s}" data-speler="${s}">
          ${keuze ? "Wijzig voorspelling" : "Doe voorspelling"}
        </button>` : ""}
    </div>`;
}

function actieveCyclusHTML(cyclus, data, picks, mijn) {
  if (!cyclus) return `<p class="leeg">Geen actieve cyclus op dit moment.</p>`;
  return `
    <div class="vsp-actief">
      <div class="vsp-actief-header">
        <div class="vsp-cyclus-label">${cyclus.label}</div>
        <div class="vsp-ton">🏆 Wie wint de ton?</div>
      </div>
      ${!mijn ? `
        <div class="vsp-naam-kies">
          <div class="vsp-naam-kies-label">Wie ben jij? Kies om een voorspelling te doen.</div>
          <div class="vsp-naam-knoppen">
            ${data.spelers.map(s => `<button class="knop vsp-naam-knop" data-naam="${s}">${s}</button>`).join("")}
          </div>
        </div>` : ""}
      <div class="vsp-kaarten">
        ${data.spelers.map(s => spelerKaartHTML(s, cyclus, picks, mijn)).join("")}
      </div>
      ${mijn ? `<p class="vsp-niet-jij">Niet ${mijn}? <button class="vsp-wissel-knop" id="vsp-wissel">Wissel</button></p>` : ""}
    </div>`;
}

function geschiedenisHTML(data, picks) {
  const afgerond = data.cycli.filter(c => c.winnaar);
  if (!afgerond.length) return "";

  const rijen = afgerond.map(c => {
    const winKl = groepKleur(c.winnaar);
    return `
      <div class="vsp-historie-rij">
        <div class="vsp-historie-label">${c.label}</div>
        <div class="vsp-historie-winnaar">
          <span style="font-size:11px;color:var(--inkt-zacht);margin-right:4px;">winnaar</span>
          <span class="vsp-chip" style="background:${winKl.bg};color:${winKl.tekst}">${c.winnaar}</span>
        </div>
        ${data.spelers.map(s => {
          const pickRij = picks[c.nr]?.[s];
          const keuze = pickRij ? pickRij.keuze : (c.voorspellingen?.[s] || null);
          const goed = keuze === c.winnaar;
          const kl = keuze ? groepKleur(keuze) : { bg: "var(--lijn)", tekst: "var(--inkt-zacht)" };
          return `<div class="vsp-historie-speler">
            <span class="vsp-historie-naam">${s}</span>
            <span class="vsp-chip vsp-chip--klein" style="background:${kl.bg};color:${kl.tekst}">${keuze || "–"}</span>
            <span class="vsp-score-icon">${keuze ? (goed ? "✅" : "❌") : "–"}</span>
          </div>`;
        }).join("")}
      </div>`;
  }).join("");

  return `<h2 class="sectie-titel" style="margin-top:28px;">Vorige cycli</h2>
    <div class="vsp-historie">${rijen}</div>`;
}

async function render() {
  const el = document.getElementById("voorspelling-app");
  try {
    const [data, picks] = await Promise.all([laadData(), laadAllePicks()]);
    const scores = berekenScores(data, picks);
    const actief = data.cycli.find(c => !c.winnaar);
    const mijn   = mijnNaam();

    el.innerHTML =
      scoreBordHTML(data, scores) +
      `<h2 class="sectie-titel" style="margin-top:24px;">Huidige cyclus</h2>` +
      actieveCyclusHTML(actief, data, picks, mijn) +
      geschiedenisHTML(data, picks);

    el.querySelectorAll(".vsp-naam-knop").forEach(k => {
      k.addEventListener("click", () => { setMijnNaam(k.dataset.naam); render(); });
    });

    const wisselKnop = el.querySelector("#vsp-wissel");
    if (wisselKnop) wisselKnop.addEventListener("click", () => { verwijderNaam(); render(); });

    if (!actief) return;

    el.querySelectorAll(".vsp-wijzig-knop").forEach(k => {
      k.addEventListener("click", () => {
        document.getElementById(`vsp-edit-${k.dataset.speler}`).style.display = "";
        k.style.display = "none";
      });
    });

    el.querySelectorAll(".vsp-annuleer").forEach(k => {
      k.addEventListener("click", () => {
        document.getElementById(`vsp-edit-${k.dataset.speler}`).style.display = "none";
        document.getElementById(`vsp-wijzig-${k.dataset.speler}`).style.display = "";
      });
    });

    el.querySelectorAll(".vsp-opslaan").forEach(k => {
      k.addEventListener("click", async () => {
        const s   = k.dataset.speler;
        const nr  = parseInt(k.dataset.cyclus);
        const keuze = document.getElementById(`vsp-select-${s}`).value;
        const statusEl = document.getElementById(`vsp-status-${s}`);
        if (!keuze) { statusEl.textContent = "Kies eerst een kandidaat."; return; }

        k.disabled = true;
        k.textContent = "…";
        statusEl.textContent = "";

        const ok = await slaPickOp(s, nr, keuze);
        if (ok) {
          render();
        } else {
          k.disabled = false;
          k.textContent = "Opslaan";
          statusEl.textContent = "Mislukt, probeer opnieuw.";
        }
      });
    });

  } catch (e) {
    console.error(e);
    el.innerHTML = `<p class="leeg">Kon voorspellingen niet laden.</p>`;
  }
}

render();
