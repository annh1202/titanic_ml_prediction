import joblib
import pandas as pd
import numpy as np
import os

MODEL_PATH        = os.getenv("MODEL_PATH",        "artifacts/model.pkl")
PREPROCESSOR_PATH = os.getenv("PREPROCESSOR_PATH", "artifacts/preprocessor.pkl")

# Load model khi server khởi động
try:
    model        = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    MODEL_LOADED = True
    print("Model loaded successfully")
except (FileNotFoundError, EOFError, Exception) as e:
    model = preprocessor = None
    MODEL_LOADED = False
    print(f"Cannot load model: {e}")


def predict_survival(pclass: int, sex: str, age: float,
                     sibsp: int, parch: int, fare: float,
                     embarked: str) -> tuple[int, float]:
    """
    Nhận input của 1 hành khách, trả về (survived: 0|1, probability: float).
    Pipeline trong model.pkl đã bao gồm preprocessor nên truyền raw data vào thẳng.
    """
    if not MODEL_LOADED:
        raise RuntimeError("Model chưa được load. Chạy pipeline.py trước.")

    # Tên cột phải khớp với X mà pipeline.py đã train
    df = pd.DataFrame([{
        "Pclass":   pclass,
        "Name":     "Unknown",
        "Sex":      sex,
        "Age":      age,
        "SibSp":    sibsp,
        "Parch":    parch,
        "Fare":     fare,
        "Embarked": embarked,
    }])

    survived    = int(model.predict(df)[0])
    probability = float(model.predict_proba(df)[0][1])
    return survived, probability


def get_model_info() -> dict:
    """Trả về metadata của model đang chạy."""
    if not MODEL_LOADED:
        raise RuntimeError("Model chưa được load.")

    info = {
        "model_type": type(model.named_steps.get(
            list(model.named_steps.keys())[-1]   # bước cuối của pipeline = classifier
        )).__name__,
        "features": ["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked"],
        "output": {"0": "Không sống sót", "1": "Sống sót"},
    }

    # Lấy bước classifier từ pipeline
    classifier = list(model.named_steps.values())[-1]

    if hasattr(classifier, "n_estimators"):
        info["n_estimators"] = classifier.n_estimators

    if hasattr(classifier, "feature_importances_"):
        # Lấy tên feature sau khi qua ColumnTransformer
        try:
            ct = model.named_steps["preprocessor"]
            feature_names = ct.get_feature_names_out()
        except Exception:
            feature_names = [f"feature_{i}" for i in range(len(classifier.feature_importances_))]

        info["feature_importances"] = {
            name: round(float(imp), 4)
            for name, imp in zip(feature_names, classifier.feature_importances_)
        }

    return info