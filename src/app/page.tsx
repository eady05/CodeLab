'use client';

import { useSession, signOut } from "next-auth/react";
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from "@/components/ui/button";
import { fetchProblemAction } from "@/actions/problems";
import ProblemViewer from '@/components/problem/ProblemViewer';

export default function HomePage() {
  const { data: session } = useSession();
  const [code, setCode] = useState("// 여기에 코드를 작성하세요\n");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("Ready to compile...");

  const [problem, setProblem] = useState<any>(null);
  const [problemId, setProblemId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    const result = await fetchProblemAction(problemId);
    if (result.success) {
      setProblem(result.data);
      console.log(result.data);
      if (result.data) {
        setUserInput(result.data.sampleInput); // <--- 예제 1번을 INPUT 칸에 자동 복사!
      }
      setOutput("Ready to run...");
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50">
      {/* 상단 네비바 */}
      <header className="flex items-center justify-between px-6 py-2 border-b border-slate-800 bg-slate-900">
        <h1 className="text-lg font-bold">Code <span className="text-blue-500">Lab</span></h1>
        <div className="flex items-center gap-3">
          <img src={session?.user?.image || ""} alt="profile" className="w-7 h-7 rounded-full border border-slate-700" />
          <Button variant="ghost" size="sm" onClick={() => signOut()}>Logout</Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* 1. 왼쪽: 백준 문제 영역 (Problem) */}
        <section className="w-[40%] p-6 overflow-y-auto border-r border-slate-800 bg-slate-900/30">
          <div className="flex gap-2 mb-6">
            <input
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
              placeholder="문제 번호 (예: 1000)"
              className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-sm w-32"
            />
            <Button size="sm" onClick={handleFetch}>가져오기</Button>
          </div>

          {problem ? (
            <ProblemViewer problemId={problemId} data={problem} isLoading={isLoading} />
          ) : (
            <p className="text-slate-500">문제를 검색해 주세요.</p>
          )}
        </section>

        {/* 2. 오른쪽: 에디터 + 콘솔 (Editor & Console) */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* 상단: 에디터 */}
          <div className="flex-1 overflow-auto bg-[#282c34]">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={[javascript()]}
              onChange={(value) => setCode(value)}
            />
          </div>

          {/* 하단: Input/Output 절반씩 */}
          <div className="h-[35%] border-t border-slate-800 flex flex-col bg-slate-900">
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Console</span>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-4">Run Code</Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* 하단 왼쪽: Input (절반) */}
              <div className="flex-1 border-r border-slate-800 flex flex-col">
                <div className="px-3 py-1 text-[10px] text-slate-500 bg-slate-950/50 border-b border-slate-800">INPUT (STDIN)</div>
                <textarea
                  className="flex-1 w-full p-3 bg-transparent font-mono text-sm resize-none focus:outline-none text-blue-300"
                  placeholder="입력값을 넣어주세요..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>

              {/* 하단 오른쪽: Output (절반) */}
              <div className="flex-1 flex flex-col">
                <div className="px-3 py-1 text-[10px] text-slate-500 bg-slate-950/50 border-b border-slate-800">OUTPUT (STDOUT)</div>
                <pre className="flex-1 p-3 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap">
                  {`> ${output}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}