"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

type DashboardData = {
  total_interviews?: number;
  recent_interviews?: {
    interview_id: string;
    question: string;
    answer: string;
    evaluation: string;
    score?: number;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/resume/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch dashboard");
        }

        setDashboardData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
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
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-gray-700">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              EvalMentor AI Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your resume, interview questions, and AI evaluations.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <button
            onClick={() => router.push("/resume-upload")}
            className="rounded-xl bg-white p-6 text-left shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Resume
            </h2>
            <p className="mt-2 text-gray-600">
              Upload your PDF resume and extract parsed details.
            </p>
          </button>

          <button
            onClick={() => router.push("/interview-questions")}
            className="rounded-xl bg-white p-6 text-left shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Generate Questions
            </h2>
            <p className="mt-2 text-gray-600">
              Generate AI interview questions from your latest uploaded resume.
            </p>
          </button>

          <button
            onClick={() => router.push("/evaluate-answer")}
            className="rounded-xl bg-white p-6 text-left shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Evaluate Answer
            </h2>
            <p className="mt-2 text-gray-600">
              Evaluate your selected interview answer using AI.
            </p>
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Analytics
          </h2>

          <p className="text-lg text-gray-700">
            Total Interviews:{" "}
            <span className="font-bold">
              {dashboardData?.total_interviews || 0}
            </span>
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Recent Interviews
          </h2>

          {!dashboardData?.recent_interviews ||
          dashboardData.recent_interviews.length === 0 ? (
            <p className="text-gray-600">No interviews found yet.</p>
          ) : (
            <div className="space-y-4">
              {dashboardData.recent_interviews.map((item) => (
                <div
                  key={item.interview_id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="font-semibold text-gray-900">
                    Question: {item.question}
                  </p>

                  <p className="mt-2 text-gray-700">
                    Answer: {item.answer}
                  </p>

                  <pre className="mt-2 whitespace-pre-wrap text-gray-700">
                    {item.evaluation}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}