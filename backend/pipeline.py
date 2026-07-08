import pandas as pd
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


class GroupMedianImputer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.local_medians = {}
        self.global_median = None

    def fit(self, X, y=None):
        X_df = pd.DataFrame(X).copy()

        if "Name" in X_df.columns:
            titles = X_df["Name"].str.extract(r" ([A-Za-z]+)\.", expand=False)
            X_df["Title"] = titles
            # Tính toán giá trị median của Age theo từng Title dựa trên tập Train
            self.local_medians = X_df.groupby("Title")["Age"].median().to_dict()
        
        self.global_median = X_df["Age"].median()
        return self

    def transform(self, X):
        X_df = pd.DataFrame(X).copy()
        
        if "Name" in X_df.columns:
            titles = X_df["Name"].str.extract(r" ([A-Za-z]+)\.", expand=False)
            # Điền khuyết theo nhóm Title đã học từ tập Train
            X_df["Age"] = X_df["Age"].fillna(titles.map(self.local_medians))
            
        # Phòng trường hợp Title lạ ở tập Test chưa có trong Train, điền bằng global_median
        X_df["Age"] = X_df["Age"].fillna(self.global_median)

        # Trả về các cột numeric sau khi đã xử lý xong cột Age
        return X_df[["Age"]]


class FareQuartileImputer(BaseEstimator, TransformerMixin):
    def __init__(self):
        # Khởi tạo các mốc phân đoạn sẽ học được từ tập Train
        self.q1 = None
        self.q2 = None
        self.q3 = None

    def fit(self, X, y=None):
        X_df = pd.DataFrame(X).copy()

        # 1. Trích xuất cột Fare đầu tiên và điền khuyết bằng trung vị (phòng hờ dữ liệu NaN)
        fare_series = X_df.iloc[:, 0]
        global_median = fare_series.median()
        fare_clean = fare_series.fillna(global_median)

        # 2. CHUYỂN THÀNH LIST VÀ SẮP XẾP TĂNG DẦN (Thuật toán thủ công)
        sorted_fare = sorted(fare_clean.tolist())
        N = len(sorted_fare)

        # 3. TÍNH VỊ TRÍ INDEX CHO TỪNG TỨ PHÂN VỊ
        # Trừ 1 ở cuối công thức để khớp với Index chạy từ 0 trong Python list
        idx_q1 = int(0.25 * (N + 1)) - 1
        idx_q2 = int(0.50 * (N + 1)) - 1
        idx_q3 = int(0.75 * (N + 1)) - 1

        # Giới hạn index không vượt quá độ dài mảng (phòng trường hợp mảng quá ngắn)
        idx_q1 = max(0, min(idx_q1, N - 1))
        idx_q2 = max(0, min(idx_q2, N - 1))
        idx_q3 = max(0, min(idx_q3, N - 1))

        # 4. LƯU LẠI GIÁ TRỊ CÁC MỐC QUARTILE HỌC ĐƯỢC
        self.q1 = sorted_fare[idx_q1]
        self.q2 = sorted_fare[idx_q2]
        self.q3 = sorted_fare[idx_q3]

        return self

    def transform(self, X):
        X_df = pd.DataFrame(X).copy()
        fare_series = X_df.iloc[:, 0]

        # Hàm phân loại thủ công dựa trên các mốc Q1, Q2, Q3 đã học
        def classify_fare(fare):
            # Nếu gặp giá trị khuyết ở tập Test, tạm xếp vào nhóm rẻ nhất hoặc nhóm 0
            if pd.isna(fare):
                return 0
            if fare <= self.q1:
                return 0  # Nhóm vé siêu rẻ
            elif fare <= self.q2:
                return 1  # Nhóm vé trung bình thấp
            elif fare <= self.q3:
                return 2  # Nhóm vé trung bình cao
            else:
                return 3  # Nhóm vé thương gia / hạng sang

        # Áp dụng hàm phân loại lên toàn bộ cột Fare
        fare_binned = fare_series.apply(classify_fare)

        # Trả về dưới dạng DataFrame 2D theo đúng chuẩn đầu ra của Scikit-Learn
        return pd.DataFrame(fare_binned)


# --- 1. CHUẨN BỊ DỮ LIỆU & PREPROCESSOR ---
titanic_dataset = pd.read_csv("data/titanic.csv")
X = titanic_dataset.drop(columns=["Survived"])
y = titanic_dataset["Survived"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

age_transformer = Pipeline(steps=[
    ("age_imputer", GroupMedianImputer()),
    ("age_scaler", StandardScaler())
])


fare_transformer = Pipeline(steps=[
    ("fare_imputer", FareQuartileImputer())
])


other_numeric_transformer = Pipeline(steps=[
    ("num_imputer", SimpleImputer(strategy="median")),
    ("num_scaler", MinMaxScaler())
])


ordinal_transformer = Pipeline(steps=[
    ("ordinal_imputer", SimpleImputer(strategy="most_frequent")),
    ("ordinal", OrdinalEncoder(
        categories=[[1, 2, 3]],
        handle_unknown="use_encoded_value",
        unknown_value=-1))
])


categorical_transformer = Pipeline(steps=[
    ("cate_imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False))
])


preprocessor = ColumnTransformer(
    transformers=[
        ("age", age_transformer, ["Age", "Name"]),
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

        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])

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


# --- 3. ĐỊNH NGHĨA CONFIG SWEEP (Giữ nguyên cấu hình cũ của bạn) ---
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
    # (Mở comment phần sweep nếu bạn muốn quét lại tham số với cách điền mới này)
    # PROJECT_NAME = "titanic-separated-sweeps"
    # all_sweeps = [("Random Forest", rf_sweep_config)]
    # for model_name, config in all_sweeps:
    #     sweep_id = wandb.sweep(config, project=PROJECT_NAME)
    #     wandb.agent(sweep_id, function=train)

    print("\n=== TIẾN HÀNH TRAIN MODEL TỐT NHẤT VÀ ĐÓNG GÓI ===")
    best_model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42
    )

    final_pipeline = Pipeline(
        steps=[("preprocessor", preprocessor), ("model", best_model)]
    )

    print("Đang huấn luyện mô hình với toàn bộ dữ liệu...")
    final_pipeline.fit(X_train, y_train)

    os.makedirs("artifacts", exist_ok=True)
    joblib.dump(final_pipeline, "artifacts/model.pkl")

    joblib.dump(preprocessor, "artifacts/preprocessor.pkl")
    print("Model và preprocessor đã được lưu thành công vào thư mục artifacts/!")
