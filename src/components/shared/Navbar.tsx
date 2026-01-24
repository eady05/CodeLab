"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Layout, LogOut, User } from "lucide-react";

interface NavbarProps {
  problemId?: string;
}

export default function Navbar({ problemId }: NavbarProps) {
  const { data: session } = useSession();

  return (
    // 배경색을 에디터 배경과 일치시키고, 하단 보더를 아주 가늘게 설정했습니다.
    <header className="w-full flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0a0e14] sticky top-0 z-50">

      {/* 좌측: 로고 섹션 */}
      <div className="flex items-center gap-5">
        <Link href="/" className="group">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full group-hover:scale-y-110 transition-transform" />
            <span className="text-white">Code</span>
            <span className="text-blue-500/90">Lab</span>
          </h1>
        </Link>

        {problemId && (
          <>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-md border border-slate-800">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Problem</span>
              <span className="text-sm font-mono text-slate-200">#{problemId}</span>
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
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
            >
              <div className="relative">
                <img
                  src={session.user?.image || ""}
                  alt="profile"
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20 group-hover:ring-blue-500 transition-all"
                />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0a0e14]" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Welcome</p>
                <p className="text-xs font-bold text-slate-200 leading-none">{session.user?.name}</p>
              </div>
            </Link>

            <div className="h-4 w-[1px] bg-slate-800 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
              onClick={() => signOut()}
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 rounded-xl h-9 shadow-lg shadow-blue-500/20 transition-all"
          >
            Get Started
          </Button>
        )}
      </div>
    </header>
  );
}