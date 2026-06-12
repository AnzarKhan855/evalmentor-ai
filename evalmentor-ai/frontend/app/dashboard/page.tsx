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
  const [showRecentInterviews, setShowRecentInterviews] = useState(false);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-200">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] p-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-4xl font-bold text-white">
            EvalMentor AI Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Upload your resume, generate personalized interview questions, and
            track your AI interview performance.
          </p>
        </section>

        {error && (
          <p className="mb-6 rounded-xl border border-red-400 bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <button
            onClick={() => router.push("/resume-upload")}
            className="rounded-3xl border border-white/10 bg-white/10 p-7 text-left shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
              📄
            </div>

            <h2 className="text-2xl font-semibold text-white">
              Upload Resume
            </h2>

            <p className="mt-3 text-slate-300">
              Upload your PDF resume and view extracted parsed details only.
            </p>
          </button>

          <button
            onClick={() => router.push("/interview-questions")}
            className="rounded-3xl border border-white/10 bg-white/10 p-7 text-left shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl">
              🤖
            </div>

            <h2 className="text-2xl font-semibold text-white">
              Generate Questions
            </h2>

            <p className="mt-3 text-slate-300">
              Generate interview questions from your latest uploaded resume and
              answer them from there.
            </p>
          </button>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Analytics</h2>

            <div className="mt-5 rounded-2xl bg-white p-6 shadow">
              <p className="text-gray-600">Total Interviews</p>

              <p className="mt-2 text-5xl font-bold text-indigo-700">
                {dashboardData?.total_interviews || 0}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">
              Recent Interviews
            </h2>

            <p className="mt-3 text-slate-300">
              View your latest interview attempts and AI feedback only when
              needed.
            </p>

            <button
              onClick={() => setShowRecentInterviews(!showRecentInterviews)}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              {showRecentInterviews
                ? "Hide Recent Interviews"
                : "View Recent Interviews"}
            </button>
          </div>
        </section>

        {showRecentInterviews && (
          <section className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur">
            <h2 className="mb-5 text-2xl font-semibold text-white">
              Recent Interviews
            </h2>

            {!dashboardData?.recent_interviews ||
            dashboardData.recent_interviews.length === 0 ? (
              <p className="rounded-2xl bg-white p-5 text-gray-600">
                No interviews found yet.
              </p>
            ) : (
              <div className="space-y-5">
                {dashboardData.recent_interviews.map((item) => (
                  <div
                    key={item.interview_id}
                    className="rounded-2xl bg-white p-6 shadow"
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

                    <details className="mt-4 rounded-xl bg-gray-50 p-4">
                      <summary className="cursor-pointer font-semibold text-gray-900">
                        View Evaluation
                      </summary>

                      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap text-sm text-gray-700">
                        {formatEvaluation(item.evaluation)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}