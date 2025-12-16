import requests
import pandas as pd

VISUALCROSSING_KEY = "HXDSM9AG633TZFEM6UB6XCP5E"

def fetch_weather(lat, lon, date_obj):
    """
    Fetch daily weather forecast for a given lat/lon and date.
    Returns a clean dict used by the ML pipeline + frontend.
    """

    try:
        date_str = pd.to_datetime(date_obj).strftime("%Y-%m-%d")

        url = (
            f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/"
            f"timeline/{lat},{lon}/{date_str}"
        )

        params = {
            "key": VISUALCROSSING_KEY,
            "unitGroup": "metric",
            "include": "days",
            "elements": (
                "datetime,temp,feelslike,tempmin,tempmax,precip,snow,"
                "windspeed,humidity,pressure,visibility,cloudcover,conditions,description"
            ),
        }

        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()

        if "days" in data:
            d = data["days"][0]
            return {
                "temperature": d.get("temp"),
                "feels_like": d.get("feelslike"),
                "temp_min": d.get("tempmin"),
                "temp_max": d.get("tempmax"),
                "precip_mm": d.get("precip"),
                "snow_mm": d.get("snow"),
                "windspeed": d.get("windspeed"),
                "humidity": d.get("humidity"),
                "pressure": d.get("pressure"),
                "visibility": d.get("visibility"),
                "cloudcover": d.get("cloudcover"),
                "conditions": d.get("conditions"),
            }

        return {}

    except Exception:
        return {}
