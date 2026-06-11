"use client";

import { useState } from "react";
import { uploadResume } from "../services/resumeService";

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setMessage("");

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await uploadResume(file);

      setMessage(data.message || "Resume uploaded successfully.");
      console.log("Upload response:", data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Your Resume
        </h1>

        <p className="text-gray-600 mb-6">
          Upload your PDF resume and let EvalMentor AI generate personalized
          interview questions.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <input
            type="file"
            accept=".pdf"
            id="resume-upload"
            className="hidden"
            onChange={handleFileChange}
          />

          <label
            htmlFor="resume-upload"
            className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Choose PDF Resume
          </label>

          {file && (
            <p className="mt-4 text-green-600 font-medium">
              Selected File: {file.name}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-4 text-red-600 font-medium">{error}</p>
        )}

        {message && (
          <p className="mt-4 text-green-600 font-medium">{message}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>
      </div>
    </div>
  );
}