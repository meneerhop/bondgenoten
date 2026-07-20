// vluchten.js — vluchtoverzicht + aftelklok naar de eerstvolgende vlucht

function bouwVluchten() {
  const houder = document.getElementById("vluchten");
  houder.innerHTML = "";

  for (const reis of VLUCHTEN) {
    const blok = document.createElement("section");
    blok.className = "vlucht-blok" + (new Date(reis.vertrekIso) < new Date() ? " vlucht-blok--voorbij" : "");
    blok.innerHTML = `<h2>${reis.richting} · ${reis.datumLabel} · ${reis.totaal}</h2>`;

    for (const seg of reis.segmenten) {
      if (seg.overstap) {
        const o = document.createElement("div");
        o.className = "overstap";
        o.textContent = seg.overstap;
        blok.appendChild(o);
        continue;
      }
      const kaart = document.createElement("article");
      kaart.className = "kaart segment";
      kaart.innerHTML = `
        <div class="code">${seg.code}</div>
        <div class="duur">${seg.duur}</div>
        <div class="route">
          ${seg.stappen
            .map(
              (s) => `<div class="stap"><b>${s.tijd}</b><span><strong style="color:var(--inkt)">${s.plek}</strong> · ${s.sub}</span></div>`
            )
            .join("")}
        </div>
      `;
      blok.appendChild(kaart);
    }
    houder.appendChild(blok);
  }
}

function bouwAftelkaart() {
  const kaart = document.getElementById("aftelkaart");
  if (!kaart) return;

  function update() {
    const nu = new Date();
    const volgende = VLUCHTEN
      .map(r => ({ richting: r.richting, moment: new Date(r.vertrekIso) }))
      .filter(r => r.moment > nu)
      .sort((a, b) => a.moment - b.moment)[0];

    kaart.hidden = false;

    if (!volgende) {
      kaart.innerHTML = `
        <div class="aftelkaart-label">Reis voltooid</div>
        <div class="aftelkaart-sub">Welkom thuis! 🎉</div>`;
      return;
    }

    const diff = volgende.moment - nu;
    const d = Math.floor(diff / 86400000);
    const u = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    kaart.innerHTML = `
      <div class="aftelkaart-label">${volgende.richting} vertrekt over</div>
      <div class="aftelkaart-blokken">
        <div class="aftelkaart-blok"><span>${String(d).padStart(2,'0')}</span><small>dagen</small></div>
        <div class="aftelkaart-sep">:</div>
        <div class="aftelkaart-blok"><span>${String(u).padStart(2,'0')}</span><small>uren</small></div>
        <div class="aftelkaart-sep">:</div>
        <div class="aftelkaart-blok"><span>${String(m).padStart(2,'0')}</span><small>min</small></div>
        <div class="aftelkaart-sep">:</div>
        <div class="aftelkaart-blok"><span>${String(s).padStart(2,'0')}</span><small>sec</small></div>
      </div>`;
  }

  update();
  setInterval(update, 1000);
}

bouwVluchten();
bouwAftelkaart();
