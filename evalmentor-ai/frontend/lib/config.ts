/**
 * Centralized API configuration for EvalMentor AI.
 *
 * Ensures consistent URL resolution across all frontend services:
 * 1. Checks NEXT_PUBLIC_API_BASE_URL (preferred)
 * 2. Fallbacks to NEXT_PUBLIC_API_URL
 * 3. In browser development (localhost), defaults to http://localhost:8000
 * 4. In production, defaults to the deployed backend: https://evalmentor-ai.onrender.com
 *
 * Trailing slashes are stripped to avoid double slashes when appending endpoints.
 */
export function getApiBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocal) {
      return "http://localhost:8000";
    }
  }

  return "https://evalmentor-ai.onrender.com";
}
