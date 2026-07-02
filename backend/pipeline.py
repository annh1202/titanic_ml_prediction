import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from datetime import datetime
import joblib
import os
import json

# Load Titanic dataset
titanic_dataset = pd.read_csv("data/titanic.csv")
df = pd.DataFrame(titanic_dataset)

# Split column type
numeric_columns = ['Age', 'Fare', 'SibSp', 'Parch']
ordinal_columns = ['Pclass']
categorical_columns = ['Sex', 'Embarked']

# Transformer columns
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])
ordinal_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('ordinal', OrdinalEncoder(categories=[[1, 2, 3]]))
])
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(drop='first', handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('numeric', numeric_transformer, numeric_columns),
        ('ordinal', ordinal_transformer, ordinal_columns),
        ('categorical', categorical_transformer, categorical_columns)
    ],
    remainder='drop'
)

# Train multiple models
logistic_regression_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('logistic_regression', LogisticRegression())
])

random_forest_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('random_forest', RandomForestClassifier())
])

tree_decision_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('decision_tree', DecisionTreeClassifier())
])

svm_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('svm', SVC(probability=True))
])

X = df.drop(columns=['Survived'])
y = df['Survived']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

logistic_regression_pipeline.fit(X_train, y_train)
random_forest_pipeline.fit(X_train, y_train)
tree_decision_pipeline.fit(X_train, y_train)
svm_pipeline.fit(X_train, y_train)

# Compare model
logistic_regression_score = cross_val_score(logistic_regression_pipeline, X_train, y_train, cv=5)
random_forest_score = cross_val_score(random_forest_pipeline, X_train, y_train, cv=5)
tree_decision_score = cross_val_score(tree_decision_pipeline, X_train, y_train, cv=5)
svm_score = cross_val_score(svm_pipeline, X_train, y_train, cv=5)

print("Logistic Regression score:", logistic_regression_score)
print("Random Forest score:", random_forest_score)
print("Decision Tree score:", tree_decision_score)
print("SVM score:", svm_score)

print(f"Logistic Regression mean: {round(logistic_regression_score.mean()*100, 3)}%")
print(f"Random Forest mean: {round(random_forest_score.mean()*100, 3)}%")
print(f"Decision Tree mean: {round(tree_decision_score.mean()*100, 3)}%")
print(f"SVM mean: {round(svm_score.mean()*100, 3)}%")

# Predict
logistic_regression_prediction = logistic_regression_pipeline.predict(X_test)
random_forest_prediction = random_forest_pipeline.predict(X_test)
tree_decision_prediction = tree_decision_pipeline.predict(X_test)
svm_prediction = svm_pipeline.predict(X_test)

logistic_regression_accuracy = accuracy_score(logistic_regression_prediction, y_test)
print(f"Logistic Regression accuracy: {round(logistic_regression_accuracy*100, 3)}%")

random_forest_accuracy = accuracy_score(random_forest_prediction, y_test)
print(f"Random Forest accuracy: {round(random_forest_accuracy*100, 3)}%")

tree_decision_accuracy = accuracy_score(tree_decision_prediction, y_test)
print(f"Decision Tree accuracy: {round(tree_decision_accuracy*100, 3)}%")

svm_accuracy = accuracy_score(svm_prediction, y_test)
print(f"SVM accuracy: {round(svm_accuracy*100, 3)}%")

scores = {
    "Logistic Regression": logistic_regression_score.mean(),
    "Random Forest":        random_forest_score.mean(),
    "Decision Tree":        tree_decision_score.mean(),
    "SVM":                  svm_score.mean(),
}
best_name = max(scores, key=scores.get)
pipelines = {
    "Logistic Regression": logistic_regression_pipeline,
    "Random Forest":        random_forest_pipeline,
    "Decision Tree":        tree_decision_pipeline,
    "SVM":                  svm_pipeline,
}
best_pipeline = pipelines[best_name]
print(f"\nModel tốt nhất: {best_name} (CV mean: {scores[best_name]*100:.2f}%)")

 
# ─── 1. Tạo thư mục artifacts ─────────────────────────────────────────────────
os.makedirs("artifacts", exist_ok=True)
 
# ─── 2. Lưu model bằng joblib ─────────────────────────────────────────────────
# Lưu toàn bộ pipeline (preprocessor + classifier)
joblib.dump(best_pipeline, "artifacts/model.pkl")
 
# Lưu riêng preprocessor (dùng trong /model-info để lấy feature names)
joblib.dump(preprocessor, "artifacts/preprocessor.pkl")
 
print("Đã lưu artifacts/model.pkl")
print("Đã lưu artifacts/preprocessor.pkl")
 
# ─── 3. Ghi metadata (version model + version dữ liệu) ───────────────────────
metadata = {
    # Version model — tăng thủ công mỗi khi train lại
    "model_version":     "1.0.0",
 
    # Version dữ liệu — ghi nhận dataset đang dùng
    "data_version":      "titanic-kaggle-v1",
    "data_source":       "dataset/raw/titanic.csv",
    "data_shape":        {
        "train_rows": len(X_train),
        "test_rows":  len(X_test),
        "features":   list(X.columns),
    },
 
    # Thông tin model
    "best_model":        best_name,
    "model_class":       type(best_pipeline.named_steps[list(best_pipeline.named_steps)[-1]]).__name__,
 
    # Kết quả đánh giá
    "evaluation": {
        "Logistic Regression": {
            "cv_mean":  round(logistic_regression_score.mean(), 4),
            "cv_std":   round(logistic_regression_score.std(),  4),
            "accuracy": round(logistic_regression_accuracy,     4),
        },
        "Random Forest": {
            "cv_mean":  round(random_forest_score.mean(), 4),
            "cv_std":   round(random_forest_score.std(),  4),
            "accuracy": round(random_forest_accuracy,     4),
        },
        "Decision Tree": {
            "cv_mean":  round(tree_decision_score.mean(), 4),
            "cv_std":   round(tree_decision_score.std(),  4),
            "accuracy": round(tree_decision_accuracy,     4),
        },
        "SVM": {
            "cv_mean":  round(svm_score.mean(), 4),
            "cv_std":   round(svm_score.std(),  4),
            "accuracy": round(svm_accuracy,     4),
        },
    },
 
    # Thời điểm train
    "trained_at": datetime.now().isoformat(),
}
 
with open("artifacts/metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)
 
print("Đã lưu artifacts/metadata.json")
print(json.dumps(metadata, indent=2, ensure_ascii=False))
