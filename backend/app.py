# backend/app.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from datetime import datetime
import os

# Local imports
from utils.weather import fetch_weather
from utils.chartmetric import search_artist_full
from utils.features import build_features
from utils.model_utils import load_model


# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI()


# -----------------------------
# CORS (Frontend → Backend)
# -----------------------------
# PRODUCTION: Update this with your Netlify URL after deployment
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"  # For now, allow all. Replace with your Netlify URL after deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Load Users
# -----------------------------
USERS_FILE = "credentials/users.json"

if not os.path.exists(USERS_FILE):
    raise FileNotFoundError(f"User credentials file missing: {USERS_FILE}")

with open(USERS_FILE, "r") as f:
    USERS = json.load(f)


# -----------------------------
# Load Venue Stats (NEW)
# -----------------------------
VENUE_STATS_FILE = "data/venue_stats.json"

if not os.path.exists(VENUE_STATS_FILE):
    # fallback: if user placed it in backend/
    VENUE_STATS_FILE = "venue_stats.json"

if not os.path.exists(VENUE_STATS_FILE):
    raise FileNotFoundError("Missing venue_stats.json file.")

with open(VENUE_STATS_FILE, "r") as f:
    VENUE_STATS_LIST = json.load(f)

# convert list → dict for quick lookup
VENUE_STATS = {item["venue"]: item for item in VENUE_STATS_LIST}


# -----------------------------
# Load Model Artifacts
# -----------------------------
MODEL = None
IMPUTER = None
FEATURES = []

@app.on_event("startup")
def load_ml_artifacts():
    global MODEL, IMPUTER, FEATURES
    try:
        artifacts = load_model()
        MODEL = artifacts["model"]
        IMPUTER = artifacts["imputer"]
        FEATURES = artifacts["features"]
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise


# -----------------------------
# Request Schemas
# -----------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


class PredictRequest(BaseModel):
    artist: str
    venue: str
    date: str


# -----------------------------
# Venue Coordinates
# -----------------------------
VENUES = {
    "The Spot on Kirk": {"coords": (37.2712342, -79.9393615), "capacity": 125},
    "Bright Box Theater": {"coords": (39.1845126, -78.1662175), "capacity": 300},
    "Carolina Theatre": {"coords": (35.9978045, -78.9027364), "capacity": 1055},
    "9:30 Club": {"coords": (38.91806, -77.02389), "capacity": 1200},
    "Millwald Theatre": {"coords": (36.9490417, -81.0843156), "capacity": 500},
}


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "ShowPredict API is running",
        "model_loaded": MODEL is not None
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "venues_available": len(VENUES)
    }


# -----------------------------
# LOGIN ENDPOINT
# -----------------------------
@app.post("/api/login")
def login(data: LoginRequest):
    username = data.username
    password = data.password

    if username not in USERS or USERS[username]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"success": True}


# -----------------------------
# PREDICTION ENDPOINT
# -----------------------------
@app.post("/api/predict")
def predict(data: PredictRequest):

    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    artist = data.artist
    venue = data.venue
    date_str = data.date

    # Validate venue
    if venue not in VENUES:
        raise HTTPException(status_code=400, detail="Invalid venue name")

    # Validate date
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    except:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # 1. WEATHER
    lat, lon = VENUES[venue]["coords"]
    weather = fetch_weather(lat, lon, date_obj) or {}

    # 2. ARTIST (Chartmetric)
    cm_data = search_artist_full(artist) or {}

    # 3. BUILD FEATURES
    X, raw_features = build_features(
        venue,
        date_obj,
        weather,
        cm_data,
        VENUES,
        FEATURES,
        IMPUTER,
    )

    # 4. PRICE PREDICTION
    try:
        predicted_price = float(MODEL.predict(X)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    # -----------------------------
    # 5. VENUE HISTORICAL STATS (NEW)
    # -----------------------------
    stats = VENUE_STATS.get(venue, {})

    # Trim to EXACT last 6 months
    history = stats.get("history_last_6_months", [])
    if len(history) > 6:
        history = history[-6:]   # keep last 6 by order

    # -----------------------------
    # 6. COMPLETE RESPONSE
    # -----------------------------
    return {
        "recommended_price": predicted_price,
        "weather": weather,
        "cm_data": cm_data,
        "features_used": raw_features,

        # NEW
        "venue_stats": {
            "capacity": stats.get("capacity"),
            "last_play_date": stats.get("last_play_date"),

            "tickets_last_1_month": stats.get("tickets_last_1_month"),
            "events_last_1_month": stats.get("events_last_1_month"),
            "avg_tickets_last_1_month": stats.get("avg_tickets_last_1_month"),

            "tickets_last_1_year": stats.get("tickets_last_1_year"),
            "events_last_1_year": stats.get("events_last_1_year"),
            "avg_tickets_last_1_year": stats.get("avg_tickets_last_1_year"),

            "history_last_6_months": history
        }
    }


# -----------------------------
# Run Server (for local testing)
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)