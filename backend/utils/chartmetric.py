import requests
from datetime import datetime
from collections import OrderedDict
import numpy as np
import json
import os
from difflib import SequenceMatcher

# -----------------------------
# Chartmetric API
# -----------------------------
REFRESH_TOKEN = "hkAesC9BcvXceGJ2dsVGuDrfHz2QFIdFHWTQT3CA5n24mITOhUyrxrVm0ge2eICy"
BASE = "https://api.chartmetric.com/api"

# -----------------------------
# Load Local Artist JSON Cache
# -----------------------------
CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "artist_social.json")

try:
    with open(CACHE_PATH, "r") as f:
        ARTIST_JSON_CACHE = json.load(f)
except:
    ARTIST_JSON_CACHE = {}


# -----------------------------
# Simple In-Memory LRU Cache
# -----------------------------
_CACHE = OrderedDict()
_CACHE_MAX = 30

_token = None
_token_time = None


# -----------------------------
# Auth Token Handling
# -----------------------------
def _get_token():
    global _token, _token_time

    if (
        _token is None
        or (_token_time and (datetime.now() - _token_time).total_seconds() > 55 * 60)
    ):
        r = requests.post(
            f"{BASE}/token",
            json={"refreshtoken": REFRESH_TOKEN},
            timeout=20,
        )
        r.raise_for_status()
        _token = r.json().get("token")
        _token_time = datetime.now()

    return _token


def _headers():
    return {"Authorization": f"Bearer {_get_token()}"}


# -----------------------------
# JSON Helpers
# -----------------------------
def _similar(a, b):
    """Return similarity score between two strings."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def _find_artist_in_local_cache(name, threshold=0.90):
    """
    Attempts fuzzy-match artist name inside artist_social.json.
    Returns cached dict if similarity >= threshold.
    """

    name_clean = name.lower().strip()

    best_match = None
    best_score = 0

    for artist_key in ARTIST_JSON_CACHE.keys():
        score = _similar(name_clean, artist_key.lower())
        if score > best_score:
            best_score = score
            best_match = artist_key

    if best_score >= threshold and best_match:
        data = ARTIST_JSON_CACHE[best_match]
        out = data.copy()
        out["__cached"] = True
        out["__source"] = "local_json_cache"
        return out

    return None


# -----------------------------
# Memory Cache Helpers
# -----------------------------
def _safe_json_get(r):
    try:
        j = r.json()
        return j.get("obj", j)
    except:
        return {}


def _sum_followers(data, key="followers"):
    try:
        lst = data.get("top_countries", [])
        return int(sum(float(x.get(key, 0)) for x in lst if x.get(key) is not None))
    except:
        return np.nan


def _top_country(data):
    try:
        lst = data.get("top_countries", [])
        return lst[0].get("name") if lst else None
    except:
        return None


def _prune_cache_if_needed():
    while len(_CACHE) > _CACHE_MAX:
        _CACHE.popitem(last=False)


def _save_to_cache(key, payload):
    _CACHE.pop(key, None)
    _CACHE[key] = payload
    _prune_cache_if_needed()


def get_cached_keys():
    return list(reversed(list(_CACHE.keys())))


def clear_cache():
    _CACHE.clear()


def get_from_cache(key):
    v = _CACHE.get(key)
    if not v:
        return None
    _CACHE.pop(key, None)
    _CACHE[key] = v
    return v


# -----------------------------
# Main Artist Fetch Function
# -----------------------------
def search_artist_full(artist_name):
    """
    Fetch full artist data.
    Priority:
    1) Local JSON cache (fuzzy match)
    2) In-memory LRU cache
    3) Chartmetric API
    """

    key = artist_name.strip()
    if not key:
        return None

    # 1) Local JSON fuzzy match
    local_hit = _find_artist_in_local_cache(key)
    if local_hit:
        return local_hit

    # 2) In-memory LRU cache
    cached = get_from_cache(key)
    if cached:
        out = cached.copy()
        out["__cached"] = True
        out["__source"] = "memory_cache"
        return out

    # 3) Chartmetric API fallback
    h = _headers()

    # Search
    r = requests.get(
        f"{BASE}/search",
        headers=h,
        params={"q": artist_name, "type": "artists", "limit": 1},
        timeout=20,
    )
    data = _safe_json_get(r)
    artists = data.get("artists", [])
    if not artists:
        return None

    artist = artists[0]
    artist_id = artist.get("id")

    # Helper to fetch each endpoint safely
    def fetch(endpoint):
        try:
            rr = requests.get(f"{BASE}{endpoint}", headers=h, timeout=20)
            return _safe_json_get(rr)
        except:
            return {}

    p = fetch(f"/artist/{artist_id}")
    youtube = fetch(f"/artist/{artist_id}/youtube-audience-stats")
    tiktok = fetch(f"/artist/{artist_id}/tiktok-audience-stats")
    insta = fetch(f"/artist/{artist_id}/instagram-audience-stats")
    albums = fetch(f"/artist/{artist_id}/albums") or []
    tracks = fetch(f"/artist/{artist_id}/tracks") or []
    events = fetch(f"/artist/{artist_id}/past/events?fromDaysAgo=730&toDaysAgo=0") or []
    riaa = fetch(f"/artist/{artist_id}/riaa") or {}

    out = {
        "artist_name": artist.get("name"),
        "artist_id": artist_id,

        "cm_artist_score": artist.get("cm_artist_score"),
        "cm_artist_rank": p.get("cm_artist_rank"),
        "country": p.get("code2"),
        "record_label": p.get("record_label"),
        "primary_genre": (p.get("genres", {}).get("primary", {}) or {}).get("name"),

        "spotify_followers": artist.get("sp_followers"),
        "spotify_monthly_listeners": artist.get("sp_monthly_listeners"),

        "youtube_total_subscribers": _sum_followers(youtube, "subscribers"),
        "youtube_top_country": _top_country(youtube),

        "tiktok_total_followers": _sum_followers(tiktok),
        "tiktok_top_country": _top_country(tiktok),

        "instagram_total_followers": _sum_followers(insta),
        "instagram_top_country": _top_country(insta),
        "instagram_engagement_rate": insta.get("engagement_rate") if isinstance(insta, dict) else None,

        "albums_count": len(albums) if isinstance(albums, list) else None,
        "tracks_count": len(tracks) if isinstance(tracks, list) else None,
        "events_count": len(events) if isinstance(events, list) else None,

        "riaa_awards_count": len(riaa.get("riaa_awards", [])) if isinstance(riaa, dict) else None,

        "__cached": False,
        "__source": "chartmetric_api",
    }

    # Save to memory cache
    _save_to_cache(key, out.copy())

    return out
