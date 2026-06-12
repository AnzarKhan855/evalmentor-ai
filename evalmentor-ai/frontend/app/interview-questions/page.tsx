"use client";

import { useState } from "react";
import Link from "next/link";
import { generateInterviewQuestions } from "../../src/services/questionService";

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await generateInterviewQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question);
    localStorage.setItem("selectedQuestion", question);
  };

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-widest text-green-400">
            Step 2
          </p>

          <h1 className="mt-3 text-4xl font-bold">Generate Interview Questions</h1>

          <p className="mt-4 text-gray-300">
            Generate AI interview questions using your uploaded and parsed resume data.
          </p>

          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="mt-6 rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>

          {error && (
            <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-300">
              {error}
            </div>
          )}
        </div>

        {questions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-2xl font-semibold">Generated Questions</h2>

            <div className="mt-5 space-y-4">
              {questions.map((question, index) => (
                <div
                  key={`${question}-${index}`}
                  className="rounded-xl border border-gray-800 bg-gray-950 p-4"
                >
                  <p className="font-medium">
                    {index + 1}. {question}
                  </p>

                  <button
                    onClick={() => handleSelectQuestion(question)}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Select for Evaluation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedQuestion && (
          <div className="mt-8 rounded-xl border border-blue-800 bg-blue-950/30 p-5">
            <p className="text-sm text-blue-300">Selected Question:</p>
            <p className="mt-2 font-medium">{selectedQuestion}</p>

            <Link
              href="/evaluate-answer"
              className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
            >
              Go to Evaluate Answer
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}