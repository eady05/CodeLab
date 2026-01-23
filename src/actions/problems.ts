'use server';

import { bjhService } from "@/services/bjh-crawler";

export async function fetchProblemAction(problemId: string) {
  if (!problemId) return { success: false, error: "문제 번호를 입력하세요." };

  try {
    const data = await bjhService.getProblem(problemId);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." 
    };
  }
}