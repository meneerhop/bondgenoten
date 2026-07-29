const WEER_CODES = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "🌥️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

async function laadWeer() {
  const el = document.getElementById("header-weer");
  if (!el) return;
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=8.0863&longitude=98.9063" +
      "&current=temperature_2m,apparent_temperature,weather_code" +
      "&timezone=Asia%2FBangkok"
    );
    const data = await res.json();
    const c = data.current;
    const icon = WEER_CODES[c.weather_code] || "🌡️";
    el.innerHTML = `
      <span class="header-weer-temp">${Math.round(c.temperature_2m)}°</span>
      <span class="header-weer-sub"><span class="header-weer-icon">${icon}</span> voelt als ${Math.round(c.apparent_temperature)}°</span>`;
  } catch {
    el.innerHTML = "";
  }
}

laadWeer();
