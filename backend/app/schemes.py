from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


# ─── Input ────────────────────────────────────────────────────────────────────

class PassengerInput(BaseModel):
    """Input cho /predict và từng phần tử trong /batch."""

    pclass:   int   = Field(..., ge=1, le=3,   description="Hạng vé: 1, 2, 3")
    sex:      str   = Field(...,                description="Giới tính: male / female")
    age:      float = Field(..., ge=0, le=120,  description="Tuổi")
    sibsp:    int   = Field(..., ge=0,          description="Số anh chị em / vợ chồng đi cùng")
    parch:    int   = Field(..., ge=0,          description="Số bố mẹ / con đi cùng")
    fare:     float = Field(..., ge=0,          description="Giá vé (bảng Anh)")
    embarked: str   = Field(...,                description="Cảng lên tàu: C, Q, S")

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in ("male", "female"):
            raise ValueError("sex phải là 'male' hoặc 'female'")
        return v

    @field_validator("embarked")
    @classmethod
    def validate_embarked(cls, v: str) -> str:
        v = v.strip().upper()
        if v not in ("C", "Q", "S"):
            raise ValueError("embarked phải là 'C', 'Q' hoặc 'S'")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "pclass": 3, "sex": "male", "age": 22,
                "sibsp": 1,  "parch": 0,    "fare": 7.25, "embarked": "S",
            }
        }


class BatchRequest(BaseModel):
    """Input cho /batch — danh sách hành khách."""
    passengers: list[PassengerInput] = Field(..., min_length=1, max_length=100)

    class Config:
        json_schema_extra = {
            "example": {
                "passengers": [
                    {"pclass": 1, "sex": "female", "age": 38, "sibsp": 1,
                     "parch": 0, "fare": 71.28, "embarked": "C"},
                    {"pclass": 3, "sex": "male",   "age": 22, "sibsp": 1,
                     "parch": 0, "fare": 7.25,  "embarked": "S"},
                ]
            }
        }


# ─── Output ───────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    """Kết quả trả về cho 1 lần predict."""
    survived:    int   = Field(..., description="0 = không sống sót, 1 = sống sót")
    probability: float = Field(..., description="Xác suất sống sót (0.0 – 1.0)")
    message:     str   = Field(..., description="Mô tả kết quả bằng tiếng Việt")


class BatchResponse(BaseModel):
    """Kết quả trả về cho /batch."""
    total:          int                    = Field(..., description="Tổng số hành khách")
    survived_count: int                    = Field(..., description="Số người sống sót")
    results:        list[PredictionResponse]


# ─── History ──────────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    """1 bản ghi trong lịch sử predict."""
    id:          int
    pclass:      int
    sex:         str
    age:         float
    sibsp:       int
    parch:       int
    fare:        float
    embarked:    str
    survived:    int
    probability: float
    created_at:  datetime

    class Config:
        from_attributes = True   # cho phép convert từ SQLAlchemy ORM object


class HistoryResponse(BaseModel):
    """Kết quả trả về cho /history."""
    total:  int
    limit:  int
    offset: int
    data:   list[HistoryItem]


# ─── Model info ───────────────────────────────────────────────────────────────

class ModelCompareItem(BaseModel):
    """Kết quả của 1 model trong bảng so sánh."""
    model:     str
    accuracy:  float
    cv_mean:   float   # cross_val_score mean từ pipeline.py
    cv_std:    float   # cross_val_score std


class CompareModelResponse(BaseModel):
    models:      list[ModelCompareItem]
    best_model:  str
    note:        str