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
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!file) return alert("Upload PDF first");

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload-report",
        formDataUpload,
      );

      setFormData(res.data.extracted_data);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-start p-6">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* LEFT SIDE - FORM */}
        <div className="bg-white shadow-2xl rounded-3xl p-4 w-full md:w-1/2">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-1">
            Diabetes Risk Assessment
          </h1>
          <p className="text-center text-gray-500 mb-4">
            Please fill in your health details below
          </p>

          {/* Upload */}
          <div>
            <label className="label">Upload Medical Report (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="input"
            />

            <button
              type="button"
              onClick={handleUpload}
              className="mt-1 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
            >
              Auto-Fill from Report
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-2 mt-4">
            {/* Personal Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Personal Information
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Gender</label>
                  <select
                    name="gender"
                    onChange={handleChange}
                    className="input"
                  >
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

            {/* Medical */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
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
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
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
                  <option value="ever">Occasional</option>
                  <option value="No Info">Prefer Not to Say</option>
                </select>
              </div>
            </div>

            {/* Body */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Body Measurements
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  onChange={handleChange}
                  className="input"
                  required
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Lab */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Laboratory Results
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  name="HbA1c_level"
                  placeholder="HbA1c (%)"
                  onChange={handleChange}
                  className="input"
                  required
                />
                <input
                  type="number"
                  name="blood_glucose_level"
                  placeholder="Glucose (mg/dL)"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl text-lg font-semibold hover:bg-blue-700"
            >
              Analyze Risk
            </button>
          </form>
        </div>
 
        <div className="w-full md:w-1/3 flex items-start justify-center">
          {result ? (
            <div className="bg-white shadow-2xl rounded-3xl p-10 text-center w-full">
              <h3 className="text-xl font-bold mb-2">
                {result.prediction === 1
                  ? "Diabetes Detected"
                  : "No Diabetes Detected"}
              </h3>

              <p
                className={`text-3xl font-bold ${getRiskColor(
                  result.diabetes_probability,
                )}`}
              >
                {(result.diabetes_probability * 100).toFixed(2)}%
              </p>

              <p className="text-lg mt-2">
                {getRiskLabel(result.diabetes_probability)}
              </p>

              <p className="text-gray-500 mt-4">BMI: {result.calculated_bmi}</p>
            </div>
          ) : (
            <div className="text-gray-400 text-center mt-20">
              Your prediction will appear here 📊
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiabetesForm;
