const GROEP_KLEUR = {
  gieren:       { bg: "#FFFFFF", tekst: "#2c332f", logo: "https://images.vakantieveilingen.nl/hotels/hotels-nederland/overnachting-de-bondgenoten-team-de-gieren-korting/9bfc64.jpg?q=70&auto=compress,format,enhance" },
  slangen:      { bg: "#46F55E", tekst: "#1a3a1f", logo: "https://images.vakantieveilingen.nl/hotels/hotels-nederland/overnachting-bb-de-bondgenoten-team-de-slangen-korting/eb0ed0.jpg?q=70&auto=compress,format,enhance" },
  haaien:       { bg: "#4CA3F8", tekst: "#0a2a4a", logo: "https://images.vakantieveilingen.nl/hotels/hotels-nederland/overnachting-bb-de-bondgenoten-team-de-haaien-korting/3f4f6b.jpg?q=70&auto=compress,format,enhance" },
  vossen:       { bg: "#F5151A", tekst: "#ffffff", logo: "https://images.vakantieveilingen.nl/hotels/hotels-nederland/overnachting-bb-de-bondgenoten-team-de-vossen-korting/244bf0.jpg?q=70&auto=compress,format,enhance" },
  bloedzuigers: { bg: "#885225", tekst: "#ffffff", logo: "https://i.ibb.co/kVSNmbMD/Chat-GPT-Image-17-jul-2026-11-39-31.png" },
};

const BASE = "https://hprhawqzksknaaaxnzqx.supabase.co/storage/v1/object/public/fotos/";

const KANDIDATEN = [
  // Bloedzuigers
  { naam: "Can",        foto: BASE + "can.jpg",        groep: "bloedzuigers", actief: true },
  { naam: "Fabiënne",  foto: BASE + "fabienne.jpg",   groep: "bloedzuigers", actief: true },
  { naam: "Milan",      foto: BASE + "milan.jpg",      groep: "bloedzuigers", actief: true },
  { naam: "Wesley",     foto: BASE + "wesley.jpg",     groep: "bloedzuigers", actief: true },
  // Gieren
  { naam: "Anouk",      foto: BASE + "anouk.jpg",      groep: "gieren",       actief: true },
  { naam: "Diederik",   foto: BASE + "diederik.jpg",   groep: "gieren",       actief: true },
  { naam: "Dominique",  foto: BASE + "dominique.jpg",  groep: "gieren",       actief: true },
  { naam: "Sayf",       foto: BASE + "sayf.jpg",       groep: "gieren",       actief: true },
  // Haaien
  { naam: "Delano",     foto: BASE + "delano.jpg",     groep: "haaien",       actief: true },
  { naam: "Fatima",     foto: BASE + "fatima.jpg",     groep: "haaien",       actief: true },
  { naam: "Julia",      foto: BASE + "julia.jpg",      groep: "haaien",       actief: true },
  { naam: "Roma",       foto: BASE + "roma.jpg",       groep: "haaien",       actief: true },
  // Slangen
  { naam: "Mila",       foto: BASE + "mila.jpg",       groep: "slangen",      actief: true },
  { naam: "Ricardo",    foto: BASE + "ricardo.jpg",    groep: "slangen",      actief: true },
  { naam: "Simone",     foto: BASE + "simone.jpg",     groep: "slangen",      actief: true },
  { naam: "Valentijne", foto: BASE + "valentijne.jpg", groep: "slangen",      actief: true },
  // Vossen
  { naam: "Casper",     foto: BASE + "casper.jpg",     groep: "vossen",       actief: true },
  { naam: "Jordy",      foto: BASE + "jordy.jpg",      groep: "vossen",       actief: true },
  { naam: "Joshlyn",    foto: BASE + "joshlyn.jpg",    groep: "vossen",       actief: true },
  { naam: "Nyssa",      foto: BASE + "nyssa.jpg",      groep: "vossen",       actief: true },
];
