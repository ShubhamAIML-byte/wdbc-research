"""
Dataset loader and preprocessor for Wisconsin Diagnostic Breast Cancer (WDBC) dataset.
"""

from typing import Tuple, Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

def load_wdbc_data(test_size: float = 0.20, random_state: int = 42) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[str]]:
    """
    Loads WDBC dataset and maps target so Malignant = 1 (positive class) and Benign = 0.
    Returns (X_train, X_test, y_train, y_test, feature_names).
    """
    data = load_breast_cancer()
    feature_names = list(data.feature_names)
    X = data.data
    # Map raw targets: in sklearn, 0 is malignant and 1 is benign
    y = (data.target == 0).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    return X_train, X_test, y_train, y_test, feature_names

def get_class_proportions(y: np.ndarray) -> Dict[str, Any]:
    n_total = len(y)
    n_pos = int(np.sum(y == 1))
    n_neg = int(np.sum(y == 0))
    return {
        "total": n_total,
        "malignant_count": n_pos,
        "malignant_pct": round(n_pos / n_total * 100, 2),
        "benign_count": n_neg,
        "benign_pct": round(n_neg / n_total * 100, 2),
    }
