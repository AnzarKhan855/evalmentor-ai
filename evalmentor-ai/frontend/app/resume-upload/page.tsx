"use client";

import { useState } from "react";
import { uploadResume } from "../services/resumeService";

type ParsedData = {
  name?: string;
  email?: string;
  skills?: string[];
  education?: string[];
  projects?: string[];
  experience?: string[];
};

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setMessage("");
    setParsedData(null);

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
      setParsedData(null);

      const data = await uploadResume(file);

      setMessage(data.message || "Resume uploaded successfully.");
      setParsedData(data.parsed_data || null);

      console.log("Upload response:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const renderList = (items?: string[]) => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500">Not found</p>;
    }

    return (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your Resume
          </h1>

          <p className="text-gray-600 mb-6">
            Upload your PDF resume and let EvalMentor AI extract your resume
            details for personalized interview preparation.
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

          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}

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

        {parsedData && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Parsed Resume Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Name</h3>
                <p className="text-gray-700">{parsedData.name || "Not found"}</p>
              </div>

              <div className="border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-700">
                  {parsedData.email || "Not found"}
                </p>
              </div>

              <div className="border rounded-xl p-5 md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                {renderList(parsedData.skills)}
              </div>

              <div className="border rounded-xl p-5 md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                {renderList(parsedData.education)}
              </div>

              <div className="border rounded-xl p-5 md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-2">Projects</h3>
                {renderList(parsedData.projects)}
              </div>

              <div className="border rounded-xl p-5 md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                {renderList(parsedData.experience)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}