"""
Machine learning model factory for WDBC benchmark.
"""

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

def get_candidate_models(random_state: int = 42):
    """
    Returns baseline model dictionary: Random Forest, SVM (RBF kernel with scaler), and XGBoost.
    """
    return {
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            random_state=random_state
        ),
        "Support Vector Machine": Pipeline([
            ("scaler", StandardScaler()),
            ("svm", SVC(kernel="rbf", probability=True, random_state=random_state))
        ]),
        "XGBoost": XGBClassifier(
            n_estimators=100,
            random_state=random_state,
            eval_metric="logloss"
        )
    }
