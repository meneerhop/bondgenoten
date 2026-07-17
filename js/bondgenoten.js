const KANDIDATEN = [
  { naam: "Naam 1", foto: "", actief: true },
  { naam: "Naam 2", foto: "", actief: true },
  { naam: "Naam 3", foto: "", actief: true },
  { naam: "Naam 4", foto: "", actief: true },
  { naam: "Naam 5", foto: "", actief: true },
  { naam: "Naam 6", foto: "", actief: true },
];

function initialen(naam) {
  return naam.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function renderKandidaten() {
  const el = document.getElementById("bondgenoten-lijst");
  const actief = KANDIDATEN.filter(k => k.actief);
  const uitgeschakeld = KANDIDATEN.filter(k => !k.actief);

  let html = '<div class="kandidaten-grid">';
  actief.forEach(k => {
    html += `
      <div class="kandidaat-tegel">
        ${k.foto
          ? `<img src="${k.foto}" alt="${k.naam}" class="kandidaat-foto" />`
          : `<div class="kandidaat-foto kandidaat-initialen">${initialen(k.naam)}</div>`
        }
        <div class="kandidaat-naam">${k.naam}</div>
      </div>`;
  });
  html += "</div>";

  if (uitgeschakeld.length) {
    html += '<h2 class="sectie-titel">Uitgeschakeld</h2><div class="kandidaten-grid kandidaten-grid--uit">';
    uitgeschakeld.forEach(k => {
      html += `
        <div class="kandidaat-tegel kandidaat-tegel--uit">
          ${k.foto
            ? `<img src="${k.foto}" alt="${k.naam}" class="kandidaat-foto" />`
            : `<div class="kandidaat-foto kandidaat-initialen">${initialen(k.naam)}</div>`
          }
          <div class="kandidaat-naam">${k.naam}</div>
        </div>`;
    });
    html += "</div>";
  }

  el.innerHTML = html;
}

renderKandidaten();
