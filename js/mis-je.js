function getMisJeNaam() {
  return (localStorage.getItem("fotos-naam") || "").trim();
}


async function laadMisJe() {
  try {
    const res = await fetch(
      SUPABASE_URL + "posts?kind=eq.mis-je&select=naam&order=created_at.desc",
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY } }
    );
    const data = await res.json();
    renderMisJe(Array.isArray(data) ? data : []);
  } catch {
    renderMisJe([]);
  }
}

function renderMisJe(data) {
  const getal = document.getElementById("mis-je-getal");
  const namen = document.getElementById("mis-je-namen");
  const knop  = document.getElementById("mis-je-knop");

  if (getal) getal.textContent = data.length;

  const telling = {};
  data.forEach(d => {
    const naam = d.naam.replace(/_/g, " ");
    telling[naam] = (telling[naam] || 0) + 1;
  });
  const uniek = Object.keys(telling);

  if (namen) {
    if (!uniek.length) {
      namen.innerHTML = '<span class="mis-je-leeg">Wees de eerste die haar mist!</span>';
    } else {
      namen.innerHTML = uniek.map(n =>
        `<span class="mis-je-pill">${n}<span class="mis-je-pill-tel">${telling[n]}</span></span>`
      ).join("");
    }
  }

}

async function verstuurMisJe() {
  let naam = getMisJeNaam();
  if (!naam) {
    naam = (prompt("Jouw naam:") || "").trim();
    if (!naam) return;
    localStorage.setItem("fotos-naam", naam);
  }

  const knop = document.getElementById("mis-je-knop");
  knop.classList.add("mis-je-knop--animeer");
  setTimeout(() => knop.classList.remove("mis-je-knop--animeer"), 600);

  if (window.confetti) {
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.55 },
      colors: ["#e8789a", "#f5b8c8", "#ffffff", "#f9d0dc", "#ffd6e0"],
    });
  }

  try {
    const veiligNaam = naam.replace(/[^a-z0-9]/gi, "_");
    await fetch(SUPABASE_URL + "posts", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ kind: "mis-je", naam: veiligNaam }),
    });
    await laadMisJe();
  } catch (e) {
    console.error("mis-je:", e);
  }
}

document.getElementById("mis-je-knop")?.addEventListener("click", verstuurMisJe);
laadMisJe();
