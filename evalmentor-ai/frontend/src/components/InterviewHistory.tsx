"use client";

import { useEffect, useState } from "react";
import {
  getInterviewHistory,
  InterviewHistoryItem,
} from "../services/interviewHistoryService";

export default function InterviewHistory() {
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getInterviewHistory();
        setHistory(data);
      } catch (err) {
        setError("Failed to load interview history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p>Loading interview history...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Interview History</h2>

      {history.length === 0 ? (
        <p>No interviews found.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.interview_id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold">Score: {item.score ?? "N/A"}/10</p>
                <p className="text-sm text-gray-500">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "No date"}
                </p>
              </div>

              <p>
                <strong>Question:</strong> {item.question}
              </p>

              <p className="mt-2">
                <strong>Answer:</strong> {item.answer}
              </p>

              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                <strong>Evaluation:</strong> {item.evaluation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}