import { apiRequest } from "../../lib/api";

export const getDashboardData = async () => {
  return apiRequest("/api/resume/dashboard");
};