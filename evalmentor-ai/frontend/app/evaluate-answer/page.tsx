"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export default function EvaluateAnswerPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedQuestion = localStorage.getItem("selectedQuestion");

    if (savedQuestion) {
      setQuestion(savedQuestion);
    } else {
      setError("No question selected. Please go back and choose a question.");
    }
  }, []);

  const handleEvaluateAnswer = async () => {
    try {
      setLoading(true);
      setError("");
      setEvaluation("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please login again. Token not found.");
      }

      if (!API_BASE_URL) {
        throw new Error("Backend API URL is missing.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/interview/evaluate-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question,
            answer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to evaluate answer");
      }

      setEvaluation(
        data.evaluation ||
          data.feedback ||
          data.result ||
          JSON.stringify(data, null, 2)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to evaluate answer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
        <button
          onClick={() => router.push("/interview-questions")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Questions
        </button>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Evaluate Answer
        </h1>

        <p className="mb-6 text-gray-600">
          Write your answer and get AI-powered feedback.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {question && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-2 font-semibold text-gray-900">Question:</h2>
            <p className="text-gray-700">{question}</p>
          </div>
        )}

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="h-40 w-full rounded-lg border border-gray-300 p-4 text-gray-900 outline-none focus:border-blue-500"
        />

        <button
          onClick={handleEvaluateAnswer}
          disabled={loading || !answer.trim()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? "Evaluating..." : "Evaluate Answer"}
        </button>

        {evaluation && (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-5">
            <h2 className="mb-3 text-xl font-semibold text-green-800">
              Evaluation Result
            </h2>

            <pre className="whitespace-pre-wrap text-gray-800">
              {evaluation}
            </pre>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}