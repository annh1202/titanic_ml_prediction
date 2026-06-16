# Titanic ML Prediction

A full-stack machine learning web application built with ReactJS and FastAPI for predicting Titanic passenger survival.

---

## Tech Stack

### Frontend

* ReactJS
* JavaScript
* CSS

### Backend

* FastAPI
* Python
* Scikit-learn
* Pandas
* NumPy

### DevOps

* Docker
* Docker Compose

---

## Features

* Titanic survival prediction
* REST API with FastAPI
* Interactive frontend UI with ReactJS
* Machine learning model integration
* Dockerized development environment

---

## Installation

### Clone Repository

```bash
git clone <your-repository-url>
cd titanic_ml_prediction
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
```

Run backend server:

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Docker Setup

Run the entire project:

```bash
docker-compose up --build
```

---

## API Documentation

FastAPI automatically provides API docs:

### Swagger UI

```text
http://127.0.0.1:8000/docs
```

### ReDoc

```text
http://127.0.0.1:8000/redoc
```

---

## Git Workflow

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add new feature"
git push
```

---

## Future Improvements

* User authentication
* Prediction history
* Batch prediction
* Model performance dashboard
* Deployment with Docker and Nginx

---

## Author

Developed using ReactJS and FastAPI.
