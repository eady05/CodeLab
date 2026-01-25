"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Layout, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  problemId?: string;
}

export default function Navbar({ problemId }: NavbarProps) {
  const { data: session } = useSession();

  return (
    // 배경색을 에디터 배경과 일치시키고, 하단 보더를 아주 가늘게 설정했습니다.
    <header className="w-full flex items-center justify-between px-6 py-3 border-b border-white/5 dark:bg-[#0a0e14] bg-white sticky top-0 z-50">

      {/* 좌측: 로고 섹션 */}
      <div className="flex items-center gap-5">
        <Link href="/" className="group">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 group">
            {/* 파란색 바: 라이트 모드에서는 채도를 살짝 높여 더 쨍하게 보이게 할 수 있습니다 */}
            <div className="w-2 h-6 bg-blue-600 dark:bg-blue-500 rounded-full group-hover:scale-y-110 transition-transform" />

            {/* Code: 라이트 모드에선 진한 회색(slate-900), 다크 모드에선 흰색(white) */}
            <span className="text-slate-900 dark:text-white transition-colors">Code</span>

            {/* Lab: 라이트 모드에서도 가독성을 위해 /90 투명도 대신 확실한 파란색 적용 */}
            <span className="text-blue-600 dark:text-blue-500/90 transition-colors">Lab</span>
          </h1>
        </Link>

        {problemId && (
          <>
            {/* 세로 구분선: 라이트 모드에선 연한 slate-200, 다크 모드에선 slate-800 */}
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 transition-colors" />

            {/* 문제 번호 박스 */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 transition-colors">
              {/* Problem 라벨: 라이트 모드에서 가독성을 위해 조금 더 진한 blue-600 사용 */}
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">
                Problem
              </span>

              {/* 문제 번호: 라이트 모드에선 slate-700, 다크 모드에선 slate-200 */}
              <span className="text-sm font-mono text-slate-700 dark:text-slate-200">
                #{problemId}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 우측: 사용자 메뉴 */}
      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-3">
            {/* 마이페이지 이동 링크 */}
            <Link
              href="/mypage"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group"
            >
              <div className="relative">
                <img
                  src={session.user?.image || ""}
                  alt="profile"
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/20 group-hover:ring-blue-500 transition-all"
                />
                {/* 온라인 표시 점: 테두리를 배경색에 맞춤 (white <-> slate-950) */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Welcome</p>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none transition-colors">
                  {session.user?.name}
                </p>
              </div>
            </Link>

            <ThemeToggle />

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 transition-colors" />

            {/* 로그아웃 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-xl transition-all"
              onClick={() => signOut()}
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 rounded-xl h-9 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Get Started
          </Button>
        )}
      </div>
    </header>
  );
}