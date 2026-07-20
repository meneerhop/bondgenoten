const DAG_MS = 24 * 60 * 60 * 1000;
const fmtDag = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });

function dagKey(d) {
  return d.toISOString().slice(0, 10);
}

(function initDashboard() {
  document.getElementById("kijklink").href = KIJK_URL;

  const nu     = new Date();
  const start  = new Date(TRIP.vertrek + "T00:00:00");
  const eind   = new Date(TRIP.thuiskomst + "T00:00:00");
  const totaal = Math.round((eind - start) / DAG_MS) + 1;
  const dag    = Math.floor((nu - start) / DAG_MS) + 1;
  const rest   = Math.max(0, Math.ceil((eind - nu) / DAG_MS));

  const teller = document.getElementById("dagteller");
  const aftel  = document.getElementById("aftel");
  const balk   = document.getElementById("voortgang");

  const isLastedag = dagKey(nu) === dagKey(eind);
  const isThuis    = dag > totaal;

  if (nu < start) {
    teller.textContent = `Nog ${Math.ceil((start - nu) / DAG_MS)} nachtjes slapen`;
    aftel.textContent  = `vertrek ${fmtDag.format(start)}`;
  } else if (isThuis) {
    teller.textContent = "Welkom thuis! 🎉";
    aftel.textContent  = "";
    if (balk) balk.style.width = "100%";
    startConfetti();
  } else if (isLastedag) {
    teller.textContent = `Dag ${dag} van ${totaal}`;
    aftel.textContent  = "laatste dag — vanavond thuis! 🎉";
    if (balk) balk.style.width = "100%";
    startConfetti();
  } else {
    teller.textContent = `Dag ${dag} van ${totaal}`;
    aftel.textContent  = rest === 1 ? "morgen weer thuis!" : `nog ${rest} dagen`;
    if (balk) balk.style.width = `${Math.min(100, Math.round((dag / totaal) * 100))}%`;
  }

  const loc = huidigeLocatie();
  const psSub = document.getElementById("ps-locatie-sub");
  if (psSub && loc) psSub.textContent = `📍 Nu in: ${loc}`;
})();

// Vertrek countdown — vlucht BRU → BKK wo 22 jul 13:20 CEST
const VERTREK = new Date(VLUCHTEN[0].vertrekIso);

function updateVertrek() {
  const vertrekKaart    = document.getElementById("vertrek-kaart");
  const herenigingKaart = document.getElementById("hereniging-kaart");
  if (!vertrekKaart) return;

  const diff = VERTREK - new Date();

  if (diff <= 0) {
    vertrekKaart.style.display    = "none";
    if (herenigingKaart) herenigingKaart.style.display = "";
    return;
  }

  vertrekKaart.style.display = "";
  if (herenigingKaart) herenigingKaart.style.display = "none";

  const dagen = Math.floor(diff / (1000 * 60 * 60 * 24));
  const uren  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min   = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const sec   = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("ver-dagen").textContent = String(dagen).padStart(2, "0");
  document.getElementById("ver-uren").textContent  = String(uren).padStart(2, "0");
  document.getElementById("ver-min").textContent   = String(min).padStart(2, "0");
  document.getElementById("ver-sec").textContent   = String(sec).padStart(2, "0");
}

updateVertrek();
setInterval(updateVertrek, 1000);

// Hereniging afteltimer — landing Brussel di 18 aug 06:50 CEST
const HERENIGING = new Date("2026-08-18T06:50:00+02:00");

function updateHereniging() {
  const kaart = document.getElementById("hereniging-kaart");
  if (!kaart) return;

  const diff = HERENIGING - new Date();

  if (diff <= 0) {
    kaart.innerHTML = `
      <div class="hereniging-label">Dieuw is thuis!</div>
      <div class="hereniging-thuis">❤️</div>
      <div class="hereniging-thuis-tekst">Welkom thuis, Dieuw!</div>
      <div class="hereniging-sub">Mitch heeft je gemist</div>
    `;
    startConfetti();
    return;
  }

  const dagen = Math.floor(diff / (1000 * 60 * 60 * 24));
  const uren  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min   = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const sec   = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("her-dagen").textContent = String(dagen).padStart(2, "0");
  document.getElementById("her-uren").textContent  = String(uren).padStart(2, "0");
  document.getElementById("her-min").textContent   = String(min).padStart(2, "0");
  document.getElementById("her-sec").textContent   = String(sec).padStart(2, "0");
}

updateHereniging();
setInterval(updateHereniging, 1000);

function initTurflijst() {
  const lijst = document.getElementById("turflijst");
  if (!lijst) return;

  const start   = new Date(TRIP.vertrek + "T00:00:00");
  const eind    = new Date(TRIP.thuiskomst + "T00:00:00");
  const totaal  = Math.round((eind - start) / DAG_MS) + 1;
  const nu      = new Date();
  const voorbij = Math.max(0, Math.min(totaal, Math.floor((nu - start) / DAG_MS)));
  const gestart = nu >= start;

  for (let i = 0; i < totaal; i++) {
    const el = document.createElement("div");
    el.className = "turf-dag";
    if (i < voorbij)                        el.classList.add("turf-dag--voorbij");
    else if (i === voorbij && gestart)      el.classList.add("turf-dag--vandaag");
    el.textContent = i < voorbij ? "✓" : String(i + 1);
    lijst.appendChild(el);
  }

  const teller = document.getElementById("turf-teller");
  if (teller) teller.textContent = `${voorbij} / ${totaal}`;
}

initTurflijst();

function startConfetti() {
  if (typeof confetti === "undefined") return;
  const kleuren = ["#46F55E", "#4CA3F8", "#F5151A", "#885225", "#a4a88d"];
  let teller = 0;
  const interval = setInterval(() => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
      colors: kleuren,
    });
    if (++teller >= 5) clearInterval(interval);
  }, 700);
}
