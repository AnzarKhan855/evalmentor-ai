"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateInterviewQuestions } from "../../src/services/questionService";

export default function InterviewQuestionsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedQuestions = localStorage.getItem("generatedQuestions");

    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);

        if (Array.isArray(parsedQuestions)) {
          setQuestions(parsedQuestions);
        }
      } catch {
        localStorage.removeItem("generatedQuestions");
      }
    }
  }, []);

  const normalizeQuestions = (data: unknown): string[] => {
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
      return rawQuestions
        .map((q: unknown) => {
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
        })
        .filter((q) => q.trim().length > 0)
        .filter(
          (q) =>
            !q.toLowerCase().includes("here are") &&
            !q.toLowerCase().includes("personalized interview questions") &&
            !q.toLowerCase().includes("based on his resume") &&
            !q.toLowerCase().includes("based on her resume") &&
            !q.toLowerCase().includes("based on the resume")
        );
    }

    if (typeof rawQuestions === "string") {
      return rawQuestions
        .split("\n")
        .map((q) => q.replace(/^\d+[\).\-\s]*/, "").trim())
        .filter((q) => q.length > 0)
        .filter(
          (q) =>
            !q.toLowerCase().includes("here are") &&
            !q.toLowerCase().includes("personalized interview questions") &&
            !q.toLowerCase().includes("based on his resume") &&
            !q.toLowerCase().includes("based on her resume") &&
            !q.toLowerCase().includes("based on the resume")
        );
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
        setError("Questions were generated, but the response format was not readable.");
        return;
      }

      setQuestions(normalizedQuestions);
      localStorage.setItem("generatedQuestions", JSON.stringify(normalizedQuestions));
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = (question: string) => {
    localStorage.setItem("selectedQuestion", question);
    router.push("/evaluate-answer");
  };

  const handleClearQuestions = () => {
    localStorage.removeItem("generatedQuestions");
    setQuestions([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-blue-900/40 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-blue-300 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-white">Interview Questions</h1>

        <p className="mt-2 text-blue-100">
          Generate AI interview questions from your latest uploaded resume.
        </p>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>

          {questions.length > 0 && (
            <button
              onClick={handleClearQuestions}
              className="rounded-lg bg-slate-700 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              Clear Questions
            </button>
          )}
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-5">
          {questions.map((question, index) => (
            <div
              key={`${question}-${index}`}
              className="rounded-xl border border-blue-900/30 bg-white p-6 shadow"
            >
              <p className="text-lg font-medium text-gray-900">
                {index + 1}. {question}
              </p>

              <button
                onClick={() => handleAnswerQuestion(question)}
                className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
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