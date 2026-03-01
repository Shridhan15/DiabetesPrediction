from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

model = joblib.load("diabetes_model.pkl")
scaler = joblib.load("scaler.pkl")

app = FastAPI()
 
class Person(BaseModel):
    gender: int
    age: float
    hypertension: int
    heart_disease: int
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float
    smoking_history_current: int
    smoking_history_ever: int
    smoking_history_former: int
    smoking_history_never: int


@app.post("/predict")
def predict_diabetes(person: Person):
 
    data = np.array([[
        person.gender,
        person.age,
        person.hypertension,
        person.heart_disease,
        person.bmi,
        person.HbA1c_level,
        person.blood_glucose_level,
        person.smoking_history_current,
        person.smoking_history_ever,
        person.smoking_history_former,
        person.smoking_history_never
    ]])
 
    data_scaled = scaler.transform(data)
 
    prediction = model.predict(data_scaled)[0]
    probability = model.predict_proba(data_scaled)[0][1]

    return {
        "prediction": int(prediction),
        "diabetes_probability": float(probability)
    }