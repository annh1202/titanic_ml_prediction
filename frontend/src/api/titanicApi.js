import axios from "axios";

const API_URL = axios.create({
    baseURL: "http://localhost:8000"
});

export const predictOne = (data) => API_URL.post("/predict", data);
export const predictBatch = (list) => API_URL.post("/batch", { passengers: list });
export const getHistory = (limit, offset) => API_URL.get("/history", { params: { limit, offset } });
export const getModelInfo = () => API_URL.get("/model-info");
export const compareModels = () => API_URL.get("/compare-model");
export const healthCheck = () => API_URL.get("/health");