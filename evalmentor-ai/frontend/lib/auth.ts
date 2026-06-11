import { apiRequest } from "./api";
import type { AuthResponse, LoginRequest, SignupRequest } from "@/types/auth";

export function signupUser(data: SignupRequest) {
  return apiRequest<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data: LoginRequest) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}