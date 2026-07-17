const DAG_MS = 24 * 60 * 60 * 1000;
const fmtDag = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });

(function initDashboard() {
  document.getElementById("kijklink").href = KIJK_URL;

  const nu = new Date();
  const start = new Date(TRIP.vertrek + "T00:00:00");
  const eind  = new Date(TRIP.thuiskomst + "T00:00:00");
  const totaal = Math.round((eind - start) / DAG_MS);
  const dag    = Math.floor((nu - start) / DAG_MS) + 1;
  const rest   = Math.max(0, Math.ceil((eind - nu) / DAG_MS));

  const teller = document.getElementById("dagteller");
  const aftel  = document.getElementById("aftel");
  const balk   = document.getElementById("voortgang");

  if (nu < start) {
    teller.textContent = `Nog ${Math.ceil((start - nu) / DAG_MS)} nachtjes slapen`;
    aftel.textContent  = `vertrek ${fmtDag.format(start)}`;
  } else if (dag > totaal) {
    teller.textContent = "Welkom thuis! 🎉";
    aftel.textContent  = "";
    if (balk) balk.style.width = "100%";
  } else {
    teller.textContent = `Dag ${dag} van ${totaal}`;
    aftel.textContent  = rest === 1 ? "morgen weer thuis!" : `nog ${rest} dagen`;
    if (balk) balk.style.width = `${Math.min(100, Math.round((dag / totaal) * 100))}%`;
  }
})();
