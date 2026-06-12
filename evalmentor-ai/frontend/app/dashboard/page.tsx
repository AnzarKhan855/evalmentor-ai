"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InterviewHistory from "../../src/components/InterviewHistory";
import { getDashboardData } from "../../src/services/dashboardService";

type Interview = {
  interview_id: string;
  question: string;
  answer: string;
  evaluation: string;
};

type DashboardData = {
  message: string;
  total_interviews: number;
  recent_interviews: Interview[];
};

function extractScore(evaluation: string): number | null {
  const match = evaluation.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  return match ? Number(match[1]) : null;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardData();
        setDashboardData(data as DashboardData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const scores = useMemo(() => {
    if (!dashboardData?.recent_interviews) return [];

    return dashboardData.recent_interviews
      .map((interview) => extractScore(interview.evaluation))
      .filter((score): score is number => score !== null);
  }, [dashboardData]);

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((total, score) => total + score, 0) / scores.length
        ).toFixed(1)
      : "0";

  const latestScore = scores.length > 0 ? scores[0] : 0;

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
            AI Interview Agent & Evaluation Platform
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            EvalMentor AI Dashboard
          </h1>

          <p className="mt-4 max-w-3xl text-gray-300">
            Track interview attempts, AI evaluation scores, and recent practice
            history in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/resume-upload"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Resume Upload
            </Link>

            <Link
              href="/resume-upload"
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              Generate Questions
            </Link>

            <Link
              href="/resume-upload"
              className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
            >
              Evaluate Answers
            </Link>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-300">
            Loading dashboard analytics...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-800 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && dashboardData && (
          <>
            <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-md">
                <p className="text-sm text-gray-400">Total Interviews</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {dashboardData.total_interviews}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Completed practice sessions
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-md">
                <p className="text-sm text-gray-400">Average Score</p>
                <h2 className="mt-3 text-3xl font-bold">{averageScore}/10</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Based on recent evaluations
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-md">
                <p className="text-sm text-gray-400">Latest Score</p>
                <h2 className="mt-3 text-3xl font-bold">{latestScore}/10</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Most recent interview attempt
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-md">
                <p className="text-sm text-gray-400">Recent Records</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {dashboardData.recent_interviews.length}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Stored in MongoDB history
                </p>
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-2xl font-semibold">Recent Activity</h2>

              <div className="mt-5 space-y-4">
                {dashboardData.recent_interviews.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No recent activity yet. Start by uploading a resume.
                  </p>
                ) : (
                  dashboardData.recent_interviews
                    .slice(0, 3)
                    .map((interview) => {
                      const score = extractScore(interview.evaluation);

                      return (
                        <div
                          key={interview.interview_id}
                          className="rounded-lg border border-gray-800 bg-gray-950 p-4"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <h3 className="font-medium text-white">
                              {interview.question}
                            </h3>

                            <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300">
                              Score: {score ?? "N/A"}/10
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm text-gray-400">
                            {interview.answer}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>
            </section>
          </>
        )}

        <section className="mt-8">
          <InterviewHistory />
        </section>
      </section>
    </main>
  );
}