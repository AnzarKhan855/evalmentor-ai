import { getApiBaseUrl } from "../../lib/config";

export interface QuestionResponse {
  success?: boolean;
  message?: string;
  questions?: string[] | string;
  detail?: string;
}

export async function generateInterviewQuestions(): Promise<QuestionResponse> {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Please login again. Authentication token not found.");
  }

  const apiBaseUrl = getApiBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/resume/generate-questions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (networkError) {
    console.error("Network or CORS error connecting to backend:", networkError);
    throw new Error(
      "Unable to connect to the backend service. Please check your connection or try again shortly."
    );
  }

  const contentType = response.headers.get("content-type");
  let data: QuestionResponse | null = null;

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorDetail = data?.detail;

    switch (response.status) {
      case 400:
        throw new Error(
          errorDetail ||
            "Resume text could not be extracted. Please upload a PDF with selectable text."
        );
      case 401:
        throw new Error("Your session has expired. Please log in again.");
      case 403:
        throw new Error("You do not have permission to access this resource.");
      case 404:
        throw new Error(
          errorDetail || "No resume found. Please upload a resume first."
        );
      case 429:
        throw new Error(
          errorDetail ||
            "AI service is temporarily rate limited. Please wait a moment and try again."
        );
      case 502:
        throw new Error(
          errorDetail ||
            "AI question generation service is temporarily unavailable. Please try again shortly."
        );
      case 500:
        throw new Error(
          errorDetail ||
            "A server error occurred while generating questions. Please try again later."
        );
      default:
        throw new Error(
          errorDetail || `Failed to generate questions (Status ${response.status}).`
        );
    }
  }

  if (!data) {
    throw new Error("Received an invalid response from the server.");
  }

  return data;
}