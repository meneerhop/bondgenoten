// Vaste afleveringen (datum + tijd in NL-tijd)
const SCHEMA = [
  "2026-07-01T21:00", "2026-07-02T21:00", "2026-07-03T20:30", "2026-07-04T20:30",
  "2026-07-06T21:00", "2026-07-07T21:00", "2026-07-08T21:00", "2026-07-09T21:00",
  "2026-07-10T21:00", "2026-07-11T21:00",
  "2026-07-13T21:00", "2026-07-14T21:00", "2026-07-15T21:00", "2026-07-16T21:00",
  "2026-07-17T21:00", "2026-07-18T21:00",
];

function volgendeUitzending() {
  const nu = new Date();

  // 1. Vaste schema — episodes 1 t/m SCHEMA.length
  for (let i = 0; i < SCHEMA.length; i++) {
    const d = new Date(SCHEMA[i]);
    if (d > nu) return { datum: d, nr: i + 1 };
  }

  // 2. Dagelijkse afleveringen: ma t/m vr 20:00 vanaf 20 jul
  // d loopt altijd naar het volgende weekdag-moment; skip weekenden expliciet.
  const d = new Date("2026-07-20T20:00:00");
  let geaird = 0;

  while (d <= nu) {
    geaird++;
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  }

  return { datum: d, nr: SCHEMA.length + geaird + 1 };
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
  const res = volgendeUitzending();
  if (!res) { el.innerHTML = ""; return; }
  const { datum, nr } = res;
  const ms = datum - new Date();
  const tijdStr = `${datum.getHours()}:${String(datum.getMinutes()).padStart(2,"0")}`;
  el.innerHTML = `
    <span class="afl-label">📺 Aflevering ${nr}</span>
    <span class="afl-tijd">${formatCountdown(ms)}</span>
    <span class="afl-sub">${DAGNAMEN[datum.getDay()]} ${datum.getDate()}/${datum.getMonth()+1} · ${tijdStr}</span>`;
}

tickAfl();
setInterval(tickAfl, 60000);
