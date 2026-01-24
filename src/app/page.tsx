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
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50">
      {/* 상단 네비바 */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        {/* 좌측: 서비스 로고 및 상태 */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" /> {/* 실행 중임을 나타내는 인디케이터 */}
            <span className="text-slate-100">Code</span>
            <span className="text-blue-500">Lab</span>
          </h1>

          <div className="h-4 w-[1px] bg-slate-700" /> {/* 수직 구분선 */}

          {/* 현재 선택된 문제 번호 표시 (있을 때만) */}
          {problemId && (
            <span className="text-sm font-mono text-slate-400">
              PROBLEM <span className="text-slate-200">#{problemId}</span>
            </span>
          )}
        </div>

        {/* 우측: 도구 및 사용자 설정 */}
        <div className="flex items-center gap-3">
          {/* 사용자 프로필 및 로그아웃 */}
          <div className="flex items-center gap-3 pl-2 bg-slate-800/50 py-1 px-2 rounded-full border border-slate-700">
            <div className="flex items-center gap-2">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="profile"
                  className="w-6 h-6 rounded-full ring-1 ring-slate-600"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700" />
              )}
              <span className="text-xs font-medium text-slate-300 hidden md:block">
                {session?.user?.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

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