import numpy as np

def build_features(venue, date_obj, weather, cm_data, venues, feature_list, imputer):
    """
    Build enhanced feature vector with all engineered features from training.
    Returns:
      - X: 2D numpy array for model.predict()
      - row: raw feature dict (sent back to frontend)
      - capacity: venue capacity for fillrate conversion
    """
    
    # Basic features
    dayofweek = date_obj.weekday()
    
    # Time features
    month = date_obj.month
    season = month % 12 // 3  # 0=winter, 1=spring, 2=summer, 3=fall
    is_holiday_season = 1 if month in [11, 12] else 0
    
    # Capacity features
    capacity = venues[venue]["capacity"]
    log_capacity = np.log1p(capacity)
    
    # Artist popularity tier
    spotify_followers = cm_data.get("spotify_followers") or 0
    if spotify_followers <= 1000:
        spotify_tier = 0
    elif spotify_followers <= 10000:
        spotify_tier = 1
    elif spotify_followers <= 100000:
        spotify_tier = 2
    else:
        spotify_tier = 3
    
    # Social media engagement score
    social_score = (
        (cm_data.get("spotify_followers") or 0) * 0.4 +
        (cm_data.get("instagram_total_followers") or 0) * 0.3 +
        (cm_data.get("tiktok_total_followers") or 0) * 0.3
    )
    log_social_score = np.log1p(social_score)
    
    # Weather risk (calculate from weather data)
    if weather:
        precip = weather.get("precip_mm") or 0
        snow = weather.get("snow_mm") or 0
        # Simple risk score: 0-10 scale
        weather_risk = min(10, int((precip / 10) + (snow / 5)))
    else:
        weather_risk = 0
    
    high_weather_risk = 1 if weather_risk >= 5 else 0
    
    # Bad weather flag
    bad_weather_flag = 1 if (weather and (weather.get("precip_mm", 0) > 5)) else 0
    
    # Missing data flags
    ticket_price = cm_data.get("avg_ticket_price")
    has_price_data = 1 if ticket_price else 0
    has_social_data = 1 if spotify_followers > 0 else 0
    
    # Price ratio
    price_per_capacity = ticket_price / capacity if ticket_price else None
    
    # Build feature dictionary
    row = {
        # Original features
        "Ticket price": ticket_price,
        "Solo or multiple": 1,
        "Day": dayofweek,
        "latitude": venues[venue]["coords"][0],
        "longitude": venues[venue]["coords"][1],
        
        # Weather features
        "temperature": weather.get("temperature") if weather else None,
        "feels_like_temp": weather.get("feels_like") if weather else None,
        "temp_min": weather.get("temp_min") if weather else None,
        "temp_max": weather.get("temp_max") if weather else None,
        "precipitation_mm": weather.get("precip_mm") if weather else None,
        "snow_mm": weather.get("snow_mm") if weather else None,
        "wind_speed": weather.get("windspeed") if weather else None,
        "humidity": weather.get("humidity") if weather else None,
        "pressure": weather.get("pressure") if weather else None,
        "visibility": weather.get("visibility") if weather else None,
        "cloudiness": weather.get("cloudcover") if weather else None,
        "bad_weather_flag": bad_weather_flag,
        "weather_risk_score": weather_risk,
        
        # Chartmetric features
        "artist_id": cm_data.get("artist_id"),
        "cm_artist_score": cm_data.get("cm_artist_score"),
        "cm_artist_rank": cm_data.get("cm_artist_rank"),
        "spotify_followers": spotify_followers,
        "spotify_monthly_listeners": cm_data.get("spotify_monthly_listeners"),
        "youtube_total_subscribers": cm_data.get("youtube_total_subscribers"),
        "tiktok_total_followers": cm_data.get("tiktok_total_followers"),
        "instagram_total_followers": cm_data.get("instagram_total_followers"),
        "instagram_engagement_rate": cm_data.get("instagram_engagement_rate"),
        "albums_count": cm_data.get("albums_count"),
        "tracks_count": cm_data.get("tracks_count"),
        "events_count": cm_data.get("events_count"),
        "riaa_awards_count": cm_data.get("riaa_awards_count"),
        
        # Price features
        "avg_ticket_price": cm_data.get("avg_ticket_price"),
        "min_ticket_price": cm_data.get("min_ticket_price"),
        "max_ticket_price": cm_data.get("max_ticket_price"),
        
        # NEW ENGINEERED FEATURES
        "month": month,
        "season": season,
        "is_holiday_season": is_holiday_season,
        "log_capacity": log_capacity,
        "spotify_tier": spotify_tier,
        "price_per_capacity": price_per_capacity,
        "log_social_score": log_social_score,
        "high_weather_risk": high_weather_risk,
        "has_price_data": has_price_data,
        "has_social_data": has_social_data,
    }
    
    # Build X in correct order matching training
    X = np.array([row.get(f) for f in feature_list]).reshape(1, -1)
    
    # Impute missing values using KNN imputer
    X = imputer.transform(X)
    
    return X, row, capacity
