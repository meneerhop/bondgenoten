// klokken.js — twee live digitale klokken: Nederland en Thailand

(function () {
  const zones = [
    { tz: "Europe/Amsterdam", tijd: "klokNL", datum: "datumNL" },
    { tz: "Asia/Bangkok", tijd: "klokTH", datum: "datumTH" },
  ];

  const fmts = zones.map((z) => ({
    ...z,
    tijdFmt: new Intl.DateTimeFormat("nl-NL", {
      timeZone: z.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }),
    datumFmt: new Intl.DateTimeFormat("nl-NL", {
      timeZone: z.tz, weekday: "short", day: "numeric", month: "short",
    }),
  }));

  function tik() {
    const nu = new Date();
    for (const z of fmts) {
      const t = document.getElementById(z.tijd);
      const d = document.getElementById(z.datum);
      if (t) t.textContent = z.tijdFmt.format(nu);
      if (d) d.textContent = z.datumFmt.format(nu);
    }
  }

  tik();
  setInterval(tik, 1000);
})();
