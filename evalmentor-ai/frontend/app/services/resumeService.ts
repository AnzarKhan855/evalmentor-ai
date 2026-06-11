const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const uploadResume = async (file: File) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User not authenticated. Please login again.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/resume/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Resume upload failed");
  }

  return data;
};