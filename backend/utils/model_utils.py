import joblib
import os

# -----------------------------
# Model Artifact Paths
# -----------------------------
MODEL_DIR = "model"
MODEL_FILE = os.path.join(MODEL_DIR, "final_xgb_model.pkl")
IMPUTER_FILE = os.path.join(MODEL_DIR, "final_imputer.pkl")
FEATURES_FILE = os.path.join(MODEL_DIR, "final_feature_cols.pkl")

# -----------------------------
# Load All ML Artifacts
# -----------------------------
def load_model():
    """
    Loads XGB model, imputer, and feature column list.
    Runs once at FastAPI startup (not on every request).
    """

    if not os.path.exists(MODEL_FILE):
        raise FileNotFoundError("final_xgb_model.pkl missing inside /model")

    if not os.path.exists(IMPUTER_FILE):
        raise FileNotFoundError("final_imputer.pkl missing inside /model")

    if not os.path.exists(FEATURES_FILE):
        raise FileNotFoundError("final_feature_cols.pkl missing inside /model")

    model = joblib.load(MODEL_FILE)
    imputer = joblib.load(IMPUTER_FILE)
    feature_list = joblib.load(FEATURES_FILE)

    # Safety fix — ensure target column isn't in features
    if "Ticket price" in feature_list:
        feature_list = [f for f in feature_list if f != "Ticket price"]

    return {
        "model": model,
        "imputer": imputer,
        "features": feature_list,
    }
