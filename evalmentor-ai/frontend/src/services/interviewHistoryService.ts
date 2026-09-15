import { getApiBaseUrl } from "../../lib/config";

export interface InterviewHistoryItem {
  interview_id: string;
  question: string;
  answer: string;
  evaluation: string;
  score: number | null;
  created_at: string | null;
}

export const getInterviewHistory = async (): Promise<InterviewHistoryItem[]> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  const apiBaseUrl = getApiBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/resume/history`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    console.error("Network error fetching interview history:", err);
    throw new Error(
      "Unable to connect to the backend server. Please check your internet connection."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to fetch interview history");
  }

  const data = await response.json();
  return data.interviews || [];
};