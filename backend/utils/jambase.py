import requests
from datetime import datetime, timedelta
import os

# Get API key from environment variable (secure)
JAMBASE_API_KEY = os.environ.get("JAMBASE_API_KEY", "f360dd73-1747-4cff-ae2f-22dd2db4e677")

def get_competing_events(city, state, date_str, days=7):
    """
    Fetch competing events from JamBase API
    
    Args:
        city: City name (e.g., "Washington")
        state: State code (e.g., "DC")
        date_str: Date string "YYYY-MM-DD"
        days: Number of days to look ahead (default 7)
    
    Returns:
        dict with totalShows and events list
    """
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    week_end = date_obj + timedelta(days=days)
    
    url = "https://www.jambase.com/jb-api/v1/events"
    
    params = {
        "apikey": JAMBASE_API_KEY,
        "geoStateIso": f"US-{state.upper()}",
        "eventDateFrom": date_str,
        "eventDateTo": week_end.strftime("%Y-%m-%d"),
        "perPage": 100
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"JamBase API error: {response.status_code}")
            return {"totalShows": 0, "events": []}
        
        data = response.json()
        
        # Filter by city
        city_events = []
        for e in data.get('events', []):
            location = e.get('location', {}).get('address', {})
            event_city = location.get('addressLocality', '').lower()
            
            if city.lower() in event_city:
                city_events.append(e)
        
        # Get 2 sample events for display
        sample_events = []
        for event in city_events[:2]:
            start_date = event.get('startDate', '')[:10]
            event_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
            days_diff = abs((event_date_obj - date_obj).days)
            
            sample_events.append({
                "name": event.get('name', 'Unknown Event'),
                "date": start_date,
                "daysDiff": days_diff
            })
        
        return {
            "totalShows": len(city_events),
            "events": sample_events
        }
        
    except Exception as e:
        print(f"JamBase API Error: {e}")
        return {"totalShows": 0, "events": []}
