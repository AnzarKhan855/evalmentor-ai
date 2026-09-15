import { getApiBaseUrl } from "@/lib/config";

export const uploadResume = async (file: File) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  if (!token) {
    throw new Error("User not authenticated. Please login again.");
  }

  const apiBaseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/resume/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (err) {
    console.error("Network error during resume upload:", err);
    throw new Error(
      "Unable to connect to the backend server. Please check your internet connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || `Resume upload failed (Status ${response.status})`);
  }

  return data;
};