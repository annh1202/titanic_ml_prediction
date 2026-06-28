from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost:3307/predicted_history"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


# ─── Table ────────────────────────────────────────────────────────────────────

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Input features — khớp với pipeline.py
    pclass      = Column(Integer,  nullable=False)
    sex         = Column(String(10), nullable=False)
    age         = Column(Float,    nullable=False)
    sibsp       = Column(Integer,  nullable=False)
    parch       = Column(Integer,  nullable=False)
    fare        = Column(Float,    nullable=False)
    embarked    = Column(String(2), nullable=False)

    # Output
    survived    = Column(Integer,  nullable=False)   # 0 hoặc 1
    probability = Column(Float,    nullable=False)   # xác suất sống (0.0 – 1.0)

    created_at  = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Tạo tất cả bảng nếu chưa tồn tại. Gọi 1 lần khi app khởi động."""
    Base.metadata.create_all(bind=engine)
    print("Database initialized")


def get_db():
    """Dependency injection cho FastAPI — tự đóng session sau mỗi request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()