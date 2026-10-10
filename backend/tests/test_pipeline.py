"""
Automated Test Suite for WDBC ML Research Platform
Validates dataset loading, metrics, model persistence, and FastAPI endpoints.
"""

import os
import json
import numpy as np
from fastapi.testclient import TestClient

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app, load_json_artifact
from src.loader import load_wdbc_data, get_class_proportions
from src.evaluation import compute_metrics

client = TestClient(app)

def test_dataset_loading_and_class_mapping():
    X_train, X_test, y_train, y_test, feature_names = load_wdbc_data()
    assert len(feature_names) == 30
    assert X_train.shape[0] == 455
    assert X_test.shape[0] == 114
    # Malignant (positive) must be 1, Benign must be 0
    props = get_class_proportions(y_train)
    assert props["total"] == 455
    assert props["malignant_count"] > 0
    assert props["benign_count"] > 0
    # Malignant positive class percentage should match ~37%
    assert 35.0 <= props["malignant_pct"] <= 40.0

def test_metrics_calculation():
    y_true = np.array([1, 1, 0, 0])
    y_pred = np.array([1, 0, 0, 0])
    y_prob = np.array([0.9, 0.4, 0.1, 0.2])
    m = compute_metrics(y_true, y_pred, y_prob)
    assert m["accuracy"] == 0.75
    assert m["recall"] == 0.5
    assert m["specificity"] == 1.0
    assert m["precision"] == 1.0
    assert m["roc_auc"] == 1.0

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["feature_count"] == 30

def test_api_metrics_endpoint():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "model_comparison" in data
    assert "bootstrap_ci" in data
    assert data["winning_model"] == "Support Vector Machine"

def test_api_predict_benign_preset():
    features_res = client.get("/api/features")
    assert features_res.status_code == 200
    presets = features_res.json()["presets"]
    benign_sample = presets["typical_benign"]

    pred_res = client.post("/api/predict", json={"features": benign_sample})
    assert pred_res.status_code == 200
    data = pred_res.json()
    assert data["predicted_class"] == "Benign"
    assert data["is_malignant"] is False
    assert data["class_label"] == 0
    assert data["benign_probability"] > 0.8

def test_api_predict_malignant_preset():
    features_res = client.get("/api/features")
    presets = features_res.json()["presets"]
    mal_sample = presets["typical_malignant"]

    pred_res = client.post("/api/predict", json={"features": mal_sample})
    assert pred_res.status_code == 200
    data = pred_res.json()
    assert data["predicted_class"] == "Malignant"
    assert data["is_malignant"] is True
    assert data["class_label"] == 1
    assert data["malignant_probability"] > 0.8

def test_api_explain():
    features_res = client.get("/api/features")
    presets = features_res.json()["presets"]
    mal_sample = presets["typical_malignant"]

    exp_res = client.post("/api/explain", json={"features": mal_sample})
    assert exp_res.status_code == 200
    data = exp_res.json()
    assert len(data["top_attributions"]) > 0
    assert data["predicted_class"] == "Malignant"

if __name__ == "__main__":
    print("Running automated test suite...")
    test_dataset_loading_and_class_mapping()
    print("[PASS] Dataset loading and positive class mapping passed")
    test_metrics_calculation()
    print("[PASS] Metric calculation formulas passed")
    test_api_health()
    print("[PASS] Health check passed")
    test_api_metrics_endpoint()
    print("[PASS] Metrics API endpoint passed")
    test_api_predict_benign_preset()
    print("[PASS] Predict benign preset passed")
    test_api_predict_malignant_preset()
    print("[PASS] Predict malignant preset passed")
    test_api_explain()
    print("[PASS] Explain SHAP attributions passed")
    print("ALL TESTS PASSED SUCCESSFULLY!")
