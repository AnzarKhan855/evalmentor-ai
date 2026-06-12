"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

type RecentInterview = {
  interview_id: string;
  question?: string;
  answer?: string;
  evaluation?: unknown;
  score?: number | null;
  created_at?: string;
};

type DashboardData = {
  message?: string;
  total_interviews?: number;
  recent_interviews?: RecentInterview[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    );
  };

  const formatEvaluation = (evaluation: unknown): string => {
    if (!evaluation) return "No evaluation available.";

    if (typeof evaluation === "string") {
      return evaluation;
    }

    return JSON.stringify(evaluation, null, 2);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        if (!API_BASE_URL) {
          throw new Error("Backend API URL is missing.");
        }

        const response = await fetch(`${API_BASE_URL}/api/resume/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Backend returned an invalid response.");
        }

        const data: DashboardData & { detail?: string } = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch dashboard.");
        }

        setDashboardData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("selectedQuestion");
    localStorage.removeItem("generatedQuestions");

    router.push("/login");
  };

  const handleEvaluateAnswer = () => {
    const selectedQuestion = localStorage.getItem("selectedQuestion");

    if (!selectedQuestion) {
      alert("Please generate questions and select one question first.");
      router.push("/interview-questions");
      return;
    }

    router.push("/evaluate-answer");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-blue-100">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-blue-900/40 bg-white/10 p-8 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              EvalMentor AI Dashboard
            </h1>

            <p className="mt-2 text-blue-100">
              Manage your resume, generate interview questions, and evaluate
              answers with AI.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <button
            onClick={() => router.push("/resume-upload")}
            className="rounded-2xl border border-blue-900/40 bg-white/10 p-6 text-left shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h2 className="text-xl font-semibold text-white">
              Upload Resume
            </h2>

            <p className="mt-2 text-blue-100">
              Upload your PDF resume and view parsed resume details only.
            </p>
          </button>

          <button
            onClick={() => router.push("/interview-questions")}
            className="rounded-2xl border border-blue-900/40 bg-white/10 p-6 text-left shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h2 className="text-xl font-semibold text-white">
              Generate Questions
            </h2>

            <p className="mt-2 text-blue-100">
              Generate AI interview questions from your latest uploaded resume.
            </p>
          </button>

          <button
            onClick={handleEvaluateAnswer}
            className="rounded-2xl border border-blue-900/40 bg-white/10 p-6 text-left shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
          >
            <h2 className="text-xl font-semibold text-white">
              Evaluate Answer
            </h2>

            <p className="mt-2 text-blue-100">
              Evaluate the question you selected from the questions page.
            </p>
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-900/40 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <h2 className="mb-4 text-2xl font-semibold text-white">Analytics</h2>

          <div className="rounded-xl bg-white p-6">
            <p className="text-lg text-gray-700">Total Interviews</p>

            <p className="mt-2 text-4xl font-bold text-blue-700">
              {dashboardData?.total_interviews || 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-900/40 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Recent Interviews
          </h2>

          {!dashboardData?.recent_interviews ||
          dashboardData.recent_interviews.length === 0 ? (
            <p className="rounded-xl bg-white p-5 text-gray-600">
              No interviews found yet.
            </p>
          ) : (
            <div className="space-y-5">
              {dashboardData.recent_interviews.map((item) => (
                <div
                  key={item.interview_id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <p className="font-semibold text-gray-900">
                    Question: {item.question || "Question not found"}
                  </p>

                  <p className="mt-3 text-gray-700">
                    <span className="font-semibold">Answer:</span>{" "}
                    {item.answer || "Answer not found"}
                  </p>

                  {item.score !== undefined && item.score !== null && (
                    <p className="mt-3 text-gray-700">
                      <span className="font-semibold">Score:</span>{" "}
                      {item.score}/10
                    </p>
                  )}

                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="mb-2 font-semibold text-gray-900">
                      Evaluation:
                    </p>

                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {formatEvaluation(item.evaluation)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}