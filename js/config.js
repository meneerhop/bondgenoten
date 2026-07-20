// config.js — vul dit één keer in

// Uit je Supabase-project: Settings → API
const SUPABASE_URL = "https://hprhawqzksknaaaxnzqx.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwcmhhd3F6a3NrbmFhYXhuenF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjk4ODUsImV4cCI6MjA5OTg0NTg4NX0.zboq_q0rzbWB8Xipe-tpmKF0iJ35K-j2yCuTFKFkmRA";

// Reisgegevens (voor de dagteller en aftelklok)
const TRIP = {
  naam: "Thailand",
  vertrek: "2026-07-22",     // vertrekdag (BRU → BKK)
  thuiskomst: "2026-08-18",  // landing terug in Brussel
};

// Supabase project URL (zonder /rest/v1/ — voor storage & auth)
const SUPABASE_PROJECT_URL = "https://hprhawqzksknaaaxnzqx.supabase.co";

// Link naar de show op KIJK (werkt in Thailand alleen met NL-VPN)
const KIJK_URL = "https://kijk.nl/programmas/de-bondgenoten";

// Vluchtgegevens — tijden zijn lokale tijd op het vliegveld zelf.
// De ISO-timestamps (met tijdzone) worden gebruikt voor de aftelklok.
const VLUCHTEN = [
  {
    richting: "Heenreis",
    datumLabel: "woensdag 22 juli 2026",
    totaal: "18u00 totaal",
    vertrekIso: "2026-07-22T13:20:00+02:00",
    segmenten: [
      {
        code: "HU492 · Hainan Airlines",
        duur: "9u50",
        stappen: [
          { tijd: "13:20", plek: "Brussel (BRU)", sub: "wo 22 jul" },
          { tijd: "05:10", plek: "Beijing (PEK) · Terminal 2", sub: "do 23 jul, lokale tijd" },
        ],
      },
      { overstap: "3u05 overstap in Beijing" },
      {
        code: "HU429 · Hainan Airlines",
        duur: "5u05",
        stappen: [
          { tijd: "08:15", plek: "Beijing (PEK) · Terminal 2", sub: "do 23 jul" },
          { tijd: "12:20", plek: "Bangkok (BKK) · Suvarnabhumi", sub: "do 23 jul, lokale tijd" },
        ],
      },
    ],
  },
  {
    richting: "Terugreis",
    datumLabel: "maandag 17 augustus 2026",
    totaal: "22u00 totaal",
    vertrekIso: "2026-08-17T13:50:00+07:00",
    segmenten: [
      {
        code: "HU430 · Hainan Airlines",
        duur: "5u05",
        stappen: [
          { tijd: "13:50", plek: "Bangkok (BKK) · Suvarnabhumi", sub: "ma 17 aug" },
          { tijd: "19:55", plek: "Beijing (PEK) · Terminal 2", sub: "ma 17 aug, lokale tijd" },
        ],
      },
      { overstap: "7u05 overstap in Beijing" },
      {
        code: "HU491 · Hainan Airlines",
        duur: "9u50",
        stappen: [
          { tijd: "03:00", plek: "Beijing (PEK) · Terminal 2", sub: "di 18 aug" },
          { tijd: "06:50", plek: "Brussel (BRU)", sub: "di 18 aug, lokale tijd" },
        ],
      },
    ],
  },
];

// Itineraris — vul steden aan naarmate de route duidelijk wordt
const ITINERARIS = [
  // { stad: "Chiang Mai", van: "2026-07-25", tot: "2026-07-28" },
];

function huidigeLocatie() {
  const nu = new Date();
  for (const stop of ITINERARIS) {
    const van = new Date(stop.van + "T00:00:00");
    const tot = new Date(stop.tot + "T23:59:59");
    if (nu >= van && nu <= tot) return stop.stad;
  }
  return null;
}
