"""
FastAPI Backend for Breast Cancer Classification Research Lab
Serves model metrics, experiment results, metadata, real-time predictions, and feature attributions.
"""

import os
import json
from typing import Dict, List, Optional
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

app = FastAPI(
    title="WDBC Breast Cancer Classification Research API",
    description="Medical machine learning research API serving model comparisons, bootstrap statistics, and inference.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_DIR = os.path.join(BASE_DIR, "results")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load precomputed experimental results
def load_json_artifact(filename: str):
    path = os.path.join(RESULTS_DIR, filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {}

experiment_summary = load_json_artifact("experiment_summary.json")
dataset_stats = load_json_artifact("dataset_stats.json")
model_comparison = load_json_artifact("model_comparison.json")
bootstrap_ci = load_json_artifact("bootstrap_ci.json")
tuning_results = load_json_artifact("tuning_results.json")
shap_summary = load_json_artifact("shap_summary.json")

# Load model artifacts
best_model = None
scaler = None

try:
    best_model_path = os.path.join(MODELS_DIR, "best_tuned_model.joblib")
    if os.path.exists(best_model_path):
        best_model = joblib.load(best_model_path)
    
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
except Exception as e:
    print(f"Warning: Could not load model artifacts: {e}")

FEATURE_NAMES = dataset_stats.get("features", [])

class PredictionRequest(BaseModel):
    features: Dict[str, float]

    @field_validator("features")
    def validate_features_presence(cls, v):
        if not FEATURE_NAMES:
            return v
        missing = [f for f in FEATURE_NAMES if f not in v]
        if missing:
            raise ValueError(f"Missing {len(missing)} required features: {missing[:3]}...")
        return v

class PredictionResponse(BaseModel):
    predicted_class: str
    class_label: int
    is_malignant: bool
    malignant_probability: float
    benign_probability: float
    risk_tier: str
    model_name: str
    feature_count: int

class ExplanationRequest(BaseModel):
    features: Dict[str, float]

class FeatureAttribution(BaseModel):
    feature: str
    input_value: float
    attribution: float
    direction: str
    category: str

class ExplanationResponse(BaseModel):
    base_probability: float
    predicted_probability: float
    predicted_class: str
    top_attributions: List[FeatureAttribution]
    disclaimer: str

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "WDBC Research Platform API",
        "model_loaded": best_model is not None,
        "scaler_loaded": scaler is not None,
        "feature_count": len(FEATURE_NAMES),
        "version": "1.0.0"
    }

@app.get("/api/metrics")
def get_metrics():
    if not model_comparison:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model metrics unavailable")
    return {
        "model_comparison": model_comparison,
        "bootstrap_ci": bootstrap_ci,
        "winning_model": experiment_summary.get("winning_model", "Support Vector Machine")
    }

@app.get("/api/experiments")
def get_experiments():
    if not tuning_results:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Experiment results unavailable")
    return {
        "tuning": tuning_results,
        "metadata": experiment_summary.get("metadata", {}),
        "winning_model": experiment_summary.get("winning_model", "Support Vector Machine")
    }

@app.get("/api/features")
def get_features():
    if not dataset_stats:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Dataset statistics unavailable")
    return {
        "features": FEATURE_NAMES,
        "feature_stats": dataset_stats.get("feature_stats", {}),
        "class_distribution": dataset_stats.get("class_distribution", {}),
        "presets": dataset_stats.get("presets", {})
    }

@app.get("/api/shap")
def get_shap_summary():
    if not shap_summary:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="SHAP data unavailable")
    return shap_summary

@app.post("/api/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if best_model is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model is not loaded")
    
    try:
        input_vector = np.array([request.features[f] for f in FEATURE_NAMES]).reshape(1, -1)
        prob = float(best_model.predict_proba(input_vector)[0, 1])
        pred_label = int(best_model.predict(input_vector)[0])
        
        prob_mal = round(prob, 4)
        prob_ben = round(1.0 - prob, 4)
        
        if prob_mal >= 0.70:
            risk_tier = "High Probability of Malignancy"
        elif prob_mal >= 0.40:
            risk_tier = "Borderline / Indeterminate Risk"
        else:
            risk_tier = "Low Probability of Malignancy"
            
        return PredictionResponse(
            predicted_class="Malignant" if pred_label == 1 else "Benign",
            class_label=pred_label,
            is_malignant=bool(pred_label == 1),
            malignant_probability=prob_mal,
            benign_probability=prob_ben,
            risk_tier=risk_tier,
            model_name=experiment_summary.get("winning_model", "Tuned SVM (RBF)"),
            feature_count=len(FEATURE_NAMES)
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inference failure: verify input values")

@app.post("/api/explain", response_model=ExplanationResponse)
def explain(request: ExplanationRequest):
    if best_model is None or not dataset_stats:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model or metadata not ready")
        
    try:
        input_vector = np.array([request.features.get(f, 0.0) for f in FEATURE_NAMES]).reshape(1, -1)
        prob = float(best_model.predict_proba(input_vector)[0, 1])
        pred_label = "Malignant" if prob >= 0.5 else "Benign"
        
        # Local feature attribution calculation
        # For each feature, compute relative deviation from overall median scaled by feature importance
        top_shap_features = {item["feature_name"]: item["mean_abs_shap"] for item in shap_summary.get("top_features", [])}
        all_stats = dataset_stats.get("feature_stats", {})
        
        attributions = []
        for f in FEATURE_NAMES:
            val = float(request.features.get(f, 0.0))
            stat = all_stats.get(f, {}).get("overall", {})
            f_median = stat.get("median", val)
            f_std = stat.get("std", 1.0) if stat.get("std", 1.0) != 0 else 1.0
            
            z_score = (val - f_median) / f_std
            importance_weight = top_shap_features.get(f, 0.05)
            # Higher z-score for morphological features generally correlates with malignancy
            attr_val = round(float(z_score * importance_weight), 4)
            
            group_name = all_stats.get(f, {}).get("category", "General")
            
            attributions.append(FeatureAttribution(
                feature=f,
                input_value=round(val, 4),
                attribution=attr_val,
                direction="Toward Malignant" if attr_val > 0 else "Toward Benign",
                category=group_name
            ))
            
        # Sort by absolute attribution magnitude
        attributions.sort(key=lambda x: abs(x.attribution), reverse=True)
        
        return ExplanationResponse(
            base_probability=0.3726, # Baseline malignant prior in WDBC
            predicted_probability=round(prob, 4),
            predicted_class=pred_label,
            top_attributions=attributions[:10],
            disclaimer="Attributions quantify feature divergence from population baseline weighted by model sensitivity. For research purposes only."
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Explanation calculation failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
