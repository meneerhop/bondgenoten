async function renderRanking() {
  const el = document.getElementById("tab-ranking");
  if (!el) return;

  let data;
  try {
    const res = await fetch("data/ranking.json", { cache: "no-store" });
    data = await res.json();
  } catch {
    el.innerHTML = '<p class="leeg">Kon ranking niet laden.</p>';
    return;
  }

  const gesorteerd = [...data].sort((a, b) => b.punten - a.punten);
  const max = gesorteerd[0].punten;
  const medailles = ["🥇", "🥈", "🥉"];

  const rijen = gesorteerd.map((item, i) => {
    const kleur = (typeof GROEP_KLEUR !== "undefined" && GROEP_KLEUR[item.groep]) || { bg: "#49534e", tekst: "#f2f3ee", logo: "" };
    const logo  = kleur.logo || "";
    const breedte = Math.round((item.punten / max) * 100);
    const isGieren = item.groep === "gieren";

    return `
      <div class="rank-rij">
        <div class="rank-positie">${medailles[i] || i + 1}</div>
        <div class="rank-groep">
          ${logo ? `<img src="${logo}" alt="${item.groep}" class="rank-logo" />` : ""}
          <span class="rank-naam${isGieren ? " rank-naam--gieren" : ""}" style="background:${kleur.bg};color:${kleur.tekst}">${item.groep}</span>
        </div>
        <div class="rank-balk-wrap">
          <div class="rank-balk" style="width:${breedte}%;background:${isGieren ? "#c8c9be" : kleur.bg}"></div>
        </div>
        <div class="rank-punten">${item.punten}</div>
      </div>`;
  });

  el.innerHTML = `
    <div class="rank-lijst">${rijen.join("")}</div>
`;
}

renderRanking();
