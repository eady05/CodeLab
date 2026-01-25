'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProblemAction } from '@/actions/problem-action';
import { Search } from "lucide-react"; // 아이콘

interface Props {
  onSelect: (data: any, id: string) => void;
}

export default function ProblemSearchModal({ onSelect }: Props) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [open, setOpen] = useState(false); // 모달 열림 상태 제어

  const handleSearch = async () => {
    setLoading(true);
    const result = await fetchProblemAction(id);
    if (result.success) setPreview(result.data);
    else alert("문제를 찾을 수 없습니다.");
    setLoading(false);
  };

  const handleConfirm = () => {
    onSelect(preview, id);
    setOpen(false); // 선택 시 모달 닫기
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="
      gap-2 
      border-slate-300 dark:border-slate-700 
      bg-white dark:bg-slate-800/50 
      text-slate-700 dark:text-slate-100
      hover:bg-slate-100 dark:hover:bg-slate-700 
      hover:text-slate-900 dark:hover:text-white 
      hover:border-slate-400 dark:hover:border-slate-500
      transition-all
    ">
          <Search className="w-4 h-4" /> 문제 바꾸기
        </Button>
      </DialogTrigger>

      {/* 다이얼로그 본체 */}
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50">
        <DialogHeader>
          <DialogTitle>백준 문제 가져오기</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 my-4">
          <Input
            placeholder="문제 번호 입력 (예: 1000)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "검색 중..." : "검색"}
          </Button>
        </div>

        {preview && (
          <div className="mt-4 p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{preview.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
              {preview.description.replace(/<[^>]*>?/gm, '').slice(0, 150)}...
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirm}>
              이 문제 풀기
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}