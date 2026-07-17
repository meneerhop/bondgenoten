const VSP_KEY = "bondgenoten_voorspellingen";

function laadLokaal() {
  try { return JSON.parse(localStorage.getItem(VSP_KEY)) || {}; } catch { return {}; }
}

function slaLokaalOp(data) {
  try { localStorage.setItem(VSP_KEY, JSON.stringify(data)); } catch (e) { console.warn("localStorage niet beschikbaar:", e); }
}

function getLokaalePick(lokaal, cyclusNr, speler) {
  const sleutel = String(cyclusNr);
  return lokaal[sleutel] && lokaal[sleutel][speler] ? lokaal[sleutel][speler] : null;
}

function setLokaalePick(lokaal, cyclusNr, speler, keuze) {
  const sleutel = String(cyclusNr);
  if (!lokaal[sleutel]) lokaal[sleutel] = {};
  lokaal[sleutel][speler] = keuze;
  slaLokaalOp(lokaal);
}

async function laadData() {
  const res = await fetch("data/voorspellingen.json", { cache: "no-store" });
  return res.json();
}

function groepVanKandidaat(naam) {
  if (typeof KANDIDATEN === "undefined") return null;
  return KANDIDATEN.find(k => k.naam === naam);
}

function groepKleur(naam) {
  const k = groepVanKandidaat(naam);
  if (!k || typeof GROEP_KLEUR === "undefined") return { bg: "#49534e", tekst: "#f2f3ee" };
  return GROEP_KLEUR[k.groep] || { bg: "#49534e", tekst: "#f2f3ee" };
}

function berekenScores(data, lokaal) {
  const scores = {};
  data.spelers.forEach(s => scores[s] = 0);
  data.cycli.forEach(c => {
    if (!c.winnaar) return;
    data.spelers.forEach(s => {
      const keuze = c.voorspellingen[s] || getLokaalePick(lokaal, c.nr, s);
      if (keuze === c.winnaar) scores[s]++;
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
  if (typeof KANDIDATEN === "undefined") return '<option value="">– kies –</option>';
  const actieven = KANDIDATEN.filter(k => k.actief);
  const groepen = [...new Set(actieven.map(k => k.groep))];
  let opts = '<option value="">– kies een kandidaat –</option>';
  groepen.forEach(g => {
    const leden = actieven.filter(k => k.groep === g);
    opts += `<optgroup label="${g}">`;
    leden.forEach(k => {
      opts += `<option value="${k.naam}"${k.naam === geselecteerd ? " selected" : ""}>${k.naam}</option>`;
    });
    opts += `</optgroup>`;
  });
  return opts;
}

function keuzePreviewHTML(naam) {
  if (!naam) return `<div class="vsp-keuze vsp-keuze--leeg">Nog geen keuze</div>`;
  const k = groepKleur(naam);
  const kandidaat = groepVanKandidaat(naam);
  const groepNaam = kandidaat ? kandidaat.groep : "";
  return `<div class="vsp-keuze" style="background:${k.bg};color:${k.tekst}">${naam}</div>
          <div class="vsp-kaart-sub">${groepNaam}</div>`;
}

function actieveCyclusHTML(cyclus, spelers, lokaal) {
  if (!cyclus) return `<p class="leeg">Geen actieve cyclus.</p>`;
  const picks = s => getLokaalePick(lokaal, cyclus.nr, s) || "";

  return `
    <div class="vsp-actief">
      <div class="vsp-actief-header">
        <div class="vsp-cyclus-label">${cyclus.label}</div>
        <div class="vsp-ton">🏆 Wie wint de ton?</div>
      </div>
      <div class="vsp-kaarten">
        ${spelers.map(s => `
          <div class="vsp-kaart" id="vsp-kaart-${s}">
            <div class="vsp-kaart-speler">${s}</div>
            <div class="vsp-preview" id="vsp-preview-${s}">${keuzePreviewHTML(picks(s))}</div>
            <select class="vsp-dropdown" data-speler="${s}" id="vsp-select-${s}">
              ${kandidatenOpties(picks(s))}
            </select>
          </div>`).join("")}
      </div>
    </div>`;
}

function geschiedenisHTML(data, lokaal) {
  const afgerond = data.cycli.filter(c => c.winnaar);
  if (!afgerond.length) return "";

  const rijen = afgerond.map(c => {
    const winKleur = groepKleur(c.winnaar);
    return `
      <div class="vsp-historie-rij">
        <div class="vsp-historie-label">${c.label}</div>
        <div class="vsp-historie-winnaar">
          <span style="font-size:11px;color:var(--inkt-zacht);margin-right:4px;">winnaar</span>
          <span class="vsp-chip" style="background:${winKleur.bg};color:${winKleur.tekst}">${c.winnaar}</span>
        </div>
        ${data.spelers.map(s => {
          const keuze = c.voorspellingen[s] || getLokaalePick(lokaal, c.nr, s);
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
    const data   = await laadData();
    const lokaal = laadLokaal();
    const scores = berekenScores(data, lokaal);
    const actief = data.cycli.find(c => !c.winnaar);

    el.innerHTML =
      scoreBordHTML(data, scores) +
      `<h2 class="sectie-titel" style="margin-top:24px;">Huidige cyclus</h2>` +
      actieveCyclusHTML(actief, data.spelers, lokaal) +
      geschiedenisHTML(data, lokaal);

    if (actief) {
      el.querySelectorAll(".vsp-dropdown").forEach(sel => {
        sel.addEventListener("change", () => {
          const speler = sel.dataset.speler;
          const keuze  = sel.value;
          if (!keuze) return;
          const lokaal = laadLokaal();
          setLokaalePick(lokaal, actief.nr, speler, keuze);
          document.getElementById(`vsp-preview-${speler}`).innerHTML = keuzePreviewHTML(keuze);
        });
      });
    }
  } catch (e) {
    el.innerHTML = `<p class="leeg">Kon voorspellingen niet laden.</p>`;
  }
}

render();
