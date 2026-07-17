(function () {
  const huidig = location.pathname.split("/").pop() || "index.html";

  function bondjesHTML() {
    if (typeof KANDIDATEN === "undefined" || typeof GROEP_KLEUR === "undefined") return "";
    return Object.keys(GROEP_KLEUR).map(groep => {
      const k = GROEP_KLEUR[groep];
      const leden = KANDIDATEN.filter(k => k.groep === groep);
      return `
        <div class="nav-bondje">
          <div class="nav-bondje-naam" style="background:${k.bg};color:${k.tekst}">
            ${groep}
          </div>
          <div class="nav-bondje-leden">
            ${leden.map(l => `<span class="nav-bondje-lid${l.actief ? "" : " nav-bondje-lid--uit"}">${l.naam}</span>`).join("")}
          </div>
        </div>`;
    }).join("");
  }

  const btn = document.createElement("button");
  btn.className = "hamburger";
  btn.setAttribute("aria-label", "Menu openen");
  btn.innerHTML = `<span></span><span></span><span></span>`;

  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  overlay.innerHTML = `
    <div class="nav-lade">
      <button class="nav-sluit" aria-label="Menu sluiten">✕</button>
      <nav class="nav-menu">

        <a href="index.html" class="nav-item${huidig === "index.html" ? " nav-item--actief" : ""}">
          <span class="nav-icon">⌂</span><span>Home</span>
        </a>

        <div class="nav-item nav-accordion-trigger${["tijdlijn.html","bondgenoten.html"].includes(huidig) ? " nav-item--actief" : ""}" data-target="nav-bondjes">
          <span class="nav-icon">📺</span><span>Bondjes</span><span class="nav-chevron">›</span>
        </div>
        <div class="nav-accordion" id="nav-bondjes">
          <a href="tijdlijn.html" class="nav-sub${huidig === "tijdlijn.html" ? " nav-sub--actief" : ""}">📅 Tijdlijn</a>
          <a href="bondgenoten.html" class="nav-sub${huidig === "bondgenoten.html" ? " nav-sub--actief" : ""}">👥 Kandidaten</a>
          <div class="nav-bondjes-lijst" id="nav-bondjes-lijst"></div>
        </div>

        <a href="vluchten.html" class="nav-item${huidig === "vluchten.html" ? " nav-item--actief" : ""}">
          <span class="nav-icon">✈</span><span>Vluchten</span>
        </a>

        <a href="polarsteps.html" class="nav-item${huidig === "polarsteps.html" ? " nav-item--actief" : ""}">
          <span class="nav-icon">🗺</span><span>Polarsteps</span>
        </a>

      </nav>
    </div>`;

  function open() {
    overlay.classList.add("nav-overlay--open");
    document.body.classList.add("nav-open");
    overlay.querySelector("#nav-bondjes-lijst").innerHTML = bondjesHTML();
  }
  function sluit() {
    overlay.classList.remove("nav-overlay--open");
    document.body.classList.remove("nav-open");
  }

  btn.addEventListener("click", open);
  overlay.querySelector(".nav-sluit").addEventListener("click", sluit);
  overlay.addEventListener("click", e => { if (e.target === overlay) sluit(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") sluit(); });

  overlay.addEventListener("click", e => {
    const trigger = e.target.closest(".nav-accordion-trigger");
    if (!trigger) return;
    const id = trigger.dataset.target;
    const acc = document.getElementById(id);
    if (acc) {
      acc.classList.toggle("nav-accordion--open");
      trigger.classList.toggle("nav-accordion-trigger--open");
    }
  });

  const header = document.querySelector("header.site");
  if (header) header.appendChild(btn);
  document.body.appendChild(overlay);

  if (["tijdlijn.html","bondgenoten.html"].includes(huidig)) {
    const acc = overlay.querySelector("#nav-bondjes");
    const trigger = overlay.querySelector("[data-target='nav-bondjes']");
    if (acc) acc.classList.add("nav-accordion--open");
    if (trigger) trigger.classList.add("nav-accordion-trigger--open");
  }
})();
