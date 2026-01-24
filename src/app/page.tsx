'use client';

import { useSession, signOut } from "next-auth/react";
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from "@/components/ui/button";
import { fetchProblemAction } from "@/actions/problem-action";
import ProblemViewer from '@/components/domain/problem/ProblemViewer';
import ProblemSearchModal from '@/components/domain/problem/ProblemSearchModal';
import EditorSection from "@/components/domain/editor/EditorSection";

export default function HomePage() {
  const { data: session } = useSession();
  const [code, setCode] = useState("// 여기에 코드를 작성하세요\n");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("Ready to compile...");

  const [problem, setProblem] = useState<any>(null);
  const [problemId, setProblemId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-slate-950 text-slate-50 overflow-hidden">
      <main className="flex flex-1 overflow-hidden">
        {/* 1. 왼쪽: 문제 영역 */}
        <section className="w-[40%] flex flex-col border-r border-slate-800 bg-slate-900/20 relative">
          {/* 🔍 문제 검색 플로팅 버튼 */}
          <div className="absolute top-4 right-4 z-20">
            <ProblemSearchModal
              onSelect={(data, id) => {
                setProblem(data);
                setProblemId(id);
              }}
            />
          </div>

          {/* 실제 지문이 나오는 곳 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ProblemViewer problemId={problemId} data={problem} isLoading={isLoading} />
          </div>
        </section>

        {/* 2. 오른쪽: 에디터 + 콘솔 (Editor & Console) */}
        <EditorSection />
      </main>
    </div>
  );
}