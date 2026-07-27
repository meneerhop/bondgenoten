import subprocess
import json
import os
import sys
import requests
from datetime import datetime, timezone

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
TIKTOK_USER  = "@debondgenoten"
TIKTOK_URL   = f"https://www.tiktok.com/{TIKTOK_USER}"

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

def get_all_video_ids():
    # Flat-playlist: snel alle video-IDs ophalen zonder limiet
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
    # Individuele extractie voor datum van één nieuwe video
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
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts?kind=eq.clip&select=note",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
    )
    res.raise_for_status()
    return {row["note"] for row in res.json() if row.get("note")}

def insert_clip(url, datum):
    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/posts",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        json={"kind": "clip", "note": url, "photo_caption": datum},
    )
    res.raise_for_status()

def main():
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

        # Probeer datum uit flat-data, anders aparte fetch
        datum = (
            fmt_datum(v.get("upload_date", ""))
            or fmt_datum_ts(v.get("timestamp"))
            or get_video_datum(canonical)
        )

        insert_clip(canonical, datum)
        print(f"  + {canonical}  ({datum or 'datum onbekend'})")
        added += 1

    print(f"Klaar — {added} nieuwe clip(s) toegevoegd.")

if __name__ == "__main__":
    main()
