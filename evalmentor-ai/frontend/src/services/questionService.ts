import { apiRequest } from "../../lib/api";

export interface QuestionResponse {
  message?: string;
  questions?: string[];
}

export const generateInterviewQuestions = async (): Promise<QuestionResponse> => {
  return apiRequest<QuestionResponse>("/api/resume/generate-questions", {
    method: "POST",
  });
};