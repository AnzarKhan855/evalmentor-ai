"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadResume } from "../services/resumeService";

type ParsedData = {
  name?: string;
  email?: string;
  skills?: string[];
  education?: string[];
  projects?: string[];
  experience?: string[];
};

type UploadResponse = {
  message?: string;
  parsed_data?: ParsedData;
};

export default function ResumeUploadPage() {
  const router = useRouter();

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

      const data: UploadResponse = await uploadResume(file);

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
      return <p className="text-slate-400">Not found</p>;
    }

    return (
      <ul className="list-inside list-disc space-y-1 text-slate-100">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-indigo-300 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Upload Your Resume
          </h1>

          <p className="mb-6 text-slate-300">
            Upload your PDF resume and let EvalMentor AI extract your resume
            details.
          </p>

          <div className="rounded-2xl border-2 border-dashed border-white/20 p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              id="resume-upload"
              className="hidden"
              onChange={handleFileChange}
            />

            <label
              htmlFor="resume-upload"
              className="inline-block cursor-pointer rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Choose PDF Resume
            </label>

            {file && (
              <p className="mt-4 font-medium text-emerald-300">
                Selected File: {file.name}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-100 p-3 font-medium text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-xl bg-green-100 p-3 font-medium text-green-700">
              {message}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </div>

        {parsedData && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Parsed Resume Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <h3 className="mb-2 font-semibold text-white">Name</h3>
                <p className="text-slate-200">
                  {parsedData.name || "Not found"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <h3 className="mb-2 font-semibold text-white">Email</h3>
                <p className="text-slate-200">
                  {parsedData.email || "Not found"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 md:col-span-2">
                <h3 className="mb-2 font-semibold text-white">Skills</h3>
                {renderList(parsedData.skills)}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 md:col-span-2">
                <h3 className="mb-2 font-semibold text-white">Education</h3>
                {renderList(parsedData.education)}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 md:col-span-2">
                <h3 className="mb-2 font-semibold text-white">Projects</h3>
                {renderList(parsedData.projects)}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 md:col-span-2">
                <h3 className="mb-2 font-semibold text-white">Experience</h3>
                {renderList(parsedData.experience)}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}