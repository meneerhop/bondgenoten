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
  const totaal = Math.round((eind - start) / DAG_MS);
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
})();

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
