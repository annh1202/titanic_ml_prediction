import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import wandb
import joblib


# --- 1. CHUẨN BỊ DỮ LIỆU & PREPROCESSOR (Chạy 1 lần) ---
titanic_dataset = pd.read_csv("data/titanic.csv")
X = titanic_dataset.drop(columns=['Survived'])
y = titanic_dataset['Survived']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

numeric_columns = ['Age', 'Fare', 'SibSp', 'Parch']
ordinal_columns = ['Pclass']
categorical_columns = ['Sex', 'Embarked']

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


# --- 2. HÀM TRAIN CHUNG CHO AGENT ---
def train():
    with wandb.init() as run:
        config = wandb.config
        model_type = config.model_type
        run.name = f"{model_type}-run"

        # --- Khởi tạo mô hình (Giữ nguyên logic cũ của bạn) ---
        if model_type == 'logistic_regression':
            model = LogisticRegression(C=config.C, solver='liblinear')
        elif model_type == 'random_forest':
            model = RandomForestClassifier(n_estimators=config.n_estimators, max_depth=config.max_depth,
                                           random_state=42)
        elif model_type == 'decision_tree':
            model = DecisionTreeClassifier(max_depth=config.max_depth, criterion=config.criterion, random_state=42)
        elif model_type == 'svm':
            model = SVC(C=config.C, kernel=config.kernel,
                        probability=True)  # Bật probability=True để tính ROC-AUC cho SVM
        else:
            raise ValueError("Invalid model type")

        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])

        # Huấn luyện
        pipeline.fit(X_train, y_train)

        # Dự đoán nhãn (0 hoặc 1) và dự đoán xác suất (probability)
        y_pred = pipeline.predict(X_test)
        y_probas = pipeline.predict_proba(X_test)  # Trả về xác suất của các lớp

        # --- TÍNH TOÁN CÁC CHỈ SỐ NÂNG CAO ---
        acc = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_probas[:, 1])

        # --- LOG CÁC CHỈ SỐ LÊN W&B ---
        wandb.log({
            "accuracy": acc,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "roc_auc": roc_auc
        })

        # --- TỰ ĐỘNG VẼ BIỂU ĐỒ TRỰC QUAN LÊN W&B DASHBOARD ---
        # 1. Vẽ Confusion Matrix
        wandb.log({"confusion_matrix": wandb.plot.confusion_matrix(
            probs=None,
            y_true=y_test.values,
            preds=y_pred,
            class_names=["Perished (0)", "Survived (1)"]
        )})

        # 2. Vẽ Đường cong ROC (ROC Curve)
        wandb.log({"roc_curve": wandb.plot.roc_curve(
            y_true=y_test.values,
            y_probas=y_probas,
            labels=["Perished (0)", "Survived (1)"]
        )})


# --- 3. ĐỊNH NGHĨA 4 CẤU HÌNH SWEEP ĐỘC LẬP ---

# Sweep 1: Logistic Regression (3 tổ hợp)
lr_sweep_config = {
    'method': 'grid',
    'metric': {'name': 'accuracy', 'goal': 'maximize'},
    'parameters': {
        'model_type': {'value': 'logistic_regression'},
        'C': {'values': [0.1, 1.0, 10.0]}
    }
}

# Sweep 2: Random Forest (2 x 3 = 6 tổ hợp)
rf_sweep_config = {
    'method': 'grid',
    'metric': {'name': 'accuracy', 'goal': 'maximize'},
    'parameters': {
        'model_type': {'value': 'random_forest'},
        'n_estimators': {'values': [50, 100]},
        'max_depth': {'values': [5, 10, None]}
    }
}

# Sweep 3: Decision Tree (3 x 2 = 6 tổ hợp)
dt_sweep_config = {
    'method': 'grid',
    'metric': {'name': 'accuracy', 'goal': 'maximize'},
    'parameters': {
        'model_type': {'value': 'decision_tree'},
        'max_depth': {'values': [3, 5, 10]},
        'criterion': {'values': ['gini', 'entropy']}
    }
}

# Sweep 4: SVM (3 x 2 = 6 tổ hợp)
svm_sweep_config = {
    'method': 'grid',
    'metric': {'name': 'accuracy', 'goal': 'maximize'},
    'parameters': {
        'model_type': {'value': 'svm'},
        'C': {'values': [0.1, 1.0, 5.0]},
        'kernel': {'values': ['linear', 'rbf']}
    }
}

# --- 4. KÍCH HOẠT CHẠY LẦN LƯỢT ---
if __name__ == '__main__':
    # PROJECT_NAME = "titanic-separated-sweeps"
    #
    # # Gom danh sách các cấu hình lại để duyệt qua vòng lặp
    # all_sweeps = [
    #     ("Logistic Regression", lr_sweep_config),
    #     ("Random Forest", rf_sweep_config),
    #     ("Decision Tree", dt_sweep_config),
    #     ("SVM", svm_sweep_config)
    # ]
    #
    # for model_name, config in all_sweeps:
    #     print(f"\n=== ĐANG KHỞI CHẠY SWEEP CHO: {model_name} ===")
    #     # Tạo ID sweep trên server W&B
    #     sweep_id = wandb.sweep(config, project=PROJECT_NAME)
    #     # Chạy Agent cho đến khi hoàn thành hết các tổ hợp của mô hình đó
    #     wandb.agent(sweep_id, function=train)
    #
    # print("\n=== HOÀN THÀNH TẤT CẢ CÁC SWEEP ===")

    print("\n=== TIẾN HÀNH TRAIN MODEL TỐT NHẤT VÀ ĐÓNG GÓI ===")
    # Chọn ra model tốt nhất sau khi xem trên wandb.ai
    # Accuracy = 0.8268
    # F1-score = 0.75969
    best_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )

    final_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', best_model)
    ])

    print("Đang huấn luyện mô hình với toàn bộ dữ liệu...")
    final_pipeline.fit(X_train, y_train)

    joblib.dump(final_pipeline, "artifact/model.pkl")
    joblib.dump(preprocessor, "artifact/preprocessor.pkl")
    print("Model saved successfully")

