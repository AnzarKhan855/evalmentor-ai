const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface InterviewHistoryItem {
  question: string;
  answer: string;
  score: number;
}

export const getInterviewHistory = async (): Promise<InterviewHistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/api/interviews/history`);

  if (!response.ok) {
    throw new Error("Failed to fetch interview history");
  }

  const data = await response.json();
  return data.history || [];
};