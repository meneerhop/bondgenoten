import subprocess
import json
import os
import sys
import requests

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

def get_tiktok_videos():
    # Volledige extractie (geen --flat-playlist) zodat upload_date beschikbaar is.
    # --playlist-end 50 voorkomt timeouts op grote accounts.
    result = subprocess.run(
        [
            "yt-dlp", "--skip-download", "--dump-json", "--no-warnings",
            "--playlist-end", "50",
            TIKTOK_URL,
        ],
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
    videos   = get_tiktok_videos()
    existing = get_existing_urls()
    print(f"{len(videos)} video(s) gevonden op TikTok, {len(existing)} al in Supabase.")

    added = 0
    for v in videos:
        vid_id = v.get("id")
        url    = v.get("webpage_url") or v.get("url") or (
            f"https://www.tiktok.com/{TIKTOK_USER}/video/{vid_id}" if vid_id else None
        )
        if not url or not vid_id:
            continue
        # Normaliseer naar canonical URL-formaat
        canonical = f"https://www.tiktok.com/{TIKTOK_USER}/video/{vid_id}"
        if url in existing or canonical in existing:
            continue
        datum = fmt_datum(v.get("upload_date", ""))
        insert_clip(canonical, datum)
        print(f"  + {canonical}  ({datum or 'datum onbekend'})")
        added += 1

    print(f"Klaar — {added} nieuwe clip(s) toegevoegd.")

if __name__ == "__main__":
    main()
