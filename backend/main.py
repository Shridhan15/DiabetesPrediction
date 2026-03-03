from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model & scaler
model = joblib.load("diabetes_model.pkl")
scaler = joblib.load("scaler.pkl")


# -----------------------------
# Input Schema
# -----------------------------
class Person(BaseModel):
    gender: str
    age: float
    hypertension: str
    heart_disease: str
    smoking_history: str
    height: float   # cm
    weight: float   # kg
    HbA1c_level: float
    blood_glucose_level: float


@app.post("/predict")
def predict_diabetes(person: Person):

    # -----------------------------
    # Convert Gender
    # -----------------------------
    gender = 1 if person.gender.lower() == "female" else 0

    # -----------------------------
    # Convert Yes/No
    # -----------------------------
    hypertension = 1 if person.hypertension.lower() == "yes" else 0
    heart_disease = 1 if person.heart_disease.lower() == "yes" else 0

    # -----------------------------
    # Calculate BMI
    # -----------------------------
    height_m = person.height / 100
    bmi = person.weight / (height_m ** 2)

    # -----------------------------
    # Smoking Encoding
    # -----------------------------
    smoking_current = 1 if person.smoking_history == "current" else 0
    smoking_ever = 1 if person.smoking_history == "ever" else 0
    smoking_former = 1 if person.smoking_history == "former" else 0
    smoking_never = 1 if person.smoking_history == "never" else 0
    # "No Info" → all zeros (reference)

    # -----------------------------
    # Create DataFrame with EXACT column order
    # -----------------------------
    columns = [
        "gender",
        "age",
        "hypertension",
        "heart_disease",
        "bmi",
        "HbA1c_level",
        "blood_glucose_level",
        "smoking_history_current",
        "smoking_history_ever",
        "smoking_history_former",
        "smoking_history_never",
    ]

    input_data = pd.DataFrame([{
        "gender": gender,
        "age": person.age,
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "bmi": bmi,
        "HbA1c_level": person.HbA1c_level,
        "blood_glucose_level": person.blood_glucose_level,
        "smoking_history_current": smoking_current,
        "smoking_history_ever": smoking_ever,
        "smoking_history_former": smoking_former,
        "smoking_history_never": smoking_never,
    }], columns=columns)

    # -----------------------------
    # Scale
    # -----------------------------
    data_scaled = scaler.transform(input_data)

    # -----------------------------
    # Predict
    # -----------------------------
    prediction = model.predict(data_scaled)[0]
    probability = model.predict_proba(data_scaled)[0][1]

    return {
        "prediction": int(prediction),
        "diabetes_probability": float(probability),
        "calculated_bmi": round(bmi, 2)
    }