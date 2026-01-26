// src/services/aiService.ts
import { GRADING_PROMPT } from "@/lib/ai/prompts";

export async function getAiGrading(problemDesc: string, userCode: string, lang: string) {
  const response = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemDesc, userCode, lang }),
  });

  if (!response.ok) {
    throw new Error("AI 채점 서비스에 응답하지 않습니다.");
  }

  return await response.json();
}