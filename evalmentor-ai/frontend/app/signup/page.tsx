"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

type SignupResponse = {
  message?: string;
  detail?: unknown;
  access_token?: string;
  token?: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatErrorDetail = (detail: unknown): string => {
    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") return item;

          if (typeof item === "object" && item !== null && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }

          return JSON.stringify(item);
        })
        .join("\n");
    }

    if (typeof detail === "object" && detail !== null) {
      return JSON.stringify(detail, null, 2);
    }

    return "Signup failed. Please try again.";
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!API_BASE_URL) {
        throw new Error("Backend API URL is missing.");
      }

      if (!name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!email.trim()) {
        throw new Error("Please enter your email.");
      }

      if (!password.trim()) {
        throw new Error("Please enter your password.");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Backend returned an invalid response.");
      }

      const data: SignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(formatErrorDetail(data.detail || data));
      }

      const token = data.access_token || data.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>

        <p className="mt-2 text-gray-600">
          Start your AI interview preparation journey.
        </p>

        {error && (
          <p className="mt-5 whitespace-pre-wrap rounded-xl bg-red-100 p-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}