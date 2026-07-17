const GROEP_KLEUR = {
  gieren:       { bg: "#49534e", tekst: "#f2f3ee" },
  slangen:      { bg: "#6f7b6b", tekst: "#f2f3ee" },
  haaien:       { bg: "#a4a88d", tekst: "#2c332f" },
  vossen:       { bg: "#c8b89a", tekst: "#2c332f" },
  bloedzuigers: { bg: "#8b4e4e", tekst: "#f2f3ee" },
};

const KANDIDATEN = [
  { naam: "Naam 1", foto: "", groep: "gieren",       actief: true },
  { naam: "Naam 2", foto: "", groep: "gieren",       actief: true },
  { naam: "Naam 3", foto: "", groep: "slangen",      actief: true },
  { naam: "Naam 4", foto: "", groep: "slangen",      actief: true },
  { naam: "Naam 5", foto: "", groep: "haaien",       actief: true },
  { naam: "Naam 6", foto: "", groep: "haaien",       actief: true },
  { naam: "Naam 7", foto: "", groep: "vossen",       actief: true },
  { naam: "Naam 8", foto: "", groep: "vossen",       actief: true },
  { naam: "Naam 9", foto: "", groep: "bloedzuigers", actief: true },
  { naam: "Naam 10",foto: "", groep: "bloedzuigers", actief: true },
];

let actieveFilter = "alle";

function initialen(naam) {
  return naam.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function kandidaatHTML(k) {
  const kleur = GROEP_KLEUR[k.groep] || { bg: "#49534e", tekst: "#f2f3ee" };
  return `
    <div class="kandidaat-tegel${k.actief ? "" : " kandidaat-tegel--uit"}">
      <div class="kandidaat-foto-wrap">
        ${k.foto
          ? `<img src="${k.foto}" alt="${k.naam}" class="kandidaat-foto" />`
          : `<div class="kandidaat-foto kandidaat-initialen" style="background:${kleur.bg};color:${kleur.tekst}">${initialen(k.naam)}</div>`
        }
      </div>
      <div class="kandidaat-naam">${k.naam}</div>
      <div class="kandidaat-groep" style="background:${kleur.bg};color:${kleur.tekst}">${k.groep}</div>
    </div>`;
}

function renderKandidaten() {
  const el = document.getElementById("bondgenoten-lijst");
  const gefilterd = actieveFilter === "alle"
    ? KANDIDATEN
    : KANDIDATEN.filter(k => k.groep === actieveFilter);

  const actief = gefilterd.filter(k => k.actief);
  const uitgeschakeld = gefilterd.filter(k => !k.actief);

  const groepen = ["alle", ...Object.keys(GROEP_KLEUR)];
  let html = `<div class="filter-balk">
    ${groepen.map(g => `
      <button class="filter-knop${actieveFilter === g ? " filter-knop--actief" : ""}" data-groep="${g}">
        ${g === "alle" ? "Alle" : g}
      </button>`).join("")}
  </div>`;

  html += '<h2 class="sectie-titel sectie-titel--kandidaten">Kandidaten</h2>';
  html += '<div class="kandidaten-grid">' + (actief.length ? actief.map(kandidaatHTML).join("") : '<p class="leeg">Geen kandidaten gevonden.</p>') + "</div>";

  if (uitgeschakeld.length) {
    html += '<h2 class="sectie-titel">Uitgeschakeld</h2>';
    html += '<div class="kandidaten-grid kandidaten-grid--uit">' + uitgeschakeld.map(kandidaatHTML).join("") + "</div>";
  }

  el.innerHTML = html;

  el.querySelectorAll(".filter-knop").forEach(btn => {
    btn.addEventListener("click", () => {
      actieveFilter = btn.dataset.groep;
      renderKandidaten();
    });
  });
}

renderKandidaten();
