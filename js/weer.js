const WEER_CODES = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "🌥️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

async function laadWeer() {
  const el = document.getElementById("weer-widget");
  if (!el) return;
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018" +
      "&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m" +
      "&timezone=Asia%2FBangkok"
    );
    const data = await res.json();
    const c = data.current;
    const icon = WEER_CODES[c.weather_code] || "🌡️";
    el.innerHTML = `
      <div class="weer-icon">${icon}</div>
      <div class="weer-body">
        <div class="weer-temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="weer-sub">Voelt als ${Math.round(c.apparent_temperature)}° · ${c.relative_humidity_2m}% vochtigheid</div>
      </div>
      <div class="weer-locatie">Bangkok 🇹🇭</div>`;
  } catch {
    el.innerHTML = `<div class="weer-body"><div class="weer-sub">Weer niet beschikbaar</div></div>`;
  }
}

laadWeer();
