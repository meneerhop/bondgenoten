// Slaap-overlap widget: wanneer zijn Mitch en Dieuw allebei wakker?
// Thailand (TH) = UTC+7, Nederland (NL) = UTC+2 (CEST) → TH is +5u vs NL

const WAKKER = {
  mitch: { van: 8,  tot: 23 }, // NL-uren
  dieuw: { van: 7,  tot: 23 }, // TH-uren → in NL: 2u–18u
};

// Overlap in NL-uren: Mitch wakker v.a. 8u, Dieuw "slaapt" (NL-tijd) na 18u
const OV_START = 8;
const OV_EIND  = 18;

function nlUur(nu) {
  return parseInt(new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam", hour: "numeric", hour12: false
  }).format(nu), 10);
}

function thUur(nu) {
  return parseInt(new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Asia/Bangkok", hour: "numeric", hour12: false
  }).format(nu), 10);
}

function tijdStr(nu, zone) {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: zone, hour: "2-digit", minute: "2-digit"
  }).format(nu);
}

function updateSlaapWidget() {
  const el = document.getElementById("slaap-widget");
  if (!el) return;

  const nu = new Date();
  const nl  = nlUur(nu);
  const th  = thUur(nu);

  const mitchWakker = nl >= WAKKER.mitch.van && nl < WAKKER.mitch.tot;
  const dieuwWakker = th >= WAKKER.dieuw.van && th < WAKKER.dieuw.tot;
  const beidWakker  = mitchWakker && dieuwWakker;

  const statusTekst = beidWakker            ? "Jullie zijn allebei wakker! 🟢"
    : !mitchWakker && !dieuwWakker          ? "Jullie slapen allebei 🌙"
    : !mitchWakker                          ? "Mitch slaapt 😴"
                                            : "Dieuw slaapt 😴";

  const blokken = Array.from({ length: 24 }, (_, h) => {
    const cls = ["so-blok",
      h >= OV_START && h < OV_EIND ? "so-blok--overlap" : "",
      h === nl                      ? "so-blok--nu"      : "",
    ].filter(Boolean).join(" ");
    return `<div class="${cls}" title="${h}:00"></div>`;
  }).join("");

  el.innerHTML = `
    <div class="so-header">
      <span class="so-label">Wakker zijn</span>
      <span class="so-status${beidWakker ? " so-status--groen" : ""}">${statusTekst}</span>
    </div>
    <div class="so-rijen">
      <div class="so-rij">
        <span class="so-naam">Mitch 🇳🇱</span>
        <span class="so-tijd">${tijdStr(nu, "Europe/Amsterdam")}</span>
        <span class="so-pip${mitchWakker ? " so-pip--wakker" : ""}"></span>
        <span class="so-staat">${mitchWakker ? "wakker" : "slaapt"}</span>
      </div>
      <div class="so-rij">
        <span class="so-naam">Dieuw 🇹🇭</span>
        <span class="so-tijd">${tijdStr(nu, "Asia/Bangkok")}</span>
        <span class="so-pip${dieuwWakker ? " so-pip--wakker" : ""}"></span>
        <span class="so-staat">${dieuwWakker ? "wakker" : "slaapt"}</span>
      </div>
    </div>
    <div class="so-balk">${blokken}</div>
    <div class="so-balk-labels">
      <span>0u</span><span>6u</span><span>12u</span><span>18u</span><span>24u</span>
    </div>
    <div class="so-overlap-tekst">Overlap: ${OV_START}:00–${OV_EIND}:00 NL · ${OV_START + 5}:00–${OV_EIND + 5}:00 TH</div>`;
}

updateSlaapWidget();
setInterval(updateSlaapWidget, 30000);
