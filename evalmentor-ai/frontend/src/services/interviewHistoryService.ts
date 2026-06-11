const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface InterviewHistoryItem {
  interview_id: string;
  question: string;
  answer: string;
  evaluation: string;
  score: number | null;
  created_at: string | null;
}

export const getInterviewHistory = async (): Promise<InterviewHistoryItem[]> => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/resume/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch interview history");
  }

  const data = await response.json();
  return data.interviews || [];
};