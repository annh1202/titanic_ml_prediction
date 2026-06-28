from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from .database import get_db, init_db, PredictionRecord
from .model import predict_survival, get_model_info, MODEL_LOADED
from .schemes import (
    PassengerInput, PredictionResponse,
    BatchRequest, BatchResponse,
    HistoryResponse, HistoryItem,
    CompareModelResponse, ModelCompareItem,
)

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Titanic Survival Prediction API",
    description="API dự đoán khả năng sống sót trên tàu Titanic",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # đổi thành URL React khi deploy
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# ─── Helper ───────────────────────────────────────────────────────────────────

def _do_predict(passenger: PassengerInput) -> tuple[int, float]:
    """Gọi model và ném HTTPException nếu model chưa load."""
    try:
        return predict_survival(
            pclass=passenger.pclass, sex=passenger.sex,
            age=passenger.age,       sibsp=passenger.sibsp,
            parch=passenger.parch,   fare=passenger.fare,
            embarked=passenger.embarked,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

def _make_response(survived: int, probability: float) -> PredictionResponse:
    message = "Sống sót" if survived == 1 else "Không sống sót"
    return PredictionResponse(
        survived=survived,
        probability=round(probability, 4),
        message=message,
    )

def _save_record(db: Session, passenger: PassengerInput,
                 survived: int, probability: float) -> None:
    db.add(PredictionRecord(
        pclass=passenger.pclass, sex=passenger.sex,
        age=passenger.age,       sibsp=passenger.sibsp,
        parch=passenger.parch,   fare=passenger.fare,
        embarked=passenger.embarked,
        survived=survived, probability=probability,
    ))

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/", tags=["General"])
def root():
    """Trang chủ — liệt kê tất cả endpoints."""
    return {
        "message": "Titanic Survival Prediction API",
        "version": "1.0.0",
        "status":  "running",
        "endpoints": {
            "docs":          "/docs",
            "health":        "/health",
            "predict":       "POST /predict",
            "batch":         "POST /batch",
            "history":       "GET  /history",
            "model_info":    "GET  /model-info",
            "compare_model": "GET  /compare-model",
        },
    }


@app.get("/health", tags=["General"])
def health():
    """Kiểm tra API và trạng thái model."""
    return {
        "status":       "ok",
        "model_loaded": MODEL_LOADED,
        "timestamp":    datetime.utcnow().isoformat(),
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Dự đoán"])
def predict(passenger: PassengerInput, db: Session = Depends(get_db)):
    """Dự đoán 1 hành khách — kết quả tự động lưu vào DB."""
    survived, proba = _do_predict(passenger)
    _save_record(db, passenger, survived, proba)
    db.commit()
    return _make_response(survived, proba)


@app.post("/batch", response_model=BatchResponse, tags=["Dự đoán"])
def batch_predict(request: BatchRequest, db: Session = Depends(get_db)):
    """Dự đoán nhiều hành khách cùng lúc (tối đa 100)."""
    results = []
    for passenger in request.passengers:
        survived, proba = _do_predict(passenger)
        _save_record(db, passenger, survived, proba)
        results.append(_make_response(survived, proba))

    db.commit()
    return BatchResponse(
        total=len(results),
        survived_count=sum(r.survived for r in results),
        results=results,
    )


@app.get("/history", response_model=HistoryResponse, tags=["Lịch sử"])
def get_history(
    limit:  int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    Lịch sử các lần dự đoán — mới nhất lên trước.
    Dùng `limit` và `offset` để phân trang.
    """
    total   = db.query(PredictionRecord).count()
    records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return HistoryResponse(
        total=total, limit=limit, offset=offset,
        data=[HistoryItem.model_validate(r) for r in records],
    )


@app.get("/model-info", tags=["Model"])
def model_info():
    """Loại model, feature importance, các tham số chính."""
    try:
        return get_model_info()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/compare-model", response_model=CompareModelResponse, tags=["Model"])
def compare_model():
    """
    Bảng so sánh các model đã train trong pipeline.py.
    Cập nhật các số liệu bên dưới sau khi chạy xong pipeline.py.
    """
    models = [
        ModelCompareItem(model="Logistic Regression", accuracy=0.7991, cv_mean=0.7905, cv_std=0.0213),
        ModelCompareItem(model="Random Forest",        accuracy=0.8324, cv_mean=0.8178, cv_std=0.0187),
        ModelCompareItem(model="Decision Tree",        accuracy=0.7877, cv_mean=0.7698, cv_std=0.0241),
        ModelCompareItem(model="SVM",                  accuracy=0.8212, cv_mean=0.8034, cv_std=0.0198),
    ]
    best = max(models, key=lambda m: m.accuracy)
    return CompareModelResponse(
        models=models,
        best_model=best.model,
        note="Số liệu từ cross_val_score 5-fold. Cập nhật sau khi chạy pipeline.py.",
    )