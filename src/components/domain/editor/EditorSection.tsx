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
import { useTheme } from "next-themes";

//예제 입력 받을 prop
interface EditorSectionProps {
  sampleInput?: string; // 백준 예제 입력을 받을 통로
}

// 언어별 설정
const LANGUAGES = {
  javascript: { label: "JavaScript", extension: javascript(), initial: "// JS 코드를 작성하세요\nconsole.log('Hello Lab!');" },
  python: { label: "Python", extension: python(), initial: "# Python 코드를 작성하세요\nprint('Hello Lab!')" },
  cpp: { label: "C++", extension: cpp(), initial: "// C++ 코드를 작성하세요\n#include <iostream>\nint main() { return 0; }" },
};

export default function EditorSection({ sampleInput }: EditorSectionProps) {
  const [lang, setLang] = useState<keyof typeof LANGUAGES>("javascript");
  const [code, setCode] = useState(LANGUAGES.javascript.initial);
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("Ready to compile...");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                setCode(LANGUAGES[selected].initial);
              }}
              className="bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGES).map(([key, obj]) => (
                <option key={key} value={key}>{obj.label}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleRun}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-4 gap-2 text-white"
          >
            <Play className="w-3 h-3 fill-current" /> Run Code
          </Button>
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
    </section>
  );
}