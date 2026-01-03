import requests
from datetime import datetime, timedelta

API_KEY = "f360dd73-1747-4cff-ae2f-22dd2db4e677"
BASE_URL = "https://www.jambase.com/jb-api/v1/events"

def get_competing_events(city, state, date_str, days=7):
    """
    Fetch competing events from JamBase API for a specific city within a date range.
    
    Args:
        city: City name (e.g., "Durham")
        state: State code (e.g., "NC")
        date_str: Start date in YYYY-MM-DD format
        days: Number of days to search (default 7)
    
    Returns:
        Dict with totalShows and list of event details including genre
    """
    
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        end_date = date_obj + timedelta(days=days)
        
        params = {
            "apikey": API_KEY,
            "geoStateIso": f"US-{state.upper()}",
            "eventDateFrom": date_str,
            "eventDateTo": end_date.strftime("%Y-%m-%d"),
            "perPage": 100
        }
        
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"JamBase API error: {response.status_code}")
            return {"totalShows": 0, "events": []}
        
        data = response.json()
        
        # Filter events by city
        city_events = []
        for event in data.get('events', []):
            location = event.get('location', {})
            address = location.get('address', {})
            event_city = address.get('addressLocality', '').lower()
            
            if city.lower() in event_city:
                city_events.append(event)
        
        # Get 2 sample events for display
        sample_events = []
        for event in city_events[:2]:
            start_date = event.get('startDate', '')[:10]
            event_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
            days_diff = abs((event_date_obj - date_obj).days)
            
            # Extract genre from performers
            genre = "Various"
            performers = event.get('performer', [])
            if performers and len(performers) > 0:
                # Get genres from first (headliner) performer
                headliner_genres = performers[0].get('genre', [])
                if headliner_genres:
                    # Join all genres with comma
                    genre = ", ".join(headliner_genres)
            
            sample_events.append({
                "name": event.get('name'),
                "date": start_date,
                "daysDiff": days_diff,
                "genre": genre  # NEW: Added genre field
            })
        
        return {
            "totalShows": len(city_events),
            "events": sample_events
        }
        
    except Exception as e:
        print(f"Error fetching JamBase data: {e}")
        return {"totalShows": 0, "events": []}
