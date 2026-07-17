// Vaste afleveringen (datum + tijd in NL-tijd)
const SCHEMA = [
  "2026-07-01T21:00", "2026-07-02T21:00", "2026-07-03T20:30", "2026-07-04T20:30",
  "2026-07-06T21:00", "2026-07-07T21:00", "2026-07-08T21:00", "2026-07-09T21:00",
  "2026-07-10T21:00", "2026-07-11T21:00",
  "2026-07-13T21:00", "2026-07-14T21:00", "2026-07-15T21:00", "2026-07-16T21:00",
  "2026-07-17T21:00", "2026-07-18T21:00",
];

// Vanaf 20 juli: ma t/m vr om 20:00 (SBS6)
const VAST_VANAF = new Date("2026-07-20T00:00:00");
const VAST_DAGEN = [1, 2, 3, 4, 5]; // ma=1 … vr=5
const VAST_UUR   = 20;
const VAST_MIN   = 0;

function volgendeUitzending() {
  const nu = new Date();

  // Zoek eerst in de vaste lijst
  for (const str of SCHEMA) {
    const d = new Date(str);
    if (d > nu) return d;
  }

  // Daarna: ma t/m vr 20:00 vanaf 20 juli
  const start = nu > VAST_VANAF ? nu : VAST_VANAF;
  const doel = new Date(start);
  doel.setHours(VAST_UUR, VAST_MIN, 0, 0);

  for (let i = 0; i < 7; i++) {
    const kandidaat = new Date(doel);
    kandidaat.setDate(doel.getDate() + i);
    if (VAST_DAGEN.includes(kandidaat.getDay()) && kandidaat > nu) return kandidaat;
  }
  return null;
}

function formatCountdown(ms) {
  if (ms <= 0) return "Nu bezig! 📺";
  const d = Math.floor(ms / 86400000);
  const u = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `over ${d}d ${u}u`;
  if (u > 0) return `over ${u}u ${m}m`;
  return `over ${m} minuten`;
}

const DAGNAMEN = ["zo","ma","di","wo","do","vr","za"];

function tickAfl() {
  const el = document.getElementById("afl-countdown");
  if (!el) return;
  const doel = volgendeUitzending();
  if (!doel) { el.innerHTML = ""; return; }
  const ms = doel - new Date();
  const tijdStr = `${doel.getHours()}:${String(doel.getMinutes()).padStart(2,"0")}`;
  el.innerHTML = `
    <span class="afl-label">📺 Bondgenoten</span>
    <span class="afl-tijd">${formatCountdown(ms)}</span>
    <span class="afl-sub">${DAGNAMEN[doel.getDay()]} ${doel.getDate()}/${doel.getMonth()+1} · ${tijdStr}</span>`;
}

tickAfl();
setInterval(tickAfl, 60000);
