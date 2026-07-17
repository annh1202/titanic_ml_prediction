
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

VALID_INPUT = {
    "pclass": 1, "sex": "female", "age": 38,
    "sibsp": 1,  "parch": 0, "fare": 71.28, "embarked": "C"
}

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_predict_valid():
    res = client.post("/predict", json=VALID_INPUT)
    assert res.status_code == 200
    assert "survived"    in res.json()
    assert "probability" in res.json()
    assert "message"     in res.json()

def test_predict_schema():
    res = client.post("/predict", json=VALID_INPUT)
    data = res.json()
    assert data["survived"] in [0, 1]
    assert 0.0 <= data["probability"] <= 1.0

def test_predict_invalid_sex():
    bad = {**VALID_INPUT, "sex": "abc"}
    res = client.post("/predict", json=bad)
    assert res.status_code == 422

def test_history():
    res = client.get("/history")
    assert res.status_code == 200
    assert "data"  in res.json()
    assert "total" in res.json()