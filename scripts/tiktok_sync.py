import subprocess
import json
import os
import sys
import time
import requests
from datetime import datetime, timezone, timedelta

SUPABASE_URL  = os.environ["SUPABASE_URL"]
SUPABASE_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
TIKTOK_USER   = "@debondgenoten"
TIKTOK_URL    = f"https://www.tiktok.com/{TIKTOK_USER}"
VENSTER_DAGEN = 14

MAANDEN = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
]

def fmt_datum(s):
    if not s or len(s) != 8:
        return ""
    try:
        return f"{int(s[6:8])} {MAANDEN[int(s[4:6])-1]} {int(s[:4])}"
    except Exception:
        return ""

def fmt_datum_ts(ts):
    if not ts:
        return ""
    try:
        dt = datetime.fromtimestamp(int(ts), tz=timezone.utc)
        return f"{dt.day} {MAANDEN[dt.month-1]} {dt.year}"
    except Exception:
        return ""

def parse_nl_datum(s):
    if not s:
        return None
    try:
        d, m, j = s.lower().split()
        return datetime(int(j), MAANDEN.index(m) + 1, int(d), tzinfo=timezone.utc)
    except Exception:
        return None

def _headers():
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

def get_all_video_ids():
    result = subprocess.run(
        ["yt-dlp", "--flat-playlist", "--dump-json", "--no-warnings", TIKTOK_URL],
        capture_output=True, text=True,
    )
    videos = []
    for line in result.stdout.strip().splitlines():
        try:
            videos.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    if not videos:
        print("yt-dlp stderr:", result.stderr[:500], file=sys.stderr)
    return videos

def get_video_datum(url):
    result = subprocess.run(
        ["yt-dlp", "--skip-download", "--dump-json", "--no-warnings", url],
        capture_output=True, text=True, timeout=30,
    )
    try:
        data = json.loads(result.stdout.strip().splitlines()[0])
        return (
            fmt_datum(data.get("upload_date", ""))
            or fmt_datum_ts(data.get("timestamp"))
        )
    except Exception:
        return ""

def wis_alle_clips():
    res = requests.delete(
        f"{SUPABASE_URL}/rest/v1/posts?kind=eq.clip",
        headers=_headers(),
    )
    res.raise_for_status()
    print("Alle clips verwijderd.")

def insert_clip(url, datum):
    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/posts",
        headers={**_headers(), "Content-Type": "application/json", "Prefer": "return=minimal"},
        json={"kind": "clip", "note": url, "photo_caption": datum},
    )
    res.raise_for_status()

def main():
    grens = datetime.now(timezone.utc) - timedelta(days=VENSTER_DAGEN)

    print("--- Alle clips verwijderen ---")
    wis_alle_clips()

    print("--- Video-IDs ophalen ---")
    videos = get_all_video_ids()
    print(f"{len(videos)} video(s) gevonden op TikTok.")

    # Sorteer op video-ID aflopend: hoogste ID = nieuwste video
    videos.sort(key=lambda v: int(v.get("id", 0)), reverse=True)

    print("--- Recente clips toevoegen ---")
    added = 0
    for v in videos:
        vid_id = v.get("id")
        if not vid_id:
            continue
        canonical = f"https://www.tiktok.com/{TIKTOK_USER}/video/{vid_id}"

        # Datum: flat-data eerst, dan individuele fetch
        datum = fmt_datum(v.get("upload_date", "")) or fmt_datum_ts(v.get("timestamp"))
        datum_obj = parse_nl_datum(datum)
        if not datum_obj:
            datum = get_video_datum(canonical)
            datum_obj = parse_nl_datum(datum)
            time.sleep(0.5)  # vermijd rate limiting

        # Datum onbekend → overslaan
        if not datum_obj:
            continue

        # Ouder dan venster → stoppen (we gaan nieuwste-eerst)
        if datum_obj < grens:
            print(f"Gestopt bij {datum} (ouder dan {VENSTER_DAGEN} dagen).")
            break

        insert_clip(canonical, datum)
        print(f"  + {canonical}  ({datum})")
        added += 1

    print(f"Klaar — {added} clip(s) toegevoegd.")

if __name__ == "__main__":
    main()
