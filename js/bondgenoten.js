function initialen(naam) {
  return naam.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

let actieveFilter = "alle";

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
      <div class="kandidaat-groep${k.groep === "gieren" ? " kandidaat-groep--gieren" : ""}" style="background:${kleur.bg};color:${kleur.tekst}">${k.groep}</div>
    </div>`;
}

function filterKnopHTML(g) {
  const actief = actieveFilter === g;
  if (g === "alle") {
    return `<button class="filter-knop${actief ? " filter-knop--actief" : ""}" data-groep="alle">Alle</button>`;
  }
  const k = GROEP_KLEUR[g];
  return `
    <button class="filter-knop filter-knop--logo${actief ? " filter-knop--actief" : ""}" data-groep="${g}" style="${actief ? `background:${k.bg};color:${k.tekst};border-color:${k.bg}` : ""}">
      <img src="${k.logo}" alt="${g}" class="filter-logo" />
      <span>${g}</span>
    </button>`;
}

function renderKandidaten() {
  const el = document.getElementById("bondgenoten-lijst");
  const gefilterd = actieveFilter === "alle"
    ? KANDIDATEN
    : KANDIDATEN.filter(k => k.groep === actieveFilter);

  const actief        = gefilterd.filter(k => k.actief);
  const uitgeschakeld = gefilterd.filter(k => !k.actief);

  const groepen = ["alle", ...Object.keys(GROEP_KLEUR)];

  let html = `<div class="filter-balk">${groepen.map(filterKnopHTML).join("")}</div>`;

  html += '<h2 class="sectie-titel sectie-titel--kandidaten">Kandidaten</h2>';
  html += '<div class="kandidaten-grid">'
    + (actief.length ? actief.map(kandidaatHTML).join("") : '<p class="leeg">Geen kandidaten gevonden.</p>')
    + "</div>";

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
