"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateInterviewQuestions } from "../../src/services/questionService";

export default function InterviewQuestionsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeQuestions = (data: unknown): string[] => {
  console.log("RAW QUESTIONS RESPONSE:", data);

  const responseData = data as {
    questions?: unknown;
    generated_questions?: unknown;
    data?: {
      questions?: unknown;
    };
    message?: unknown;
  };

  const rawQuestions =
    responseData.questions ||
    responseData.generated_questions ||
    responseData.data?.questions ||
    responseData.message;

  if (Array.isArray(rawQuestions)) {
    return rawQuestions.map((q: unknown) => {
      if (typeof q === "string") return q;

      if (
        typeof q === "object" &&
        q !== null &&
        "question" in q &&
        typeof (q as { question?: unknown }).question === "string"
      ) {
        return (q as { question: string }).question;
      }

      return JSON.stringify(q);
    });
  }

  if (typeof rawQuestions === "string") {
    return rawQuestions
      .split("\n")
      .map((q) => q.replace(/^\d+[\).\-\s]*/, "").trim())
      .filter((q) => q.length > 0);
  }

  return [];
};

  const handleGenerateQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await generateInterviewQuestions();
      const normalizedQuestions = normalizeQuestions(data);

      if (normalizedQuestions.length === 0) {
        setError("Questions were received, but the format was not readable.");
        return;
      }

      setQuestions(normalizedQuestions);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (question: string) => {
    localStorage.setItem("selectedQuestion", question);
    router.push("/evaluate-answer");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Interview Questions
        </h1>

        <p className="mb-6 text-gray-600">
          Generate AI interview questions based on your uploaded resume.
        </p>

        <button
          onClick={handleGenerateQuestions}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-5"
            >
              <p className="font-medium text-gray-900">
                {index + 1}. {question}
              </p>

              <button
                onClick={() => handleEvaluate(question)}
                className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Answer This Question
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}