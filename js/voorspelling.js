async function laadVoorspellingen() {
  const res = await fetch("data/voorspellingen.json", { cache: "no-store" });
  return res.json();
}

function groepKleur(naam) {
  if (typeof KANDIDATEN === "undefined") return { bg: "#49534e", tekst: "#f2f3ee" };
  const k = KANDIDATEN.find(k => k.naam === naam);
  if (!k) return { bg: "#49534e", tekst: "#f2f3ee" };
  return GROEP_KLEUR[k.groep] || { bg: "#49534e", tekst: "#f2f3ee" };
}

function berekenScores(data) {
  const scores = {};
  data.spelers.forEach(s => scores[s] = 0);
  data.cycli.forEach(c => {
    if (!c.winnaar) return;
    data.spelers.forEach(s => {
      if (c.voorspellingen[s] === c.winnaar) scores[s]++;
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
      <div class="vsp-balk-wrap">
        <div class="vsp-balk vsp-balk--links" style="width:${Math.round((scores[s1]/max)*100)}%"></div>
      </div>
      <div class="vsp-balk-wrap">
        <div class="vsp-balk vsp-balk--rechts" style="width:${Math.round((scores[s2]/max)*100)}%"></div>
      </div>
    </div>`;
}

function actieveCyclusHTML(cyclus, spelers) {
  if (!cyclus) return `<p class="leeg">Nog geen actieve cyclus.</p>`;

  const kaarten = spelers.map(s => {
    const keuze = cyclus.voorspellingen[s];
    const kleur = keuze ? groepKleur(keuze) : null;
    return `
      <div class="vsp-kaart">
        <div class="vsp-kaart-speler">${s}</div>
        ${keuze
          ? `<div class="vsp-keuze" style="background:${kleur.bg};color:${kleur.tekst}">${keuze}</div>
             <div class="vsp-kaart-sub">${kleur.bg === "#FFFFFF" ? "Gieren" : Object.keys(GROEP_KLEUR).find(g => GROEP_KLEUR[g].bg === kleur.bg) || ""}</div>`
          : `<div class="vsp-keuze vsp-keuze--leeg">Nog geen voorspelling</div>`
        }
      </div>`;
  }).join("");

  return `
    <div class="vsp-actief">
      <div class="vsp-actief-header">
        <div class="vsp-cyclus-label">${cyclus.label}</div>
        <div class="vsp-ton">🏆 Wie wint de ton?</div>
      </div>
      <div class="vsp-kaarten">${kaarten}</div>
    </div>`;
}

function geschiedenisHTML(data) {
  const afgerond = data.cycli.filter(c => c.winnaar);
  if (!afgerond.length) return "";

  const rijen = afgerond.map(c => {
    return `
      <div class="vsp-historie-rij">
        <div class="vsp-historie-label">${c.label}</div>
        <div class="vsp-historie-winnaar">
          ${(() => { const k = groepKleur(c.winnaar); return `<span class="vsp-chip" style="background:${k.bg};color:${k.tekst}">${c.winnaar}</span>`; })()}
        </div>
        ${data.spelers.map(s => {
          const raad = c.voorspellingen[s];
          const goed = raad === c.winnaar;
          return `<div class="vsp-historie-speler">
            <span class="vsp-historie-naam">${s}</span>
            <span class="vsp-chip vsp-chip--klein" style="background:${groepKleur(raad).bg};color:${groepKleur(raad).tekst}">${raad || "–"}</span>
            <span class="vsp-score-icon">${goed ? "✅" : "❌"}</span>
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
    const data = await laadVoorspellingen();
    const scores = berekenScores(data);
    const actief = data.cycli.find(c => !c.winnaar);

    el.innerHTML =
      scoreBordHTML(data, scores) +
      `<h2 class="sectie-titel" style="margin-top:24px;">Huidige cyclus</h2>` +
      actieveCyclusHTML(actief, data.spelers) +
      geschiedenisHTML(data);
  } catch (e) {
    el.innerHTML = `<p class="leeg">Kon voorspellingen niet laden.</p>`;
  }
}

render();
