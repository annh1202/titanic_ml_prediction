from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,

    allow_origins=["http://localhost:3000", "http://localhost:5173"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class UserInput(BaseModel):
    name: str
    age: int


@app.post("/predict")
def predict(data: UserInput):

    return {
        "message": f"Hello {data.name}",
        "age": data.age
    }