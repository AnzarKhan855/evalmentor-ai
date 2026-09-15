import { getApiBaseUrl } from "./config";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken")
      : null;

  const apiBaseUrl = getApiBaseUrl();
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${formattedEndpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    console.error(`Network error requesting ${endpoint}:`, err);
    throw new Error(
      "Unable to connect to the server. Please check your network connection."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}