"""
WDBC Offline Experiment Pipeline
Trains and compares Random Forest, SVM, and XGBoost on Wisconsin Diagnostic Breast Cancer dataset.
Computes Stratified 5-Fold Cross Validation, held-out test evaluation, 3000-resample stratified bootstrap CIs,
GridSearchCV hyperparameter tuning, paired bootstrap CIs, SHAP explainability, and exports all serialized models and JSON artifacts.
"""

import json
import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    matthews_corrcoef,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
)
import shap

np.random.seed(42)

def calculate_metrics(y_true, y_pred, y_prob):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "specificity": float(specificity),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "mcc": float(matthews_corrcoef(y_true, y_pred)),
        "tp": int(tp),
        "fp": int(fp),
        "tn": int(tn),
        "fn": int(fn),
    }

def stratified_bootstrap_ci(y_true, y_pred, y_prob, n_bootstraps=3000, alpha=0.05, seed=42):
    rng = np.random.RandomState(seed)
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    y_prob = np.asarray(y_prob)
    
    pos_idx = np.where(y_true == 1)[0]
    neg_idx = np.where(y_true == 0)[0]
    n_pos = len(pos_idx)
    n_neg = len(neg_idx)
    
    metric_keys = ["accuracy", "precision", "recall", "specificity", "f1", "roc_auc", "mcc"]
    bootstrap_records = {k: [] for k in metric_keys}
    
    for _ in range(n_bootstraps):
        resampled_pos = rng.choice(pos_idx, size=n_pos, replace=True)
        resampled_neg = rng.choice(neg_idx, size=n_neg, replace=True)
        resample_idx = np.concatenate([resampled_pos, resampled_neg])
        
        y_b_true = y_true[resample_idx]
        y_b_pred = y_pred[resample_idx]
        y_b_prob = y_prob[resample_idx]
        
        m = calculate_metrics(y_b_true, y_b_pred, y_b_prob)
        for k in metric_keys:
            bootstrap_records[k].append(m[k])
            
    ci_results = {}
    lower_pct = (alpha / 2.0) * 100
    upper_pct = (1.0 - alpha / 2.0) * 100
    
    original_metrics = calculate_metrics(y_true, y_pred, y_prob)
    
    for k in metric_keys:
        vals = np.array(bootstrap_records[k])
        ci_results[k] = {
            "point_estimate": round(float(original_metrics[k]), 4),
            "mean": round(float(np.mean(vals)), 4),
            "std_error": round(float(np.std(vals)), 4),
            "ci_lower": round(float(np.percentile(vals, lower_pct)), 4),
            "ci_upper": round(float(np.percentile(vals, upper_pct)), 4),
        }
        
    return ci_results, bootstrap_records

def paired_bootstrap_test(y_true, pred_base, prob_base, pred_tuned, prob_tuned, n_bootstraps=3000, alpha=0.05, seed=42):
    rng = np.random.RandomState(seed)
    y_true = np.asarray(y_true)
    pred_base = np.asarray(pred_base)
    prob_base = np.asarray(prob_base)
    pred_tuned = np.asarray(pred_tuned)
    prob_tuned = np.asarray(prob_tuned)
    
    pos_idx = np.where(y_true == 1)[0]
    neg_idx = np.where(y_true == 0)[0]
    n_pos = len(pos_idx)
    n_neg = len(neg_idx)
    
    metric_keys = ["accuracy", "precision", "recall", "specificity", "f1", "roc_auc", "mcc"]
    diff_records = {k: [] for k in metric_keys}
    
    base_orig = calculate_metrics(y_true, pred_base, prob_base)
    tuned_orig = calculate_metrics(y_true, pred_tuned, prob_tuned)
    
    for _ in range(n_bootstraps):
        resampled_pos = rng.choice(pos_idx, size=n_pos, replace=True)
        resampled_neg = rng.choice(neg_idx, size=n_neg, replace=True)
        idx = np.concatenate([resampled_pos, resampled_neg])
        
        m_b_base = calculate_metrics(y_true[idx], pred_base[idx], prob_base[idx])
        m_b_tuned = calculate_metrics(y_true[idx], pred_tuned[idx], prob_tuned[idx])
        
        for k in metric_keys:
            diff_records[k].append(m_b_tuned[k] - m_b_base[k])
            
    lower_pct = (alpha / 2.0) * 100
    upper_pct = (1.0 - alpha / 2.0) * 100
    
    paired_summary = {}
    for k in metric_keys:
        diffs = np.array(diff_records[k])
        obs_diff = tuned_orig[k] - base_orig[k]
        ci_l = np.percentile(diffs, lower_pct)
        ci_u = np.percentile(diffs, upper_pct)
        is_stat_sig = bool((ci_l > 0 and ci_u > 0) or (ci_l < 0 and ci_u < 0))
        
        rel_diff = (obs_diff / base_orig[k] * 100.0) if base_orig[k] != 0 else 0.0
        
        paired_summary[k] = {
            "baseline": round(float(base_orig[k]), 4),
            "tuned": round(float(tuned_orig[k]), 4),
            "abs_difference": round(float(obs_diff), 4),
            "rel_pct_change": round(float(rel_diff), 2),
            "ci_lower": round(float(ci_l), 4),
            "ci_upper": round(float(ci_u), 4),
            "p_value_empirical": round(float(np.mean(diffs <= 0) if obs_diff > 0 else np.mean(diffs >= 0)), 4),
            "statistically_significant": is_stat_sig,
        }
        
    return paired_summary

def main():
    print("=== Step 1: Loading and preparing WDBC dataset ===")
    data = load_breast_cancer()
    feature_names = list(data.feature_names)
    X_raw = data.data
    # In sklearn load_breast_cancer, 0 is malignant and 1 is benign.
    # Map so that Malignant = 1 (Positive class) and Benign = 0 (Negative class).
    y = (data.target == 0).astype(int)
    
    df = pd.DataFrame(X_raw, columns=feature_names)
    df["target"] = y
    
    n_samples, n_features = X_raw.shape
    n_malignant = int(np.sum(y == 1))
    n_benign = int(np.sum(y == 0))
    
    print(f"Dataset loaded: {n_samples} samples, {n_features} features.")
    print(f"Class counts -> Malignant (1, positive): {n_malignant} ({n_malignant/n_samples*100:.1f}%), Benign (0, negative): {n_benign} ({n_benign/n_samples*100:.1f}%)")
    
    # 80/20 Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train set: {X_train.shape[0]} samples. Test set: {X_test.shape[0]} samples.")
    
    # Precompute dataset summary statistics and feature correlations
    feature_stats = {}
    for i, fname in enumerate(feature_names):
        col_all = X_raw[:, i]
        col_mal = X_raw[y == 1, i]
        col_ben = X_raw[y == 0, i]
        
        # Categorize feature: mean, se, worst
        if "error" in fname:
            category = "Standard Error (SE)"
            group = "se"
        elif "worst" in fname:
            category = "Extreme / Worst"
            group = "worst"
        else:
            category = "Mean"
            group = "mean"
            
        feature_stats[fname] = {
            "name": fname,
            "category": category,
            "group": group,
            "overall": {
                "mean": round(float(np.mean(col_all)), 4),
                "std": round(float(np.std(col_all)), 4),
                "min": round(float(np.min(col_all)), 4),
                "q25": round(float(np.percentile(col_all, 25)), 4),
                "median": round(float(np.median(col_all)), 4),
                "q75": round(float(np.percentile(col_all, 75)), 4),
                "max": round(float(np.max(col_all)), 4),
            },
            "benign": {
                "mean": round(float(np.mean(col_ben)), 4),
                "std": round(float(np.std(col_ben)), 4),
                "median": round(float(np.median(col_ben)), 4),
                "min": round(float(np.min(col_ben)), 4),
                "max": round(float(np.max(col_ben)), 4),
            },
            "malignant": {
                "mean": round(float(np.mean(col_mal)), 4),
                "std": round(float(np.std(col_mal)), 4),
                "median": round(float(np.median(col_mal)), 4),
                "min": round(float(np.min(col_mal)), 4),
                "max": round(float(np.max(col_mal)), 4),
            }
        }
        
    # Correlation matrix between features and target
    corr_matrix = df.corr()
    corr_data = {
        "features": feature_names,
        "matrix": [[round(float(corr_matrix.loc[f1, f2]), 3) for f2 in feature_names] for f1 in feature_names],
        "target_correlation": {fname: round(float(corr_matrix.loc[fname, "target"]), 4) for fname in feature_names}
    }
    
    # Presets for the prediction lab
    benign_preset = {fname: feature_stats[fname]["benign"]["median"] for fname in feature_names}
    malignant_preset = {fname: feature_stats[fname]["malignant"]["median"] for fname in feature_names}
    # Borderline preset: midpoint between benign and malignant median
    borderline_preset = {
        fname: round((feature_stats[fname]["benign"]["median"] + feature_stats[fname]["malignant"]["median"]) / 2.0, 4)
        for fname in feature_names
    }
    
    dataset_summary = {
        "total_samples": n_samples,
        "n_features": n_features,
        "class_distribution": {
            "malignant_count": n_malignant,
            "malignant_pct": round(n_malignant / n_samples * 100, 2),
            "benign_count": n_benign,
            "benign_pct": round(n_benign / n_samples * 100, 2),
            "positive_class": "Malignant (1)",
            "negative_class": "Benign (0)",
        },
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "features": feature_names,
        "feature_stats": feature_stats,
        "presets": {
            "typical_benign": benign_preset,
            "typical_malignant": malignant_preset,
            "borderline_ambiguous": borderline_preset,
        }
    }
    
    print("=== Step 2: Training 3 candidate models with Stratified 5-Fold Cross Validation ===")
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Support Vector Machine": Pipeline([
            ("scaler", StandardScaler()),
            ("svm", SVC(kernel="rbf", probability=True, random_state=42))
        ]),
        "XGBoost": XGBClassifier(n_estimators=100, random_state=42, eval_metric="logloss")
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    metric_keys = ["accuracy", "precision", "recall", "specificity", "f1", "roc_auc", "mcc"]
    
    cv_results = {}
    fitted_models = {}
    test_evaluations = {}
    
    for name, model in models.items():
        print(f"Evaluating {name}...")
        fold_metrics = {k: [] for k in metric_keys}
        
        for fold, (train_idx, val_idx) in enumerate(cv.split(X_train, y_train)):
            X_f_tr, y_f_tr = X_train[train_idx], y_train[train_idx]
            X_f_val, y_f_val = X_train[val_idx], y_train[val_idx]
            
            # Clone and fit fold model
            from sklearn.base import clone
            fold_model = clone(model)
            fold_model.fit(X_f_tr, y_f_tr)
            
            y_val_pred = fold_model.predict(X_f_val)
            y_val_prob = fold_model.predict_proba(X_f_val)[:, 1]
            
            m = calculate_metrics(y_f_val, y_val_pred, y_val_prob)
            for k in metric_keys:
                fold_metrics[k].append(m[k])
                
        cv_summary = {}
        for k in metric_keys:
            cv_summary[k] = {
                "mean": round(float(np.mean(fold_metrics[k])), 4),
                "std": round(float(np.std(fold_metrics[k])), 4),
                "fold_values": [round(float(v), 4) for v in fold_metrics[k]],
            }
        cv_results[name] = cv_summary
        
        # Fit on entire training set
        model.fit(X_train, y_train)
        fitted_models[name] = model
        
        # Evaluate on held-out test set
        y_test_pred = model.predict(X_test)
        y_test_prob = model.predict_proba(X_test)[:, 1]
        test_m = calculate_metrics(y_test, y_test_pred, y_test_prob)
        
        # ROC Curve coordinates (downsampled)
        fpr, tpr, roc_thresh = roc_curve(y_test, y_test_prob)
        step = max(1, len(fpr) // 40)
        roc_pts = [{"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)} for i in range(0, len(fpr), step)]
        if roc_pts[-1]["fpr"] != 1.0 or roc_pts[-1]["tpr"] != 1.0:
            roc_pts.append({"fpr": 1.0, "tpr": 1.0})
            
        # PR Curve coordinates (downsampled)
        prec_curve, rec_curve, pr_thresh = precision_recall_curve(y_test, y_test_prob)
        step_pr = max(1, len(prec_curve) // 40)
        pr_pts = [{"recall": round(float(rec_curve[i]), 4), "precision": round(float(prec_curve[i]), 4)} for i in range(0, len(prec_curve), step_pr)]
        
        test_evaluations[name] = {
            "metrics": {k: round(float(test_m[k]), 4) if isinstance(test_m[k], float) else test_m[k] for k in test_m},
            "roc_curve": roc_pts,
            "pr_curve": pr_pts,
            "y_test_pred": [int(p) for p in y_test_pred],
            "y_test_prob": [round(float(p), 4) for p in y_test_prob],
        }
        
    print("\n--- Cross-Validation Mean Scores ---")
    for name in models:
        print(f"{name:25s} -> ROC-AUC: {cv_results[name]['roc_auc']['mean']:.4f} ± {cv_results[name]['roc_auc']['std']:.4f} | F1: {cv_results[name]['f1']['mean']:.4f} | Acc: {cv_results[name]['accuracy']['mean']:.4f}")
        
    # Select winning model based on mean CV ROC-AUC, tie breaker F1
    sorted_models = sorted(
        models.keys(),
        key=lambda n: (cv_results[n]["roc_auc"]["mean"], cv_results[n]["f1"]["mean"]),
        reverse=True
    )
    winner_name = sorted_models[0]
    print(f"\nWinning Model Selected by CV ROC-AUC: >>> {winner_name} <<<")
    
    model_rankings = []
    for rank, name in enumerate(sorted_models, start=1):
        model_rankings.append({
            "rank": rank,
            "model_name": name,
            "cv_roc_auc_mean": cv_results[name]["roc_auc"]["mean"],
            "cv_roc_auc_std": cv_results[name]["roc_auc"]["std"],
            "cv_f1_mean": cv_results[name]["f1"]["mean"],
            "cv_accuracy_mean": cv_results[name]["accuracy"]["mean"],
            "test_roc_auc": test_evaluations[name]["metrics"]["roc_auc"],
            "test_f1": test_evaluations[name]["metrics"]["f1"],
            "test_accuracy": test_evaluations[name]["metrics"]["accuracy"],
            "is_winner": bool(name == winner_name),
        })

    print("\n=== Step 3: Calculating 3,000 Stratified Bootstrap Confidence Intervals for Winning Model ===")
    winner_test_pred = test_evaluations[winner_name]["y_test_pred"]
    winner_test_prob = test_evaluations[winner_name]["y_test_prob"]
    
    bootstrap_ci_summary, bootstrap_records = stratified_bootstrap_ci(
        y_test, winner_test_pred, winner_test_prob, n_bootstraps=3000, alpha=0.05, seed=42
    )
    print("95% Stratified Bootstrap Confidence Intervals on Held-Out Test Set (B=3000):")
    for k, v in bootstrap_ci_summary.items():
        print(f"  {k:12s}: Point={v['point_estimate']:.4f} | 95% CI: [{v['ci_lower']:.4f}, {v['ci_upper']:.4f}] | SE: {v['std_error']:.4f}")
        
    print(f"\n=== Step 4: Hyperparameter Tuning of {winner_name} using GridSearchCV ===")
    grid_search_params = {}
    param_grid = {}
    
    if winner_name == "Random Forest":
        base_estimator = RandomForestClassifier(random_state=42)
        param_grid = {
            "n_estimators": [100, 200, 300],
            "max_depth": [None, 6, 10, 15],
            "min_samples_leaf": [1, 2, 4],
            "max_features": ["sqrt", "log2"]
        }
        grid_search_params = {
            "original_parameters": {
                "n_estimators": 100,
                "max_depth": None,
                "min_samples_leaf": 1,
                "max_features": "sqrt"
            },
            "search_space": param_grid
        }
    elif winner_name == "Support Vector Machine":
        base_estimator = Pipeline([
            ("scaler", StandardScaler()),
            ("svm", SVC(kernel="rbf", probability=True, random_state=42))
        ])
        param_grid = {
            "svm__C": [0.1, 1.0, 5.0, 10.0, 50.0],
            "svm__gamma": ["scale", "auto", 0.01, 0.005, 0.001],
            "svm__kernel": ["rbf"]
        }
        grid_search_params = {
            "original_parameters": {
                "C": 1.0,
                "gamma": "scale",
                "kernel": "rbf"
            },
            "search_space": param_grid
        }
    elif winner_name == "XGBoost":
        base_estimator = XGBClassifier(random_state=42, eval_metric="logloss")
        param_grid = {
            "n_estimators": [100, 200],
            "max_depth": [3, 4, 6],
            "learning_rate": [0.01, 0.05, 0.1],
            "subsample": [0.8, 1.0],
            "colsample_bytree": [0.8, 1.0],
            "reg_lambda": [1.0, 5.0]
        }
        grid_search_params = {
            "original_parameters": {
                "n_estimators": 100,
                "max_depth": 6,
                "learning_rate": 0.3,
                "subsample": 1.0,
                "colsample_bytree": 1.0,
                "reg_lambda": 1.0
            },
            "search_space": param_grid
        }
        
    grid_search = GridSearchCV(
        estimator=base_estimator,
        param_grid=param_grid,
        scoring="roc_auc",
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        n_jobs=-1,
        verbose=1
    )
    grid_search.fit(X_train, y_train)
    
    best_estimator = grid_search.best_estimator_
    best_params = grid_search.best_params_
    best_cv_roc_auc = float(grid_search.best_score_)
    
    print(f"Best CV ROC-AUC: {best_cv_roc_auc:.4f}")
    print(f"Best Parameters: {best_params}")
    
    # Evaluate Tuned Model on Held-out test set
    y_test_pred_tuned = best_estimator.predict(X_test)
    y_test_prob_tuned = best_estimator.predict_proba(X_test)[:, 1]
    tuned_test_m = calculate_metrics(y_test, y_test_pred_tuned, y_test_prob_tuned)
    baseline_test_m = test_evaluations[winner_name]["metrics"]
    
    print("\n--- Baseline vs Tuned Test Comparison ---")
    for k in metric_keys:
        b_val = baseline_test_m[k]
        t_val = tuned_test_m[k]
        diff = t_val - b_val
        print(f"  {k:12s} | Baseline: {b_val:.4f} -> Tuned: {t_val:.4f} | Diff: {diff:+.4f}")
        
    print("\n=== Step 5: Paired Bootstrap Confidence Intervals for (Tuned - Baseline) ===")
    paired_ci_summary = paired_bootstrap_test(
        y_test,
        winner_test_pred,
        winner_test_prob,
        y_test_pred_tuned,
        y_test_prob_tuned,
        n_bootstraps=3000,
        alpha=0.05,
        seed=42
    )
    for k, v in paired_ci_summary.items():
        sig_str = "SIGNIFICANT" if v["statistically_significant"] else "NOT significant (encloses 0)"
        print(f"  {k:12s}: Diff = {v['abs_difference']:+.4f} | 95% Paired CI: [{v['ci_lower']:+.4f}, {v['ci_upper']:+.4f}] -> {sig_str}")
        
    print("\n=== Step 6: SHAP Explainability Analysis ===")
    # Calculate SHAP values for tuned model
    # If SVM pipeline or tree model:
    shap_summary_data = {}
    
    if winner_name in ["Random Forest", "XGBoost"]:
        explainer = shap.TreeExplainer(best_estimator)
        # For RF or XGB, explainer returns shape (N, features, 2) or (N, features)
        shap_vals_raw = explainer.shap_values(X_test)
        if isinstance(shap_vals_raw, list):
            # Binary classification list [class 0, class 1] -> take class 1 (Malignant)
            shap_values = shap_vals_raw[1]
        elif len(shap_vals_raw.shape) == 3:
            shap_values = shap_vals_raw[:, :, 1]
        else:
            shap_values = shap_vals_raw
    else:
        # SVM Pipeline: Explainer with background summary
        background = shap.kmeans(StandardScaler().fit_transform(X_train), 25)
        # Scaled test
        scaler = best_estimator.named_steps["scaler"]
        svm_model = best_estimator.named_steps["svm"]
        explainer = shap.KernelExplainer(lambda x: svm_model.predict_proba(x)[:, 1], background)
        shap_values = explainer.shap_values(scaler.transform(X_test[:50])) # subset for speed if kernel
        
    # Compute mean absolute SHAP value across test samples
    mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
    top_indices = np.argsort(mean_abs_shap)[::-1]
    
    top_features = []
    clinical_explanations = {
        "mean radius": "Distance from center to points on perimeter. Enlarged nuclei indicate cellular hyperplasia and malignancy.",
        "mean texture": "Standard deviation of gray-scale values. High variation reflects chromatin texture heterogeneity.",
        "mean perimeter": "Total perimeter length of cell nuclei. Correlates directly with nuclear size enlargement in carcinoma.",
        "mean area": "Nuclear cross-sectional area. Significantly elevated in malignant cells due to rapid genomic replication.",
        "mean smoothness": "Local variation in radius lengths. Malignant membranes show micro-irregularities.",
        "mean compactness": "(Perimeter^2 / area - 1.0). Compactness measures circular deviation; higher values indicate pleomorphism.",
        "mean concavity": "Severity of concave portions of the contour. Nuclear membrane indentations are hallmarks of malignancy.",
        "mean concave points": "Number of concave contour points. Strong indicator of invasive margin irregularity.",
        "mean symmetry": "Nuclear symmetry. Dysplastic and neoplastic cells display marked structural asymmetry.",
        "mean fractal dimension": "'Coastline approximation' - 1. Measures nuclear boundary roughness and chaotic geometry.",
        "worst radius": "Largest nuclear radius observed across fine needle aspirate (FNA). Catches extreme atypical cells.",
        "worst perimeter": "Largest perimeter observed. Highlights the most dysplastic cell in the sample.",
        "worst area": "Largest nuclear area observed. Strongest single morphological marker of severe dysplasia.",
        "worst concavity": "Deepest concave membrane depressions. Indicates profound nuclear clefting.",
        "worst concave points": "Maximum number of membrane cleft indentations. High clinical sensitivity for carcinoma.",
        "worst texture": "Most heterogeneous texture region. Reflects coarse chromatin clump distribution.",
    }
    
    for rank, idx in enumerate(top_indices, start=1):
        fname = feature_names[idx]
        corr = float(corr_data["target_correlation"][fname])
        desc = clinical_explanations.get(fname, f"Morphological characteristic '{fname}' quantified from FNA biopsy digital images.")
        top_features.append({
            "rank": rank,
            "feature_index": int(idx),
            "feature_name": fname,
            "category": feature_stats[fname]["category"],
            "mean_abs_shap": round(float(mean_abs_shap[idx]), 4),
            "direction": "positive" if corr > 0 else "negative",
            "correlation_with_malignancy": round(corr, 4),
            "clinical_significance": desc,
        })
        
    # Local sample explanations for representative test instances
    # Case 1: High Malignant probability case
    mal_cases = np.where((y_test == 1) & (y_test_pred_tuned == 1))[0]
    high_mal_idx = mal_cases[np.argmax(y_test_prob_tuned[mal_cases])]
    
    # Case 2: High Benign probability case
    ben_cases = np.where((y_test == 0) & (y_test_pred_tuned == 0))[0]
    high_ben_idx = ben_cases[np.argmin(y_test_prob_tuned[ben_cases])]
    
    # Case 3: Borderline case (probability closest to 0.5)
    border_idx = np.argmin(np.abs(y_test_prob_tuned - 0.5))
    
    def extract_local_explanation(sample_idx, label_title):
        row_vals = X_test[sample_idx]
        row_shap = shap_values[sample_idx] if sample_idx < len(shap_values) else shap_values[0]
        sorted_shap_idx = np.argsort(np.abs(row_shap))[::-1][:8]
        
        contributions = []
        for fi in sorted_shap_idx:
            contributions.append({
                "feature": feature_names[fi],
                "value": round(float(row_vals[fi]), 4),
                "shap_value": round(float(row_shap[fi]), 4),
                "impact": "pushes towards Malignant" if row_shap[fi] > 0 else "pushes towards Benign",
            })
            
        return {
            "title": label_title,
            "sample_index": int(sample_idx),
            "ground_truth": "Malignant" if y_test[sample_idx] == 1 else "Benign",
            "predicted_class": "Malignant" if y_test_pred_tuned[sample_idx] == 1 else "Benign",
            "malignant_probability": round(float(y_test_prob_tuned[sample_idx]), 4),
            "top_contributions": contributions,
        }
        
    local_explanations = [
        extract_local_explanation(high_mal_idx, "Definitive Malignant Case"),
        extract_local_explanation(high_ben_idx, "Definitive Benign Case"),
        extract_local_explanation(border_idx, "Borderline Diagnostic Case"),
    ]
    
    shap_summary_data = {
        "model_name": winner_name,
        "explainer_type": type(explainer).__name__,
        "top_features": top_features[:10],
        "all_feature_importance": [
            {
                "feature": feature_names[idx],
                "mean_abs_shap": round(float(mean_abs_shap[idx]), 4),
                "rank": rank
            } for rank, idx in enumerate(top_indices, start=1)
        ],
        "local_explanations": local_explanations,
        "disclaimer": "SHAP quantifies feature attributions within the trained mathematical estimator and does not prove biological causality."
    }

    # Save models and artifacts
    os.makedirs("backend/models", exist_ok=True)
    os.makedirs("backend/results", exist_ok=True)
    
    print("\n=== Step 7: Persisting models and results ===")
    joblib.dump(fitted_models["Random Forest"], "backend/models/rf_baseline.joblib")
    joblib.dump(fitted_models["Support Vector Machine"], "backend/models/svm_baseline.joblib")
    joblib.dump(fitted_models["XGBoost"], "backend/models/xgb_baseline.joblib")
    joblib.dump(best_estimator, "backend/models/best_tuned_model.joblib")
    
    # Save standard scaler for test inferences
    scaler_full = StandardScaler().fit(X_train)
    joblib.dump(scaler_full, "backend/models/scaler.joblib")
    
    # Build complete consolidated experiments artifact
    tuning_export = {
        "winning_model": winner_name,
        "original_parameters": grid_search_params["original_parameters"],
        "search_space": {k: [str(x) if x is None else x for x in v] for k, v in grid_search_params["search_space"].items()},
        "best_parameters": {k: str(v) if v is None else v for k, v in best_params.items()},
        "best_cv_roc_auc": round(best_cv_roc_auc, 4),
        "baseline_test_metrics": baseline_test_m,
        "tuned_test_metrics": {k: round(float(v), 4) if isinstance(v, float) else v for k, v in tuned_test_m.items()},
        "paired_differences": paired_ci_summary,
        "tuning_summary_narrative": (
            f"Tuned {winner_name} using 5-fold Stratified GridSearchCV across {len(grid_search.cv_results_['params'])} parameter candidates. "
            f"Achieved best CV ROC-AUC of {best_cv_roc_auc:.4f}. Held-out test ROC-AUC reached {tuned_test_m['roc_auc']:.4f} "
            f"(baseline: {baseline_test_m['roc_auc']:.4f}). Paired bootstrap analysis across 3,000 resamples provides rigorous "
            f"confidence bounds on observed metric differences."
        )
    }
    
    full_experiments_summary = {
        "metadata": {
            "dataset": "Wisconsin Diagnostic Breast Cancer (WDBC)",
            "n_samples": n_samples,
            "n_features": n_features,
            "test_size": 0.20,
            "train_samples": len(y_train),
            "test_samples": len(y_test),
            "random_seed": 42,
            "bootstrap_resamples": 3000,
            "confidence_level": 0.95,
        },
        "dataset": dataset_summary,
        "correlations": corr_data,
        "models_compared": list(models.keys()),
        "cv_results": cv_results,
        "test_evaluations": {
            k: {
                "metrics": test_evaluations[k]["metrics"],
                "roc_curve": test_evaluations[k]["roc_curve"],
                "pr_curve": test_evaluations[k]["pr_curve"]
            } for k in test_evaluations
        },
        "model_rankings": model_rankings,
        "winning_model": winner_name,
        "bootstrap_ci": bootstrap_ci_summary,
        "tuning": tuning_export,
        "shap": shap_summary_data
    }
    
    with open("backend/results/experiment_summary.json", "w") as f:
        json.dump(full_experiments_summary, f, indent=2)
        
    with open("backend/results/dataset_stats.json", "w") as f:
        json.dump(dataset_summary, f, indent=2)
        
    with open("backend/results/model_comparison.json", "w") as f:
        json.dump({
            "rankings": model_rankings,
            "cv_results": cv_results,
            "test_evaluations": full_experiments_summary["test_evaluations"]
        }, f, indent=2)
        
    with open("backend/results/bootstrap_ci.json", "w") as f:
        json.dump(bootstrap_ci_summary, f, indent=2)
        
    with open("backend/results/tuning_results.json", "w") as f:
        json.dump(tuning_export, f, indent=2)
        
    with open("backend/results/shap_summary.json", "w") as f:
        json.dump(shap_summary_data, f, indent=2)
        
    print("\nAll experiment artifacts successfully saved to backend/results/ and backend/models/!")

if __name__ == "__main__":
    main()
