import numpy as np

def build_features(venue, date_obj, weather, cm_data, venues, feature_list, imputer):
    """
    Build a feature vector for the ML model.
    Returns:
      - X: 2D numpy array for model.predict()
      - row: raw feature dict (sent back to frontend)
    """

    dayofweek = date_obj.weekday()
    weekend = 1 if dayofweek >= 5 else 0

    row = {
        "capacity": venues[venue]["capacity"],
        "dayofweek": dayofweek,
        "weekend": weekend,

        # Weather
        "temperature": weather.get("temperature") if weather else None,
        "humidity": weather.get("humidity") if weather else None,

        # Chartmetric Features
        "cm_artist_score": cm_data.get("cm_artist_score") if cm_data else None,
        "spotify_followers": cm_data.get("spotify_followers") if cm_data else None,
        "spotify_monthly_listeners": cm_data.get("spotify_monthly_listeners") if cm_data else None,
        "youtube_total_subscribers": cm_data.get("youtube_total_subscribers") if cm_data else None,
        "tiktok_total_followers": cm_data.get("tiktok_total_followers") if cm_data else None,
        "instagram_total_followers": cm_data.get("instagram_total_followers") if cm_data else None,
        "instagram_engagement_rate": cm_data.get("instagram_engagement_rate") if cm_data else None,

        # Artist Catalog
        "albums_count": cm_data.get("albums_count") if cm_data else None,
        "tracks_count": cm_data.get("tracks_count") if cm_data else None,
        "events_count": cm_data.get("events_count") if cm_data else None,
        "riaa_awards_count": cm_data.get("riaa_awards_count") if cm_data else None,

        # Manual historical avg placeholders (unused but kept for consistency)
        "avg_ticket_price": None,
        "min_ticket_price": None,
        "max_ticket_price": None,
    }

    # Build X in correct order
    X = np.array([row.get(f) for f in feature_list]).reshape(1, -1)

    # Impute missing values
    X = imputer.transform(X)

    return X, row
