import subprocess
import json
import os
import sys
import requests
from datetime import datetime, timezone, timedelta

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
TIKTOK_USER  = "@debondgenoten"
TIKTOK_URL   = f"https://www.tiktok.com/{TIKTOK_USER}"
VENSTER_DAGEN = 14

MAANDEN = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
]

def fmt_datum(upload_date):
    if not upload_date or len(upload_date) != 8:
        return ""
    jaar  = int(upload_date[:4])
    maand = int(upload_date[4:6])
    dag   = int(upload_date[6:8])
    return f"{dag} {MAANDEN[maand - 1]} {jaar}"

def fmt_datum_ts(ts):
    if not ts:
        return ""
    dt = datetime.fromtimestamp(int(ts), tz=timezone.utc)
    return f"{dt.day} {MAANDEN[dt.month - 1]} {dt.year}"

def parse_nl_datum(s):
    if not s:
        return None
    delen = s.lower().split()
    if len(delen) != 3:
        return None
    try:
        return datetime(int(delen[2]), MAANDEN.index(delen[1]) + 1, int(delen[0]), tzinfo=timezone.utc)
    except (ValueError, IndexError):
        return None

def supabase_get(path):
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
    )
    res.raise_for_status()
    return res.json()

def supabase_delete(path):
    res = requests.delete(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
    )
    res.raise_for_status()

def supabase_post(path, body):
    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        json=body,
    )
    res.raise_for_status()

def nettoyer_oude_clips(grens):
    clips = supabase_get("posts?kind=eq.clip&select=id,photo_caption,created_at")
    te_verwijderen = []
    for clip in clips:
        datum = parse_nl_datum(clip.get("photo_caption", ""))
        if datum is None:
            try:
                datum = datetime.fromisoformat(clip["created_at"].replace("Z", "+00:00"))
            except Exception:
                continue
        if datum < grens:
            te_verwijderen.append(clip["id"])

    for clip_id in te_verwijderen:
        supabase_delete(f"posts?id=eq.{clip_id}")

    print(f"{len(te_verwijderen)} oude clip(s) verwijderd.")

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

def get_existing_urls():
    rows = supabase_get("posts?kind=eq.clip&select=note")
    return {row["note"] for row in rows if row.get("note")}

def main():
    grens = datetime.now(timezone.utc) - timedelta(days=VENSTER_DAGEN)

    print(f"--- Opruimen (ouder dan {VENSTER_DAGEN} dagen) ---")
    nettoyer_oude_clips(grens)

    print("--- Nieuwe clips ophalen ---")
    videos   = get_all_video_ids()
    existing = get_existing_urls()
    print(f"{len(videos)} video(s) gevonden op TikTok, {len(existing)} al in Supabase.")

    added = 0
    for v in videos:
        vid_id = v.get("id")
        if not vid_id:
            continue
        canonical = f"https://www.tiktok.com/{TIKTOK_USER}/video/{vid_id}"
        if canonical in existing or v.get("url") in existing:
            continue

        # Datum bepalen
        datum = (
            fmt_datum(v.get("upload_date", ""))
            or fmt_datum_ts(v.get("timestamp"))
            or get_video_datum(canonical)
        )

        # Sla over als video buiten het venster valt
        datum_obj = parse_nl_datum(datum)
        if datum_obj and datum_obj < grens:
            continue

        supabase_post("posts", {"kind": "clip", "note": canonical, "photo_caption": datum})
        print(f"  + {canonical}  ({datum or 'datum onbekend'})")
        added += 1

    print(f"Klaar — {added} nieuwe clip(s) toegevoegd.")

if __name__ == "__main__":
    main()
