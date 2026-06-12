const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function generateInterviewQuestions() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Please login again. Token not found.");
  }

  if (!API_BASE_URL) {
    throw new Error(
      "Backend API URL is missing. Check NEXT_PUBLIC_API_BASE_URL in Vercel."
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/resume/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response from backend:", text);

    throw new Error(
      "Backend returned HTML instead of JSON. Check NEXT_PUBLIC_API_BASE_URL or backend route."
    );
  }

  const data = await response.json();

  console.log("Generate Questions API Response:", data);

  if (!response.ok) {
    throw new Error(data.detail || "Failed to generate questions");
  }

  return data;
}