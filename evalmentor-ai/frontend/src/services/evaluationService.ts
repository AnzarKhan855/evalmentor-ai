import { apiRequest } from "../../lib/api";

export interface EvaluationRequest {
  question: string;
  answer: string;
}

export interface EvaluationResponse {
  message?: string;
  interview_id?: string;
  evaluation?: string;
}

export const evaluateInterviewAnswer = async (
  data: EvaluationRequest
): Promise<EvaluationResponse> => {
  const params = new URLSearchParams();
  params.append("question", data.question);
  params.append("answer", data.answer);

  return apiRequest<EvaluationResponse>(
    `/api/resume/evaluate-answer?${params.toString()}`,
    {
      method: "POST",
    }
  );
};