// vluchten.js — vluchtoverzicht + aftelklok naar de eerstvolgende vlucht

function bouwVluchten() {
  const houder = document.getElementById("vluchten");
  houder.innerHTML = "";

  for (const reis of VLUCHTEN) {
    const blok = document.createElement("section");
    blok.className = "vlucht-blok";
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
  const label = document.getElementById("aftelLabel");
  const tijd = document.getElementById("aftelTijd");

  function update() {
    const nu = new Date();
    const volgende = VLUCHTEN
      .map((r) => ({ richting: r.richting, moment: new Date(r.vertrekIso) }))
      .filter((r) => r.moment > nu)
      .sort((a, b) => a.moment - b.moment)[0];

    if (!volgende) {
      kaart.hidden = false;
      label.textContent = "Reis voltooid";
      tijd.textContent = "Welkom thuis! 🎉";
      return;
    }

    kaart.hidden = false;
    label.textContent = `${volgende.richting} vertrekt over`;
    let ms = volgende.moment - nu;
    const d = Math.floor(ms / 86400000); ms -= d * 86400000;
    const u = Math.floor(ms / 3600000); ms -= u * 3600000;
    const m = Math.floor(ms / 60000); ms -= m * 60000;
    const s = Math.floor(ms / 1000);
    tijd.textContent =
      d > 0
        ? `${d} ${d === 1 ? "dag" : "dagen"}, ${u}u ${String(m).padStart(2, "0")}m`
        : `${u}u ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }

  update();
  setInterval(update, 1000);
}

bouwVluchten();
bouwAftelkaart();
