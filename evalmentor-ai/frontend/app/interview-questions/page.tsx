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
        const parsedQuestions: unknown = JSON.parse(savedQuestions);

        if (Array.isArray(parsedQuestions)) {
          const validQuestions = parsedQuestions.filter(
            (question): question is string => typeof question === "string"
          );

          setQuestions(validQuestions);
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

    const cleanQuestion = (question: string) => {
      return question
        .replace(/^\d+[\).\-\s]*/, "")
        .replace(/^[-•]\s*/, "")
        .trim();
    };

    const isValidQuestion = (question: string) => {
      const lowerQuestion = question.toLowerCase();

      return (
        question.length > 0 &&
        !lowerQuestion.includes("here are") &&
        !lowerQuestion.includes("personalized interview questions") &&
        !lowerQuestion.includes("based on his resume") &&
        !lowerQuestion.includes("based on her resume") &&
        !lowerQuestion.includes("based on the resume") &&
        !lowerQuestion.includes("certainly") &&
        !lowerQuestion.includes("sure")
      );
    };

    if (Array.isArray(rawQuestions)) {
      return rawQuestions
        .map((question: unknown) => {
          if (typeof question === "string") {
            return cleanQuestion(question);
          }

          if (
            typeof question === "object" &&
            question !== null &&
            "question" in question &&
            typeof (question as { question?: unknown }).question === "string"
          ) {
            return cleanQuestion((question as { question: string }).question);
          }

          return "";
        })
        .filter(isValidQuestion);
    }

    if (typeof rawQuestions === "string") {
      return rawQuestions
        .split("\n")
        .map((question) => cleanQuestion(question))
        .filter(isValidQuestion);
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
        setError(
          "Questions were generated, but the response format was not readable."
        );
        return;
      }

      setQuestions(normalizedQuestions);
      localStorage.setItem(
        "generatedQuestions",
        JSON.stringify(normalizedQuestions)
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to generate questions."
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
    localStorage.removeItem("selectedQuestion");
    setQuestions([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-indigo-300 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-4xl font-bold text-white">
            Interview Questions
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Generate personalized AI interview questions from your latest
            uploaded resume.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {loading ? "Generating..." : "Generate Questions"}
            </button>

            {questions.length > 0 && (
              <button
                onClick={handleClearQuestions}
                className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Clear Questions
              </button>
            )}
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-400 bg-red-100 p-4 text-red-700">
              {error}
            </p>
          )}
        </section>

        {questions.length > 0 && (
          <section className="mt-8 space-y-5">
            {questions.map((question, index) => (
              <div
                key={`${question}-${index}`}
                className="rounded-2xl bg-white p-6 shadow-xl"
              >
                <p className="text-lg font-semibold text-gray-900">
                  {index + 1}. {question}
                </p>

                <button
                  onClick={() => handleAnswerQuestion(question)}
                  className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  Answer This Question
                </button>
              </div>
            ))}
          </section>
        )}

        {questions.length === 0 && !error && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
            <p className="text-slate-300">
              No questions generated yet. Click Generate Questions to start.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
