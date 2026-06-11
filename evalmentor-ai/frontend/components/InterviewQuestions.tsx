"use client";

import { useState } from "react";
import { generateInterviewQuestions } from "../src/services/questionService";

export default function InterviewQuestions() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setQuestions([]);

      const data = await generateInterviewQuestions();

      if (Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else if (typeof data.questions === "string") {
        setQuestions([data.questions]);
      } else {
        setError("No questions received from AI.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        AI Interview Questions
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Generate personalized interview questions based on your parsed resume.
      </p>

      <button
        onClick={handleGenerateQuestions}
        disabled={loading}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {questions.length > 0 && (
        <div className="mt-6 space-y-3">
          {questions.map((question, index) => (
            <div key={index} className="rounded-lg border p-4">
              <p className="whitespace-pre-line font-medium text-gray-800">
                Q{index + 1}. {question}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}