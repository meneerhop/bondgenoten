function volgendeUitzending() {
  const nu = new Date();
  const doel = new Date(nu);
  doel.setHours(UITZENDING.uur, UITZENDING.minuut, 0, 0);

  const dagNu = nu.getDay();
  let diff = UITZENDING.dag - dagNu;
  if (diff < 0 || (diff === 0 && nu >= doel)) diff += 7;
  doel.setDate(doel.getDate() + diff);
  return doel;
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

function tickAfl() {
  const el = document.getElementById("afl-countdown");
  if (!el) return;
  const doel = volgendeUitzending();
  const ms = doel - new Date();
  const dag = ["zo","ma","di","wo","do","vr","za"][doel.getDay()];
  el.innerHTML = `
    <span class="afl-label">Volgende aflevering</span>
    <span class="afl-tijd">${formatCountdown(ms)}</span>
    <span class="afl-sub">${dag} ${doel.getHours()}:${String(doel.getMinutes()).padStart(2,"0")}</span>`;
}

tickAfl();
setInterval(tickAfl, 60000);
