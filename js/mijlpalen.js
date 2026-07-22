(function initMijlpalen() {
  const el = document.getElementById("mijlpalen-kaart");
  if (!el) return;

  const nu = new Date();
  const start = new Date(TRIP.vertrek + "T00:00:00");
  const eind = new Date(TRIP.thuiskomst + "T00:00:00");
  const totaal = Math.round((eind - start) / DAG_MS) + 1;
  const dag = Math.floor((nu - start) / DAG_MS) + 1;

  if (nu < start || dag > totaal) {
    el.style.display = "none";
    return;
  }

  const MIJLPALEN = [
    { dag: 1,  emoji: "✈️",  tekst: "De reis is begonnen!" },
    { dag: 7,  emoji: "🌟", tekst: "1 week onderweg!" },
    { dag: Math.round(totaal / 2), emoji: "🌴", tekst: "Halverwege!" },
    { dag: 21, emoji: "🏆", tekst: "3 weken onderweg!" },
  ];

  const vandaag = MIJLPALEN.find(m => m.dag === dag);
  const volgende = MIJLPALEN.find(m => m.dag > dag);
  const behaald = MIJLPALEN.filter(m => m.dag < dag);

  if (vandaag) {
    el.classList.add("mijlpaal-kaart--viering");
    el.innerHTML = `
      <div class="mijlpaal-emoji-groot">${vandaag.emoji}</div>
      <div class="mijlpaal-badge">Mijlpaal bereikt</div>
      <div class="mijlpaal-tekst-groot">${vandaag.tekst}</div>
      <div class="mijlpaal-dag-label">Dag ${dag} van ${totaal}</div>
    `;

    const sleutel = `mijlpaal-gezien-dag-${dag}`;
    if (!localStorage.getItem(sleutel)) {
      localStorage.setItem(sleutel, "1");
      startConfetti();
    }
  } else {
    el.classList.add("mijlpaal-kaart--volgende");
    const volgendeHtml = volgende
      ? `<div class="mijlpaal-volgende-rij">
           <span class="mijlpaal-volgende-emoji">${volgende.emoji}</span>
           <div class="mijlpaal-volgende-info">
             <div class="mijlpaal-volgende-tekst">${volgende.tekst}</div>
             <div class="mijlpaal-volgende-sub">over ${volgende.dag - dag} ${volgende.dag - dag === 1 ? "dag" : "dagen"}</div>
           </div>
         </div>`
      : `<div class="mijlpaal-volgende-sub">Alle mijlpalen behaald! 🎉</div>`;

    el.innerHTML = `
      <div class="mijlpaal-header-rij">
        <span class="mijlpaal-label">Volgende mijlpaal</span>
      </div>
      ${volgendeHtml}
    `;
  }

  if (behaald.length) {
    const feed = document.createElement("div");
    feed.className = "mijlpaal-feed";
    [...behaald].reverse().forEach(m => {
      const item = document.createElement("div");
      item.className = "mijlpaal-feed-item";
      item.innerHTML = `<span class="mijlpaal-feed-emoji">${m.emoji}</span><span class="mijlpaal-feed-naam">${m.tekst}</span><span class="mijlpaal-feed-dag">Dag ${m.dag}</span>`;
      feed.appendChild(item);
    });
    el.appendChild(feed);
  }
})();
