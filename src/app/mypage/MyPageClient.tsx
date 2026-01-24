"use client";

import { useState } from "react";
import { User } from "next-auth";
import { Search, ExternalLink, Award, Code2, Github } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // 알림 라이브러리 (없으면 alert로 대체)
import { useRouter } from "next/navigation";
import { updateBaekjoonId, updateGithubSettings, syncGithubSubmissions } from "@/app/mypage/actions";

// MyPageClient.tsx 상단

interface MyPageProps {
  user: {
    id: number; // 또는 string (본인의 schema.prisma 설정에 맞게)
    name?: string | null;
    email?: string | null;
    image?: string | null;
    baekjoonId?: string | null;
    programmersId?: string | null;
    githubToken?: string | null;
    githubRepo?: string | null;
    tier?: number | null;
  };
  submissions: {
    id: number;
    problemId: string;
    language: string;
    code: string;     // 코드 뷰어를 위해 필요!
    createdAt: Date;
    platform: string;
    level?: string | null;
    title?: string | null;
    githubUrl?: string | null;
  }[];
}


export default function MyPageClient({ user, submissions }: MyPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [bjId, setBjId] = useState(user.baekjoonId || "");
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // 1. 안전한 검색 필터링 (problemId가 숫자일 경우 대비)
  const filteredSubmissions = submissions.filter((sub) =>
    String(sub.problemId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. 백준 아이디 업데이트 핸들러
  const handleBJIdUpdate = async () => {
    if (!bjId) return;
    setIsPending(true);
    const result = await updateBaekjoonId(Number(user.id), bjId);
    console.log(result);
    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "업데이트 중 오류가 발생했습니다.");
    }
    setIsPending(false);
  };

  // 1. 레벨 스타일 결정 로직 (플랫폼 & 레벨 기준)
  const getLevelStyle = (level: string | null, platform: string) => {
    const lvl = level || '';

    if (platform === 'BAEKJOON') {
      if (lvl.includes('Gold')) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      if (lvl.includes('Silver')) return 'text-slate-300 border-slate-400/20 bg-slate-400/5';
      if (lvl.includes('Bronze')) return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
      if (lvl.includes('Platinum')) return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
      return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }

    if (platform === 'PROGRAMMERS') {
      if (lvl.includes('Lv.0') || lvl.includes('Lv.1')) return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
      if (lvl.includes('Lv.2')) return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
      if (lvl.includes('Lv.3')) return 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5';
      if (lvl.includes('Lv.4') || lvl.includes('Lv.5')) return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
      return 'text-sky-400 border-sky-400/20 bg-sky-400/5';
    }

    return 'text-slate-500 border-slate-800 bg-slate-900';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-10 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* 1. 프로필 & 통계 (카드 배경을 slate-900으로) */}
        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <div className="md:col-span-1 p-6 border border-slate-800 rounded-3xl bg-slate-900 shadow-xl flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <img src={user.image!} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-800" />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 rounded-lg shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400 mb-4">{user.email}</p>
            <button className="text-xs font-medium px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-all">
              프로필 수정
            </button>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. 백준 카드 */}
            <div className="p-6 border border-slate-800 rounded-3xl bg-slate-900/50 flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-start">
                <Code2 className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">BAEKJOON</span>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">백준 아이디</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-white truncate">{user.baekjoonId || "미연동"}</span>
                  {/* 위에 정의한 백준 아이디 업데이트 함수형 컴포넌트 호출 */}
                  <BaekjoonModal
                    user={user}
                    isPending={isPending}
                    handleUpdate={handleBJIdUpdate}
                    bjId={bjId}
                    setBjId={setBjId}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                  />
                </div>
              </div>
            </div>

            {/* 2. 프로그래머스 카드 (새로 추가) */}
            <div className="p-6 border border-slate-800 rounded-3xl bg-slate-900/50 flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
              <div className="flex justify-between items-start">
                <Award className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PROGRAMMERS</span>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">프로그래머스</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-white truncate">{user.programmersId || "미연동"}</span>
                  {/* 프로그래머스용 모달 추가 필요 */}
                  <button className="text-[10px] bg-slate-800 px-2 py-1 rounded-md">설정</button>
                </div>
              </div>
            </div>

            {/* 3. GitHub 동기화 카드 (새로 추가) */}
            <div className="p-6 border border-slate-800 rounded-3xl bg-slate-900/50 flex flex-col justify-between group hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <Github className="w-8 h-8 text-white mb-2" />
                <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white rounded-full border border-white/20">GITHUB HUB</span>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">최근 동기화</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium text-slate-300">
                    {user.githubRepo ? "연동됨" : "레포 미설정"}
                  </span>
                  {/* 아까 만든 GitHub 설정 및 동기화 버튼 모달 */}
                  <GithubSettingsModal user={user} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 제출 내역 섹션 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              내 제출 내역 <span className="text-slate-500 text-sm font-normal">{filteredSubmissions.length}개</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="문제 번호로 찾기"
                className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 w-full md:w-64 focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">Level</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">번호</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">문제 제목</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">언어</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">제출 일시</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">코드</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Github size={14} />
                      <span className="text-[10px] uppercase tracking-widest">Git</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* 1. Level (티어) */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getLevelStyle(sub.level ?? null, sub.platform)}`}>
                        {sub.level || 'Unranked'}
                      </span>
                    </td>

                    {/* 2. 문제 번호 & 플랫폼 */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">#{sub.problemId}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{sub.platform}</span>
                      </div>
                    </td>

                    {/* 3. 문제 제목 */}
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {sub.title || '제목 없음'}
                    </td>

                    {/* 4. 언어 */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px] font-bold border border-slate-700 uppercase">
                        {sub.language}
                      </span>
                    </td>

                    {/* 5. 제출 일시 */}
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    {/* 5. 코드 뷰어 */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toast(sub.code || "코드가 없습니다.")}
                        className="text-slate-500 group-hover:text-blue-400 font-medium transition-colors"
                      >
                        코드 보기
                      </button>
                    </td>

                    {/* 6. 관리 */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => sub.githubUrl && window.open(sub.githubUrl, '_blank')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md 
               text-slate-400 bg-slate-800/50 border border-slate-700
               hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/5 
               transition-all duration-200 group/link"
                      >
                        <span className="text-xs font-medium">GitHub</span>
                        <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                일치하는 제출 내역이 없습니다.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function GithubSettingsModal({ user }: { user: any }) {
  const [token, setToken] = useState(user.githubToken || "");
  const [repo, setRepo] = useState(user.githubRepo || "");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = async () => {
    const res = await updateGithubSettings(user.id, token, repo);
    if (res.success) toast("설정이 저장되었습니다.");
  };

  const handleSync = async () => {
    setIsSyncing(true);
    console.log('동기화 시작');
    const res = await syncGithubSubmissions(user.id);
    if (res.success) toast(`${res.count}개의 문제를 가져왔습니다!`);
    setIsSyncing(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
          GitHub 연동 설정
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle>GitHub 알고리즘 레포 연동</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Personal Access Token (classic)</label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-slate-950 border-slate-700"
              placeholder="ghp_..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Repository (username/repo)</label>
            <Input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="bg-slate-950 border-slate-700"
              placeholder="coding-monkey/baekjoon-hub"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-slate-700">설정 저장</Button>
            <Button onClick={handleSync} disabled={isSyncing} className="flex-1 bg-blue-600">
              {isSyncing ? "동기화 중..." : "지금 동기화"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 1. MyPageClient 외부에 별도의 서브 컴포넌트로 정의 (같은 파일 내)
function BaekjoonModal({ user, isPending, handleUpdate, bjId, setBjId, isOpen, setIsOpen }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-[10px] bg-slate-800 px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors">
          {user.baekjoonId ? "변경" : "연동"}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>백준 아이디 연동</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400">백준 핸들 (ID)</label>
            <Input
              placeholder="baekjoon"
              className="bg-slate-950 border-slate-700 text-slate-200 focus:ring-blue-500"
              value={bjId}
              onChange={(e) => setBjId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            />
          </div>
          <p className="text-[11px] text-slate-500 italic leading-relaxed">
            * 입력하신 아이디를 기반으로 solved.ac에서 티어 정보를 실시간으로 가져옵니다.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={handleUpdate}
            disabled={isPending || !bjId}
            className="bg-blue-600 hover:bg-blue-500 w-full font-bold"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            연동하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
