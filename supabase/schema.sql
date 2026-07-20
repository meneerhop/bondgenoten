-- Schema voor de Bondgenoten-reissite
-- Plak dit in de SQL Editor van je Supabase-project en klik op Run.

-- Berichten van thuis: jouw dagelijkse noot + hondenfoto
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day_date date not null default current_date,
  note text,                -- jouw commentaar bij de aflevering / berichtje
  photo_url text,           -- publieke URL van de foto in storage
  photo_caption text,       -- bijv. "Moffel mist je ook"
  kind text not null default 'thuis'  -- 'thuis' (van jou) of 'reis' (van haar)
);

alter table posts enable row level security;

-- Iedereen mag lezen (de site is toch al obscuur; wil je het strenger,
-- zet dan ook select achter authenticatie en laat haar inloggen)
create policy "publiek lezen" on posts
  for select using (true);

-- Alleen ingelogde gebruikers mogen schrijven
create policy "ingelogd schrijven" on posts
  for insert with check (auth.role() = 'authenticated');

create policy "ingelogd bijwerken" on posts
  for update using (auth.role() = 'authenticated');

create policy "ingelogd verwijderen" on posts
  for delete using (auth.role() = 'authenticated');

-- STORAGE (voor foto's):
-- 1. Ga in Supabase naar Storage → New bucket
-- 2. Naam: fotos  → zet "Public bucket" AAN
-- 3. Voer daarna deze policies uit:

create policy "fotos publiek lezen" on storage.objects
  for select using (bucket_id = 'fotos');

create policy "fotos ingelogd uploaden" on storage.objects
  for insert with check (bucket_id = 'fotos' and auth.role() = 'authenticated');

-- VOORSPELLINGEN (picks per speler per cyclus):
-- Voer dit uit in de SQL Editor om de picks-tabel aan te maken.

create table if not exists picks (
  id           uuid primary key default gen_random_uuid(),
  speler       text not null,
  cyclus_nr    int  not null,
  keuze        text not null,
  created_at   timestamptz not null default now(),
  gewijzigd_op timestamptz not null default now(),
  unique(speler, cyclus_nr)
);

alter table picks enable row level security;

-- Iedereen mag lezen en schrijven (de site is privé/noindex)
create policy "picks publiek lezen"    on picks for select using (true);
create policy "picks publiek schrijven" on picks for insert with check (true);
create policy "picks publiek wijzigen"  on picks for update using (true);

-- GEBRUIKERS:
-- Ga naar Authentication → Users → Add user en maak een account
-- voor jezelf (en eventueel voor haar) met e-mail + wachtwoord.
-- Zet onder Authentication → Sign In / Up → "Allow new users to sign up" UIT,
-- zodat niemand anders een account kan aanmaken.
