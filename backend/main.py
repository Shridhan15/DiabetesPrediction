from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import pdfplumber
import re

app = FastAPI()

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load model & scaler
# -----------------------------
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
    height: float
    weight: float
    HbA1c_level: float
    blood_glucose_level: float


# =========================================================
# 🔥 COMMON FEATURE PROCESSING FUNCTION (KEY OPTIMIZATION)
# =========================================================
def prepare_features(data):
    gender = 1 if data["gender"].lower() == "female" else 0
    hypertension = 1 if data["hypertension"] == "yes" else 0
    heart_disease = 1 if data["heart_disease"] == "yes" else 0

    # BMI
    height = data.get("height", 170)
    weight = data.get("weight", 70)
    bmi = weight / ((height / 100) ** 2)

    # Smoking encoding
    smoking = data.get("smoking_history", "never")
    smoking_current = 1 if smoking == "current" else 0
    smoking_ever = 1 if smoking == "ever" else 0
    smoking_former = 1 if smoking == "former" else 0
    smoking_never = 1 if smoking == "never" else 0

    columns = [
        "gender", "age", "hypertension", "heart_disease",
        "bmi", "HbA1c_level", "blood_glucose_level",
        "smoking_history_current", "smoking_history_ever",
        "smoking_history_former", "smoking_history_never"
    ]

    df = pd.DataFrame([{
        "gender": gender,
        "age": data["age"],
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "bmi": bmi,
        "HbA1c_level": data["HbA1c_level"],
        "blood_glucose_level": data["blood_glucose_level"],
        "smoking_history_current": smoking_current,
        "smoking_history_ever": smoking_ever,
        "smoking_history_former": smoking_former,
        "smoking_history_never": smoking_never,
    }], columns=columns)

    return df, bmi


# =========================================================
# 🔥 PREDICTION FUNCTION (REUSED)
# =========================================================
def predict_model(data_dict):
    df, bmi = prepare_features(data_dict)

    scaled = scaler.transform(df)

    pred = model.predict(scaled)[0]
    prob = model.predict_proba(scaled)[0][1]

    return {
        "prediction": int(pred),
        "diabetes_probability": float(prob),
        "calculated_bmi": round(bmi, 2),
    }


# =========================================================
# 🔹 NORMAL PREDICT API
# =========================================================
@app.post("/predict")
def predict_diabetes(person: Person):
    return predict_model(person.dict())


# =========================================================
# 🔹 PDF EXTRACTION
# =========================================================
def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        return "".join(page.extract_text() or "" for page in pdf.pages)


def extract_values(text):
    def find(pattern):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else None

    return {
        "age": float(find(r'Age[:\s]+(\d+)') or 0),
        "HbA1c_level": float(find(r'HbA1c[:\s]+([\d.]+)') or 0),
        "blood_glucose_level": float(find(r'Glucose[:\s]+(\d+)') or 0),

        "gender": (find(r'Gender[:\s]+(Male|Female)') or "male").lower(),
        "hypertension": (find(r'Hypertension[:\s]+(Yes|No)') or "No").lower(),
        "heart_disease": (find(r'Heart Disease[:\s]+(Yes|No)') or "No").lower(),
        "smoking_history": (find(r'Smoking History[:\s]+(\w+)') or "never").lower(),

        # Optional fields (if present in future PDFs)
        "height": float(find(r'Height[:\s]+(\d+)') or 170),
        "weight": float(find(r'Weight[:\s]+(\d+)') or 70),
    }


# =========================================================
# 🔥 PDF → DIRECT PREDICTION
# =========================================================
@app.post("/upload-report")
async def upload_report(file: UploadFile = File(...)):
    text = extract_text_from_pdf(file.file)
    data = extract_values(text)

    print("Extracted:", data)

    result = predict_model(data)
    print("Prediction Result:", result)

    return {
        "extracted_data": data,
        **result
    }
