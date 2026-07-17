(function () {
  const huidig = location.pathname.split("/").pop() || "index.html";
  const bondgenotenPaginas = ["bondgenoten.html", "tijdlijn.html"];

  const PAGINAS = [
    { label: "Dashboard",       href: "index.html",        icon: "🏠" },
    { label: "de Bondgenoten", href: "bondgenoten.html",  icon: "📺", match: bondgenotenPaginas },
    { label: "Foto's",         href: "fotos.html",        icon: "📷" },
    { label: "Voorspelling",   href: "voorspelling.html", icon: "🏆" },
    { label: "Vluchten",       href: "vluchten.html",     icon: "✈" },
    { label: "Polarsteps",     href: "polarsteps.html",   icon: "🗺" },
  ];

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
        ${PAGINAS.map(p => {
          const actief = p.match ? p.match.includes(huidig) : p.href === huidig;
          return `<a href="${p.href}" class="nav-item${actief ? " nav-item--actief" : ""}">
            <span class="nav-icon">${p.icon}</span><span>${p.label}</span>
          </a>`;
        }).join("")}
      </nav>
      <p class="nav-easter-egg"><em>je bent een prinsesje</em></p>
    </div>`;

  function open() {
    overlay.classList.add("nav-overlay--open");
    document.body.classList.add("nav-open");
  }
  function sluit() {
    overlay.classList.remove("nav-overlay--open");
    document.body.classList.remove("nav-open");
  }

  btn.addEventListener("click", open);
  overlay.querySelector(".nav-sluit").addEventListener("click", sluit);
  overlay.addEventListener("click", e => { if (e.target === overlay) sluit(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") sluit(); });

  const header = document.querySelector("header.site");
  if (header) header.appendChild(btn);
  document.body.appendChild(overlay);
})();
