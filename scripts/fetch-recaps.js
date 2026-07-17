// fetch-recaps.js
// Haalt dagelijks De Bondgenoten-recaps op van LoveReality en schrijft ze naar data/episodes.json
// Draait in GitHub Actions (Node 20+, geen dependencies nodig).

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DATA_FILE = new URL("../data/episodes.json", import.meta.url).pathname;
const MAX_ITEMS = 60; // ruim genoeg voor de hele reis

// Bronnen: eerst RSS proberen, anders de categoriepagina scrapen
const FEED_URLS = [
  "https://lovereality.nl/nieuws/de-bondgenoten/feed/",
  "https://lovereality.nl/feed/",
];
const CATEGORY_URL = "https://lovereality.nl/nieuws/de-bondgenoten/";

const UA = { "User-Agent": "Mozilla/5.0 (bondgenoten-reisdagboek; persoonlijk gebruik)" };

function decodeEntities(str = "") {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags(html = "") {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function truncate(str, n = 180) {
  if (str.length <= n) return str;
  return str.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

// ---- RSS parsen (simpel, zonder dependencies) ----
function parseRss(xml) {
  const items = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const block of itemBlocks) {
    const pick = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? decodeEntities(m[1]) : "";
    };
    const title = pick("title");
    const link = pick("link");
    const pubDate = pick("pubDate");
    const description = truncate(stripTags(pick("description")));
    if (title && link) {
      items.push({
        title,
        link,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        teaser: description,
        source: "LoveReality",
      });
    }
  }
  return items;
}

// ---- Fallback: categoriepagina scrapen ----
function parseCategoryPage(html) {
  const items = [];
  // Artikelen staan als <h2 class="..."><a href="LINK" ...>TITEL</a></h2>
  const re = /<h2[^>]*>\s*<a[^>]+href="(https:\/\/lovereality\.nl\/[^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g;
  let m;
  const seen = new Set();
  while ((m = re.exec(html)) !== null) {
    const link = m[1];
    const title = stripTags(m[2]);
    if (!title || seen.has(link)) continue;
    seen.add(link);
    items.push({
      title,
      link,
      date: new Date().toISOString(),
      teaser: "",
      source: "LoveReality",
    });
  }
  return items;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: UA, redirect: "follow" });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

async function getNewItems() {
  // 1. RSS proberen
  for (const url of FEED_URLS) {
    try {
      const xml = await fetchText(url);
      const items = parseRss(xml).filter((i) =>
        (i.title + " " + i.link).toLowerCase().includes("bondgenoten") ||
        url.includes("de-bondgenoten")
      );
      if (items.length) {
        console.log(`✓ ${items.length} items via RSS: ${url}`);
        return items;
      }
    } catch (err) {
      console.warn(`RSS mislukt (${url}): ${err.message}`);
    }
  }
  // 2. Fallback: categoriepagina
  try {
    const html = await fetchText(CATEGORY_URL);
    const items = parseCategoryPage(html);
    console.log(`✓ ${items.length} items via categoriepagina`);
    return items;
  } catch (err) {
    console.error(`Categoriepagina mislukt: ${err.message}`);
    return [];
  }
}

function loadExisting() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

const existing = loadExisting();
const fresh = await getNewItems();

if (!fresh.length) {
  console.log("Geen nieuwe items gevonden; bestand blijft ongewijzigd.");
  process.exit(0);
}

// Samenvoegen, ontdubbelen op link, nieuwste eerst
const byLink = new Map();
for (const item of [...fresh, ...existing]) {
  if (!byLink.has(item.link)) byLink.set(item.link, item);
}
const merged = [...byLink.values()]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, MAX_ITEMS);

writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2) + "\n");
console.log(`Klaar: ${merged.length} items in data/episodes.json (${merged.length - existing.length >= 0 ? "+" : ""}${merged.length - existing.length} t.o.v. vorige run).`);
