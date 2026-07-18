import pandas as pd
from pathlib import Path
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder, MinMaxScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import wandb
import joblib
import os


class FareQuartileImputer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.q1_ = None
        self.q2_ = None
        self.q3_ = None

    def fit(self, X, y=None):
        X_df = pd.DataFrame(X).copy()
        fare_series = X_df.iloc[:, 0]
        global_median = fare_series.median()
        fare_clean = fare_series.fillna(global_median)

        sorted_fare = sorted(fare_clean.tolist())
        N = len(sorted_fare)

        idx_q1 = max(0, min(int(0.25 * (N + 1)) - 1, N - 1))
        idx_q2 = max(0, min(int(0.50 * (N + 1)) - 1, N - 1))
        idx_q3 = max(0, min(int(0.75 * (N + 1)) - 1, N - 1))

        self.q1_ = sorted_fare[idx_q1]
        self.q2_ = sorted_fare[idx_q2]
        self.q3_ = sorted_fare[idx_q3]
        self.is_fitted_ = True

        return self

    def transform(self, X):
        X_df = pd.DataFrame(X).copy()
        fare_series = X_df.iloc[:, 0]

        def classify_fare(fare):
            if pd.isna(fare):
                return 0
            if fare <= self.q1_:
                return 0
            elif fare <= self.q2_:
                return 1
            elif fare <= self.q3_:
                return 2
            else:
                return 3

        fare_binned = fare_series.apply(classify_fare)
        return pd.DataFrame(fare_binned)

    def get_feature_names_out(self, input_features=None):
        return ["Fare_Quartile"]


# --- 1. CHUẨN BỊ DỮ LIỆU & PREPROCESSOR ---
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "titanic.csv"
titanic_dataset = pd.read_csv(DATA_PATH)
X = titanic_dataset.drop(columns=["Survived"])
y = titanic_dataset["Survived"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

def get_clean_preprocessor():
    """Hàm tạo mới preprocessor đảm bảo an toàn dữ liệu và đồng bộ cấu trúc cột"""
    age_transformer = Pipeline(
        steps=[("age_imputer", SimpleImputer(strategy="median")), ("age_scaler", StandardScaler())]
    )

    fare_transformer = Pipeline(steps=[("fare_imputer", FareQuartileImputer())])

    other_numeric_transformer = Pipeline(
        steps=[
            ("num_imputer", SimpleImputer(strategy="median")),
            ("num_scaler", MinMaxScaler()),
        ]
    )

    ordinal_transformer = Pipeline(
        steps=[
            ("ordinal_imputer", SimpleImputer(strategy="most_frequent")),
            (
                "ordinal",
                OrdinalEncoder(
                    categories=[[1, 2, 3]],
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
            ),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("cate_imputer", SimpleImputer(strategy="most_frequent")),
            (
                "onehot",
                OneHotEncoder(
                    drop="first",
                    handle_unknown="ignore",
                    sparse_output=False,
                    categories=[["female", "male"], ["C", "Q", "S"]],
                ),
            ),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("age", age_transformer, ["Age"]),
            ("fare", fare_transformer, ["Fare"]),
            ("other_num", other_numeric_transformer, ["SibSp", "Parch"]),
            ("ordinal", ordinal_transformer, ["Pclass"]),
            ("categorical", categorical_transformer, ["Sex", "Embarked"]),
        ],
        remainder="drop",
    )


# --- 2. HÀM TRAIN CHUNG CHO AGENT ---
def train():
    with wandb.init() as run:
        config = wandb.config
        model_type = config.model_type
        run.name = f"{model_type}-run"

        if model_type == "logistic_regression":
            model = LogisticRegression(C=config.C, solver="liblinear")
        elif model_type == "random_forest":
            model = RandomForestClassifier(
                n_estimators=config.n_estimators,
                max_depth=config.max_depth,
                random_state=42,
            )
        elif model_type == "decision_tree":
            model = DecisionTreeClassifier(
                max_depth=config.max_depth,
                criterion=config.criterion,
                random_state=42,
            )
        elif model_type == "svm":
            model = SVC(C=config.C, kernel=config.kernel, probability=True)
        else:
            raise ValueError("Invalid model type")

        current_preprocessor = get_clean_preprocessor()
        pipeline = Pipeline(steps=[("preprocessor", current_preprocessor), ("model", model)])

        # Huấn luyện
        pipeline.fit(X_train, y_train)

        # Dự đoán
        y_pred = pipeline.predict(X_test)
        y_probas = pipeline.predict_proba(X_test)

        # Tính chỉ số
        acc = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_probas[:, 1])

        # Log W&B
        wandb.log(
            {
                "accuracy": acc,
                "precision": precision,
                "recall": recall,
                "f1_score": f1,
                "roc_auc": roc_auc,
            }
        )

        wandb.log(
            {
                "confusion_matrix": wandb.plot.confusion_matrix(
                    probs=None,
                    y_true=y_test.values,
                    preds=y_pred,
                    class_names=["Perished (0)", "Survived (1)"],
                )
            }
        )

        wandb.log(
            {
                "roc_curve": wandb.plot.roc_curve(
                    y_true=y_test.values,
                    y_probas=y_probas,
                    labels=["Not survived (0)", "Survived (1)"],
                )
            }
        )


# --- 3. ĐỊNH NGHĨA CONFIG SWEEP ---
lr_sweep_config = {
    "method": "grid",
    "metric": {"name": "accuracy", "goal": "maximize"},
    "parameters": {
        "model_type": {"value": "logistic_regression"},
        "C": {"values": [0.1, 1.0, 10.0]},
    },
}

rf_sweep_config = {
    "method": "grid",
    "metric": {"name": "accuracy", "goal": "maximize"},
    "parameters": {
        "model_type": {"value": "random_forest"},
        "n_estimators": {"values": [50, 100]},
        "max_depth": {"values": [5, 10, None]},
    },
}

dt_sweep_config = {
    "method": "grid",
    "metric": {"name": "accuracy", "goal": "maximize"},
    "parameters": {
        "model_type": {"value": "decision_tree"},
        "max_depth": {"values": [3, 5, 10]},
        "criterion": {"values": ["gini", "entropy"]},
    },
}

svm_sweep_config = {
    "method": "grid",
    "metric": {"name": "accuracy", "goal": "maximize"},
    "parameters": {
        "model_type": {"value": "svm"},
        "C": {"values": [0.1, 1.0, 5.0]},
        "kernel": {"values": ["linear", "rbf"]},
    },
}

# --- 4. KÍCH HOẠT CHẠY ---
if __name__ == "__main__":
    # PROJECT_NAME = "titanic-separated-sweeps"
    # all_sweeps = [("Random Forest", rf_sweep_config)]
    # for model_name, config in all_sweeps:
    #     sweep_id = wandb.sweep(config, project=PROJECT_NAME)
    #     wandb.agent(sweep_id, function=train)
    #

    print("\n=== TIEN HANH TRAIN MODEL TOT NHAT VA DONG GOI ===")
    best_model = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)

    # Tạo preprocessor độc lập hoàn toàn cho mô hình cuối cùng
    final_preprocessor = get_clean_preprocessor()
    final_pipeline = Pipeline(steps=[("preprocessor", final_preprocessor), ("model", best_model)])

    print("Dang huan luyen mo hinh voi toan bo du lieu...")
    final_pipeline.fit(X_train, y_train)

    os.makedirs(BASE_DIR / "artifacts", exist_ok=True)
    joblib.dump(final_pipeline, BASE_DIR / "artifacts" / "model.pkl")
    joblib.dump(final_preprocessor, BASE_DIR / "artifacts" / "preprocessor.pkl")
    print("Model va preprocessor da duoc luu thanh cong!")
    
    print("\n=== DANH GIA MO HINH TREN TAP TEST ===")
    y_pred = final_pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")

