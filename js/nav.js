(function () {
  const huidig = location.pathname.split("/").pop() || "index.html";

  const bondgenotenPaginas = ["bondgenoten.html", "tijdlijn.html", "voorspelling.html"];
  const reisPaginas        = ["vluchten.html", "polarsteps.html", "thailand.html"];

  const NAV = [
    { label: "Dashboard",      href: "index.html",        icon: "🏠" },
    {
      label: "de Bondgenoten", icon: "📺",
      match: bondgenotenPaginas,
      sub: [
        { label: "de Bondgenoten", href: "bondgenoten.html",  icon: "📺" },
        { label: "Voorspelling",   href: "voorspelling.html", icon: "🏆" },
      ],
    },
    { label: "Berichten", href: "berichten.html", icon: "💌" },
    { label: "Foto's",    href: "fotos.html",     icon: "📷" },
    {
      label: "Reis", icon: "✈️",
      match: reisPaginas,
      sub: [
        { label: "Vluchten",   href: "vluchten.html",   icon: "✈️" },
        { label: "Polarsteps", href: "polarsteps.html", icon: "🗺"  },
        { label: "Thailand",   href: "thailand.html",   icon: "🇹🇭" },
      ],
    },
    { label: "Rotterdam",    href: "rotterdam.html",    icon: "🌉" },
    { label: "Huisdiertjes", href: "huisdiertjes.html", icon: "🐾" },
    { label: "Woordzoeker",  href: "woordzoeker.html",  icon: "🔍" },
  ];

  const btn = document.createElement("button");
  btn.className = "hamburger";
  btn.setAttribute("aria-label", "Menu openen");
  btn.innerHTML = `<span></span><span></span><span></span>`;

  function renderItem(p) {
    if (p.sub) {
      const inGroup = p.match ? p.match.includes(huidig) : false;
      const subHTML = p.sub.map(s => {
        const actief = s.href === huidig;
        return `<a href="${s.href}" class="nav-sub${actief ? " nav-sub--actief" : ""}">
          <span class="nav-icon nav-icon--sm">${s.icon}</span>
          <span class="nav-label">${s.label}</span>
          ${actief ? '<span class="nav-pijl">›</span>' : ""}
        </a>`;
      }).join("");

      return `
        <div class="nav-accordion-trigger${inGroup ? " nav-accordion-trigger--open" : ""}" data-accordion>
          <span class="nav-icon">${p.icon}</span>
          <span class="nav-label">${p.label}</span>
          <span class="nav-pijl nav-pijl--chevron">›</span>
        </div>
        <div class="nav-accordion${inGroup ? " nav-accordion--open" : ""}">
          ${subHTML}
        </div>`;
    }

    const actief = p.href === huidig;
    return `<a href="${p.href}" class="nav-item${actief ? " nav-item--actief" : ""}">
      <span class="nav-icon">${p.icon}</span>
      <span class="nav-label">${p.label}</span>
      <span class="nav-pijl">›</span>
    </a>`;
  }

  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  overlay.innerHTML = `
    <div class="nav-lade">
      <div class="nav-header">
        <div class="nav-header-info">
          <div class="nav-header-titel">Dieuw in Thailand 🇹🇭</div>
          <div class="nav-header-sub">คุณเป็นของฉัน</div>
        </div>
        <button class="nav-sluit" aria-label="Menu sluiten">Klaar</button>
      </div>
      <nav class="nav-menu">
        ${NAV.map(renderItem).join("")}
      </nav>
      <p class="nav-easter-egg"><em>je bent mijn prinsesje</em></p>
    </div>`;

  function open()  {
    navigator.vibrate?.(6);
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

  overlay.querySelectorAll("[data-accordion]").forEach(trigger => {
    trigger.addEventListener("click", () => {
      trigger.classList.toggle("nav-accordion-trigger--open");
      trigger.nextElementSibling.classList.toggle("nav-accordion--open");
    });
  });

  const header = document.querySelector("header.site");
  if (header) header.appendChild(btn);
  document.body.appendChild(overlay);

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("zichtbaar"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.06 });

    document.querySelectorAll(
      ".dash-kaart, .ios-lijst, .turflijst-kaart, .klokken, .voortgang-rij, .bericht-kaart, .vsp-kaart, .vsp-scorebord"
    ).forEach(el => { el.classList.add("fade-in"); obs.observe(el); });
  }
})();
