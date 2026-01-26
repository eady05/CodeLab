'use client';

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Button } from "@/components/ui/button";
import { Play, Terminal } from "lucide-react"; // 아이콘 추가
import { useMountedTheme } from "@/hooks/use-mounted-theme";
import { LANGUAGES } from "@/lib/editor-config";
import AiResultModal from "@/components/domain/editor/AiResultModal"; // 방금 만든 모달 임포트
import { getAiGrading } from "@/services/aiService"; // 서비스 호출
import { Progress } from "@/components/ui/progress"; // 👈 Radix 기반 Progress 추가

//예제 입력 받을 prop
interface EditorSectionProps {
  problemId?: string;
  problemData?: any; // 문제 지문 데이터
  sampleInput?: string; // 백준 예제 입력을 받을 통로
}

export default function EditorSection({ problemId, problemData, sampleInput }: EditorSectionProps) {
  const [lang, setLang] = useState<keyof typeof LANGUAGES>("javascript");
  const [code, setCode] = useState(LANGUAGES[lang].initial);
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("Ready to compile...");
  const { theme, mounted } = useMountedTheme(); //테마 색
  const [isGrading, setIsGrading] = useState(false); //채점
  const [progress, setProgress] = useState(0); // 진행률 상태
  const [aiResult, setAiResult] = useState<any>(null); // 결과 저장용
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 오픈 상태

  const handleRun = async () => {
    setOutput("Running...");

    if (lang === 'javascript') {
      runJavaScript();
    } else if (lang === 'python') {
      await runPython();
    } else if (lang === 'cpp') {
      await runCpp();
    }
  };

  const handleAiGrade = async () => {
    setIsGrading(true);
    setProgress(0); // 시작 시 초기화

    // 💡 게이지를 0%에서 90%까지 부드럽게 올리는 가짜 타이머
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 5) + 2; // 조금씩 랜덤하게 상승
      });
    }, 200);

    try {
      const result = await getAiGrading(problemData.description, code, lang);

      setProgress(100); // 💡 결과 나오면 즉시 100%로!

      // 사용자에게 100%를 보여주기 위해 아주 잠깐 대기 후 모달 띄우기
      setTimeout(() => {
        setAiResult(result);
        setIsModalOpen(true);
        setIsGrading(false); // 로딩 오버레이 닫기
      }, 500);

    } catch (error) {
      console.error(error);
      setOutput("⚠️ AI 채점 중 오류가 발생했습니다.");
      setIsGrading(false);
    } finally {
      clearInterval(interval);
    }
  };

  // 1. JavaScript 실행 (기존 코드 유지 및 최적화)
  const runJavaScript = () => {
    const logs: string[] = [];
    const mockConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
      error: (...args: any[]) => logs.push(`❌ ${args.join(" ")}`)
    };

    try {
      const runner = new Function("console", "input", code);
      runner(mockConsole, userInput);
      setOutput(logs.join("\n") || "실행 완료 (출력 없음)");
    } catch (err: any) {
      setOutput(`⚠️ JS Error: ${err.message}`);
    }
  };

  // 2. Python 실행 (Pyodide 사용)
  const runPython = async () => {
    try {
      if (!window.loadPyodide) {
        setOutput("❌ Python 엔진을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      const pyodide = await window.loadPyodide();

      // 표준 입력(stdin) 시뮬레이션 및 출력 가로채기
      let pyLogs = "";
      pyodide.setStdout({ batched: (str: string) => { pyLogs += str + "\n"; } });

      // Python 코드 내에서 input() 함수가 userInput을 읽도록 설정
      const fullCode = `
import sys, io
sys.stdin = io.StringIO("""${userInput}""")
${code}
    `;

      await pyodide.runPythonAsync(fullCode);
      setOutput(pyLogs.trim() || "실행 완료 (출력 없음)");
    } catch (err: any) {
      setOutput(`⚠️ Python Error: ${err.message}`);
    }
  };


  // 3. C++ 실행 (Wandbox API 사용)
  const runCpp = async () => {
    try {
      const response = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          compiler: "gcc-head",
          stdin: userInput,
          save: false,
        }),
      });

      const result = await response.json();

      // 1. 컴파일 에러가 있는 경우
      if (result.compiler_error) {
        setOutput(`❌ Compilation Error:\n${result.compiler_error}`);
      }
      // 2. 실행은 됐는데 런타임 에러가 발생한 경우 (세그폴트 등)
      else if (result.program_error) {
        setOutput(`⚠️ Runtime Error:\n${result.program_error}\n\n[Output]:\n${result.program_output}`);
      }
      // 3. 정상 실행 결과
      else {
        setOutput(result.program_output || "실행 완료 (출력 없음)");
      }
    } catch (err) {
      setOutput("⚠️ C++ 실행 실패: 네트워크 연결이나 API 상태를 확인하세요.");
    }
  };

  return (
    <section className="flex-1 flex flex-col overflow-hidden">
      {/* 💡 로딩 오버레이: Radix Progress 사용 */}
      {isGrading && (
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md px-10 flex flex-col items-center">
            <div className="flex justify-between w-full items-end mb-4">
              <h3 className="text-xl font-bold text-white tracking-tight">AI 채점 중...</h3>
              <span className="text-sm font-mono text-purple-400">{progress}%</span>
            </div>

            {/* 🛠️ Radix UI Progress 컴포넌트 */}
            <Progress value={progress} className="h-2 w-full bg-slate-800" />

            <p className="mt-6 text-slate-400 text-sm animate-pulse">
              Gemini가 코드를 분석하고 있습니다.
            </p>
          </div>
        </div>
      )}
      {/* 1. 상단 에디터 영역 */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#282c34] relative transition-colors duration-300">
        <CodeMirror
          value={code}
          height="100%"
          theme={mounted && theme === "light" ? vscodeLight : oneDark}
          extensions={[LANGUAGES[lang].extension]}
          onChange={(value) => setCode(value)}
          className="text-base"
        />
      </div>

      {/* 2. 하단 콘솔 섹션 */}
      <div className="h-[35%] border-t border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">

        {/* 콘솔 헤더 */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Console</span>
            </div>

            {/* 언어 선택 드롭다운 */}
            <select
              value={lang}
              onChange={(e) => {
                const selected = e.target.value as keyof typeof LANGUAGES;
                setLang(selected);
                if (code === LANGUAGES[lang].initial || code === "") {
                  setCode(LANGUAGES[selected].initial);
                }
              }}
              className="bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGES).map(([key, obj]) => (
                <option key={key} value={key}>{obj.label}</option>
              ))}
            </select>
          </div>


          <div className="flex gap-2">
            {/* 1. Run Code 버튼 */}
            <Button
              onClick={handleRun}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-4 gap-2 text-white"
            >
              <Play className="w-3 h-3 fill-current" /> Run Code
            </Button>

            {/* 2. AI 채점 버튼 (스타일 통일) */}
            <Button
              onClick={handleAiGrade}
              size="sm"
              disabled={isGrading}
              // h-7, text-xs, px-4를 똑같이 주고, 아이콘(Sparkles 등)을 넣으면 더 예뻐요!
              className="bg-purple-600 hover:bg-purple-700 h-7 text-xs px-4 gap-2 text-white transition-all disabled:opacity-50"
            >
              {isGrading ? (
                <span className="animate-spin text-[10px]">🌀</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 2.955.69 3.906 1.815C12.354 3.69 13.75 3 15.306 3 18.092 3 20.25 5.322 20.25 8.25c0 3.924-2.438 7.11-4.739 9.27a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001z" />
                </svg>
              )}
              {isGrading ? "채점 중..." : "AI 채점 (Gemini)"}
            </Button>
          </div>
        </div>

        {/* 입출력 패널 */}
        <div className="flex flex-1 overflow-hidden">
          {/* INPUT */}
          <div className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800">INPUT</div>
            <textarea
              className="flex-1 w-full p-3 bg-transparent font-mono text-sm resize-none focus:outline-none text-blue-600 dark:text-blue-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
              placeholder="데이터를 입력하세요..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>

          {/* OUTPUT */}
          <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
            <div className="px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800">OUTPUT</div>
            <pre className="flex-1 p-3 font-mono text-sm text-green-600 dark:text-green-400 overflow-auto whitespace-pre-wrap">
              {`> ${output}`}
            </pre>
          </div>
        </div>
      </div>
      {/* AI 채점 결과 모달 */}
      <AiResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={aiResult}
      />
    </section>
  );
}