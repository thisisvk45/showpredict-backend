import joblib
import json
import os

# Model artifact paths
MODEL_DIR = "model"
CATBOOST_FILE = os.path.join(MODEL_DIR, "final_catboost_model.pkl")
LIGHTGBM_FILE = os.path.join(MODEL_DIR, "final_lightgbm_model.pkl")
XGBOOST_FILE = os.path.join(MODEL_DIR, "final_xgboost_model.pkl")
IMPUTER_FILE = os.path.join(MODEL_DIR, "final_imputer.pkl")
FEATURES_FILE = os.path.join(MODEL_DIR, "final_feature_cols.pkl")
WEIGHTS_FILE = os.path.join(MODEL_DIR, "ensemble_weights.json")

def load_model():
    """
    Load ensemble models, imputer, feature columns, and weights.
    Runs once at FastAPI startup.
    """
    
    # Check all files exist
    required_files = {
        "CatBoost": CATBOOST_FILE,
        "LightGBM": LIGHTGBM_FILE,
        "XGBoost": XGBOOST_FILE,
        "Imputer": IMPUTER_FILE,
        "Features": FEATURES_FILE,
        "Weights": WEIGHTS_FILE
    }
    
    for name, file in required_files.items():
        if not os.path.exists(file):
            raise FileNotFoundError(f"Missing {name} file: {file}")
    
    # Load models
    catboost_model = joblib.load(CATBOOST_FILE)
    lightgbm_model = joblib.load(LIGHTGBM_FILE)
    xgboost_model = joblib.load(XGBOOST_FILE)
    
    # Load imputer and features
    imputer = joblib.load(IMPUTER_FILE)
    feature_list = joblib.load(FEATURES_FILE)
    
    # Load ensemble weights
    with open(WEIGHTS_FILE, 'r') as f:
        weights = json.load(f)
    
    return {
        "catboost": catboost_model,
        "lightgbm": lightgbm_model,
        "xgboost": xgboost_model,
        "imputer": imputer,
        "features": feature_list,
        "weights": weights
    }
