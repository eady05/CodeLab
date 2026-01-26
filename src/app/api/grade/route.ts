import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GRADING_PROMPT } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { problemDesc, userCode, lang } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "당신은 알고리즘 채점 전문가입니다. 사용자의 코드를 분석하고 반드시 JSON으로만 응답하세요.",
    });

    const generationConfig = {
      temperature: 0.1,
      topP: 0.95,
      responseMimeType: "application/json",
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const prompt = GRADING_PROMPT(problemDesc, userCode, lang);

    // ✅ 괄호와 쉼표 오타를 완전히 수정한 부분입니다.
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = await result.response;
    const text = response.text();
    const jsonData = JSON.parse(text);

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      status: "FAIL",
      reason: "채점 중 오류가 발생했습니다.",
      feedback: { logic: "서버 연결 상태를 확인해주세요." }
    }, { status: 500 });
  }
}