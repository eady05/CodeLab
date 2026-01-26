"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink, Award, Code2, Github, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateBaekjoonId, updateGithubSettings, syncGithubSubmissions } from "@/app/mypage/actions";
import CodeViewModal from "@/components/domain/editor/CodeViewModal"; // 경로 확인!

interface MyPageProps {
  user: {
    id: number;
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
    code: string;
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
  const [proId, setProId] = useState(user.programmersId || "");
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const filteredSubmissions = submissions.filter((sub) =>
    String(sub.problemId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  //백준아이디 연동
  const handleBJIdUpdate = async () => {
    if (!bjId) return;
    setIsPending(true);
    const result = await updateBaekjoonId(Number(user.id), bjId);
    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "업데이트 중 오류가 발생했습니다.");
    }
    setIsPending(false);
  };



  const getLevelStyle = (level: string | null, platform: string) => {
    const lvl = level || '';
    if (platform === 'BAEKJOON') {
      if (lvl.includes('Gold')) return 'text-yellow-600 dark:text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      if (lvl.includes('Silver')) return 'text-slate-500 dark:text-slate-300 border-slate-400/20 bg-slate-400/5';
      if (lvl.includes('Bronze')) return 'text-orange-600 dark:text-orange-400 border-orange-400/20 bg-orange-400/5';
      if (lvl.includes('Platinum')) return 'text-emerald-600 dark:text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
      return 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50';
    }
    if (platform === 'PROGRAMMERS') {
      if (lvl.includes('Lv.0') || lvl.includes('Lv.1')) return 'text-cyan-600 dark:text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
      if (lvl.includes('Lv.2')) return 'text-blue-600 dark:text-blue-400 border-blue-400/20 bg-blue-400/5';
      if (lvl.includes('Lv.3')) return 'text-indigo-600 dark:text-indigo-400 border-indigo-400/20 bg-indigo-400/5';
      return 'text-sky-600 dark:text-sky-400 border-sky-400/20 bg-sky-400/5';
    }
    return 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 py-10 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <div className="md:col-span-1 p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm dark:shadow-xl flex flex-col items-center justify-center text-center transition-colors">
            <div className="relative mb-4">
              <img src={user.image!} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-sm" />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 rounded-lg shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>
            <button className="text-xs font-medium px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full transition-all">
              프로필 수정
            </button>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 flex flex-col justify-between group hover:border-blue-500/50 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <Code2 className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-full border border-blue-500/20 font-bold">BAEKJOON</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">백준 아이디</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-white truncate">{user.baekjoonId || "미연동"}</span>
                  <BaekjoonModal user={user} isPending={isPending} handleUpdate={handleBJIdUpdate} bjId={bjId} setBjId={setBjId} isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
              </div>
            </div>
            {/**
            <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 flex flex-col justify-between group hover:border-emerald-500/50 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <Award className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-full border border-emerald-500/20 font-bold">PROGRAMMERS</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">프로그래머스</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-white truncate">{user.programmersId || "미연동"}</span>
                  <button className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors">설정</button>
                </div>
              </div>
            </div>
             */}

            <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 flex flex-col justify-between group hover:border-slate-400 dark:hover:border-white/30 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <Github className="w-8 h-8 text-slate-900 dark:text-white mb-2" />
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-full border border-slate-200 dark:border-white/20 font-bold">GITHUB HUB</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">최근 동기화</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.githubRepo ? "연동됨" : "레포 미설정"}</span>
                  <GithubSettingsModal user={user} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden transition-all">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              내 제출 내역 <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">{filteredSubmissions.length}개</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="문제 번호로 찾기"
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-200 w-full md:w-64 focus:border-blue-500 outline-none transition-all shadow-inner"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">Level</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">번호</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">문제 제목</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">언어</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">제출 일시</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">코드</th>
                  <th className="px-6 py-4 font-semibold text-left tracking-wider">Git</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getLevelStyle(sub.level ?? null, sub.platform)}`}>
                        {sub.level || 'Unranked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">#{sub.problemId}</td>
                    <td className="px-6 py-4 font-medium">{sub.title || '제목 없음'}</td>
                    <td className="px-6 py-4 uppercase">
                      <span className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                        {sub.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <CodeViewModal
                        code={sub.code}
                        title={sub.title || `문제 #${sub.problemId}`}
                        language={sub.language}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => sub.githubUrl && window.open(sub.githubUrl, '_blank')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    if (res.success) toast.success("설정이 저장되었습니다.");
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await syncGithubSubmissions(user.id);
    if (res.success) toast.success(`${res.count}개의 문제를 동기화했습니다!`);
    setIsSyncing(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">설정</button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
        <DialogHeader><DialogTitle>GitHub 연동 설정</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700" placeholder="GitHub Access Token" />
          <Input value={repo} onChange={(e) => setRepo(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700" placeholder="username/repository" />
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">저장</Button>
            <Button onClick={handleSync} disabled={isSyncing} className="flex-1 bg-blue-600 text-white">{isSyncing ? "동기화 중..." : "지금 동기화"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BaekjoonModal({ user, isPending, handleUpdate, bjId, setBjId, isOpen, setIsOpen }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          {user.baekjoonId ? "변경" : "연동"}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 sm:max-w-md">
        <DialogHeader><DialogTitle>백준 아이디 연동</DialogTitle></DialogHeader>
        <div className="py-6 space-y-4">
          <Input placeholder="백준 ID 입력" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={bjId} onChange={(e) => setBjId(e.target.value)} />
          <p className="text-[11px] text-slate-500 italic">* solved.ac 티어 정보를 실시간으로 가져옵니다.</p>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isPending || !bjId} className="bg-blue-600 hover:bg-blue-500 text-white w-full font-bold">
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} 연동하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}