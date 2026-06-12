const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function generateInterviewQuestions() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/resume/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  console.log("Generate Questions API Response:", data);

  if (!response.ok) {
    throw new Error(data.detail || "Failed to generate questions");
  }

  return data;
}