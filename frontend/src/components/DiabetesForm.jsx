import React, { useState } from "react";
import axios from "axios";

const DiabetesForm = () => {
  const [formData, setFormData] = useState({
    gender: "Female",
    age: "",
    hypertension: "No",
    heart_disease: "No",
    smoking_history: "never",
    height: "",
    weight: "",
    HbA1c_level: "",
    blood_glucose_level: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getRiskColor = (prob) => {
    if (prob < 0.3) return "text-green-600";
    if (prob < 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLabel = (prob) => {
    if (prob < 0.3) return "Low Risk";
    if (prob < 0.6) return "Moderate Risk";
    return "High Risk";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Diabetes Risk Assessment
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Please fill in your health details below
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Gender</label>
                <select name="gender" onChange={handleChange} className="input">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="label">Age (years)</label>
                <input
                  type="number"
                  name="age"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Medical Conditions
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hypertension</label>
                <select
                  name="hypertension"
                  onChange={handleChange}
                  className="input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="label">Heart Disease</label>
                <select
                  name="heart_disease"
                  onChange={handleChange}
                  className="input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Lifestyle
            </h2>

            <div>
              <label className="label">Smoking History</label>
              <select
                name="smoking_history"
                onChange={handleChange}
                className="input"
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Currently Smoking</option>
                <option value="ever">Smoked Occasionally</option>
                <option value="No Info">Prefer Not to Say</option>
              </select>
            </div>
          </div>

          {/* Body Measurements */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Body Measurements
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lab Results */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Laboratory Results
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">HbA1c Level (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="HbA1c_level"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Blood Glucose Level (mg/dL)</label>
                <input
                  type="number"
                  name="blood_glucose_level"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Analyze Risk
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">
              {result.prediction === 1
                ? "Diabetes Detected"
                : "No Diabetes Detected"}
            </h3>

            <p
              className={`text-2xl font-semibold ${getRiskColor(result.diabetes_probability)}`}
            >
              {(result.diabetes_probability * 100).toFixed(2)}% —{" "}
              {getRiskLabel(result.diabetes_probability)}
            </p>

            <p className="text-gray-500 mt-2">
              Calculated BMI: {result.calculated_bmi}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiabetesForm;
