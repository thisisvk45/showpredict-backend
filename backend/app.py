# backend/app.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from datetime import datetime, timedelta
import os

# Local imports
from utils.weather import fetch_weather
from utils.chartmetric import search_artist_full
from utils.features import build_features
from utils.model_utils import load_model
from utils.jambase import get_competing_events


# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI()


# -----------------------------
# CORS (Frontend → Backend)
# -----------------------------
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
# Load Venue Stats
# -----------------------------
VENUE_STATS_FILE = "data/venue_stats.json"

if not os.path.exists(VENUE_STATS_FILE):
    VENUE_STATS_FILE = "venue_stats.json"

if not os.path.exists(VENUE_STATS_FILE):
    raise FileNotFoundError("Missing venue_stats.json file.")

with open(VENUE_STATS_FILE, "r") as f:
    VENUE_STATS_LIST = json.load(f)

VENUE_STATS = {item["venue"]: item for item in VENUE_STATS_LIST}


# -----------------------------
# Load Artist-Venue Last Play Data
# -----------------------------
ARTIST_VENUE_FILE = "data/artist_venue_last_play.json"

if not os.path.exists(ARTIST_VENUE_FILE):
    print("Warning: artist_venue_last_play.json not found")
    ARTIST_VENUE_DATA = []
else:
    with open(ARTIST_VENUE_FILE, "r") as f:
        ARTIST_VENUE_DATA = json.load(f)


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
# Venue Coordinates & Capacities (UPDATED - All 15 Venues)
# -----------------------------
VENUES = {
    "Bright Box Theater": {"coords": (39.1845126, -78.1662175), "capacity": 300},
    "The Millwald": {"coords": (36.9490417, -81.0843156), "capacity": 500},
    "The Spot on Kirk": {"coords": (37.2712342, -79.9393615), "capacity": 125},
    "9:30 Club": {"coords": (38.91806, -77.02389), "capacity": 1200},
    "Carolina Theater": {"coords": (35.7795897, -78.6381787), "capacity": 1600},
    "Grandin Theater": {"coords": (37.2626, -79.9653), "capacity": 320},
    "Martins Downtown": {"coords": (37.2710, -79.9414), "capacity": 250},
    "Evening Muse": {"coords": (35.2271, -80.8431), "capacity": 120},
    "Motorco Music Hall": {"coords": (35.9940, -78.8986), "capacity": 450},
    "Local 506": {"coords": (35.9132, -79.0558), "capacity": 250},
    "Cat's Cradle": {"coords": (35.9101, -79.0558), "capacity": 750},
    "The Pinhook": {"coords": (35.9940, -78.8986), "capacity": 200},
    "Kings": {"coords": (35.7796, -78.6382), "capacity": 250},
    "The Fruit": {"coords": (35.7796, -78.6382), "capacity": 600},
    "Amos Southend": {"coords": (35.2008, -80.8569), "capacity": 750}
}



# -----------------------------
# Venue Locations for JamBase API (CORRECTED CITIES)
# -----------------------------
VENUE_LOCATIONS = {
    "Bright Box Theater": {"city": "Winchester", "state": "VA"},
    "The Millwald": {"city": "Wytheville", "state": "VA"},
    "The Spot on Kirk": {"city": "Roanoke", "state": "VA"},
    "9:30 Club": {"city": "Washington", "state": "DC"},
    "Carolina Theater": {"city": "Raleigh", "state": "NC"},
    "Grandin Theater": {"city": "Roanoke", "state": "VA"},
    "Martins Downtown": {"city": "Roanoke", "state": "VA"},
    "Evening Muse": {"city": "Charlotte", "state": "NC"},
    "Motorco Music Hall": {"city": "Raleigh", "state": "NC"},
    "Local 506": {"city": "Raleigh", "state": "NC"},
    "Cat's Cradle": {"city": "Raleigh", "state": "NC"},
    "The Pinhook": {"city": "Raleigh", "state": "NC"},
    "Kings": {"city": "Raleigh", "state": "NC"},
    "The Fruit": {"city": "Raleigh", "state": "NC"},
    "Amos Southend": {"city": "Charlotte", "state": "NC"}
}


# -----------------------------
# Helper: Get Artist-Venue Info
# -----------------------------
def get_artist_venue_info(artist, venue):
    """Look up last play date and times played for artist at venue"""
    for record in ARTIST_VENUE_DATA:
        if record.get("Artist") == artist and record.get("Venue") == venue:
            return {
                "last_play_date": record.get("last_play_date"),
                "times_played": record.get("times_played", 0)
            }
    return {"last_play_date": None, "times_played": 0}


# -----------------------------
# Helper: Calculate Competing Shows
# -----------------------------
def calculate_competing_shows(venue, date_obj):
    """Get real competition data from JamBase API"""
    
    location = VENUE_LOCATIONS.get(venue)
    if not location:
        print(f"Warning: No location mapping for venue: {venue}")
        return {"totalShows": 0, "events": []}
    
    date_str = date_obj.strftime("%Y-%m-%d")
    
    return get_competing_events(
        city=location["city"],
        state=location["state"],
        date_str=date_str,
        days=7
    )


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
# LOGIN ENDPOINT (UPDATED - Returns venues array)
# -----------------------------
@app.post("/api/login")
def login(data: LoginRequest):
    username = data.username
    password = data.password

    if username not in USERS or USERS[username]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Get user's assigned venues (array)
    user_venues = USERS[username].get("venues", [])

    return {
        "success": True,
        "venues": user_venues  # NEW: Returns array of venues
    }


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

    # 4. TICKET SALES PREDICTION (WITH RANGE AND CAPACITY CAP)
    try:
        predicted_tickets = float(MODEL.predict(X)[0])
        
        # Calculate range using MAE-based uncertainty
        MAE = 155  # Your model's Mean Absolute Error
        
        low_estimate = max(0, predicted_tickets - (1.5 * MAE))  # Conservative
        high_estimate = predicted_tickets + (1.5 * MAE)  # Optimistic
        
        # Apply capacity cap - cannot exceed venue maximum
        venue_capacity = VENUES[venue]["capacity"]
        low_estimate = min(low_estimate, venue_capacity)
        predicted_tickets = min(predicted_tickets, venue_capacity)
        high_estimate = min(high_estimate, venue_capacity)
        
        # Round to integers
        prediction_range = {
            "low": int(round(low_estimate)),
            "expected": int(round(predicted_tickets)),
            "high": int(round(high_estimate)),
            "capacity": venue_capacity,
            "capacity_percentage": int(round((predicted_tickets / venue_capacity) * 100))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    # 5. VENUE HISTORICAL STATS
    stats = VENUE_STATS.get(venue, {})
    history = stats.get("history_last_6_months", [])
    if len(history) > 6:
        history = history[-6:]

    # 6. ARTIST-VENUE INFO
    artist_venue_info = get_artist_venue_info(artist, venue)

    # 7. COMPETING SHOWS
    competing_shows = calculate_competing_shows(venue, date_obj)

    # 8. COMPLETE RESPONSE
    return {
        "predicted_tickets": prediction_range,
        "weather": weather,
        "cm_data": cm_data,
        "features_used": raw_features,

        # Venue stats
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
        },

        # Artist-venue info
        "artist_venue_info": artist_venue_info,

        # Competition analysis
        "competing_shows": competing_shows
    }


# -----------------------------
# Run Server (for local testing)
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
