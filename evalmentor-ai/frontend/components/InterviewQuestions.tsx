"use client";

import { useState } from "react";
import { generateInterviewQuestions } from "../src/services/questionService";
import { evaluateInterviewAnswer } from "../src/services/evaluationService";

interface EvaluationResult {
  message?: string;
  score?: number;
  feedback?: string;
  improved_answer?: string;
  evaluation?: string;
}

const normalizeQuestions = (questionsData: string[] | string | undefined) => {
  if (!questionsData) return [];

  const rawText = Array.isArray(questionsData)
    ? questionsData.join("\n")
    : questionsData;

  return rawText
    .split(/\n(?=\d+\.\s)/)
    .map((question) => question.trim())
    .filter((question) => question.length > 0 && /^\d+\./.test(question));
};

export default function InterviewQuestions() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<Record<number, EvaluationResult>>({});
  const [loading, setLoading] = useState(false);
  const [evaluatingIndex, setEvaluatingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleGenerateQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setQuestions([]);
      setAnswers({});
      setEvaluations({});

      const data = await generateInterviewQuestions();
      const formattedQuestions = normalizeQuestions(data.questions);

      if (formattedQuestions.length > 0) {
        setQuestions(formattedQuestions);
      } else {
        setError("No questions received from AI.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleEvaluateAnswer = async (question: string, index: number) => {
    const answer = answers[index];

    if (!answer || answer.trim().length === 0) {
      setError("Please type your answer before submitting.");
      return;
    }

    try {
      setEvaluatingIndex(index);
      setError("");

      const result = await evaluateInterviewAnswer({
        question,
        answer,
      });

      setEvaluations((prev) => ({
        ...prev,
        [index]: result,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer");
    } finally {
      setEvaluatingIndex(null);
    }
  };

  return (
    <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        AI Interview Questions
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Generate personalized interview questions, answer them, and receive AI feedback.
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
        <div className="mt-6 space-y-5">
          {questions.map((question, index) => (
            <div key={index} className="rounded-lg border p-4">
              <p className="whitespace-pre-line font-medium text-gray-800">
                {question}
              </p>

              <textarea
                value={answers[index] || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="mt-4 w-full rounded-lg border p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-black"
              />

              <button
                onClick={() => handleEvaluateAnswer(question, index)}
                disabled={evaluatingIndex === index}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {evaluatingIndex === index ? "Evaluating..." : "Submit Answer"}
              </button>

              {evaluations[index] && (
  <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
    <h3 className="font-semibold text-gray-900">
      AI Evaluation Result
    </h3>

    {evaluations[index].message && (
      <p className="mt-2 text-green-700">
        {evaluations[index].message}
      </p>
    )}

    {evaluations[index].evaluation && (
      <div className="mt-3 rounded-lg bg-white p-4">
        <p className="whitespace-pre-line text-gray-700">
          {evaluations[index].evaluation}
        </p>
      </div>
    )}
  </div>
)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}