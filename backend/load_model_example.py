import joblib
import json
import pandas as pd

# ─── Cách load lại model ──────────────────────────────────────────────────────

# 1. Load model (toàn bộ pipeline gồm preprocessor + classifier)
model = joblib.load("artifacts/model.pkl")

# 2. Load preprocessor riêng (dùng để lấy feature names)
preprocessor = joblib.load("artifacts/preprocessor.pkl")

# 3. Load metadata để kiểm tra version
with open("artifacts/metadata.json", "r", encoding="utf-8") as f:
    metadata = json.load(f)

print(f"Model version : {metadata['model_version']}")
print(f"Data version  : {metadata['data_version']}")
print(f"Best model    : {metadata['best_model']}")
print(f"Trained at    : {metadata['trained_at']}")

# ─── Predict thử ──────────────────────────────────────────────────────────────
# Tên cột phải khớp với X mà pipeline đã train
sample = pd.DataFrame([{
    "Pclass":   1,
    "Sex":      "female",
    "Age":      38,
    "SibSp":    1,
    "Parch":    0,
    "Fare":     71.28,
    "Embarked": "C",
}])

survived    = model.predict(sample)[0]
probability = model.predict_proba(sample)[0][1]

print(f"\nKết quả dự đoán:")
print(f"  Survived    : {survived} ({'Sống sót' if survived else 'Không sống sót'})")
print(f"  Probability : {probability:.4f} ({probability*100:.1f}%)")