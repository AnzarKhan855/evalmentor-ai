import { apiRequest } from "../../lib/api";

export interface EvaluationRequest {
  question: string;
  answer: string;
}

export interface EvaluationResponse {
  message?: string;
  interview_id?: string;
  evaluation?: string;
  score?: number;
}

export const evaluateInterviewAnswer = async (
  data: EvaluationRequest
): Promise<EvaluationResponse> => {
  return apiRequest<EvaluationResponse>(
    "/api/resume/evaluate-answer",
    {
      method: "POST",
      body: JSON.stringify({
        question: data.question,
        answer: data.answer,
        user_answer: data.answer,
      }),
    }
  );
};