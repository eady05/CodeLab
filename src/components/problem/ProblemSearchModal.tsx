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
      border-slate-700 
      bg-slate-800/50 
      text-slate-100       /* 👈 글자색을 밝은 화이트/그레이로 명시 */
      hover:bg-slate-700 
      hover:text-white 
      hover:border-slate-500
      transition-all
    ">
          <Search className="w-4 h-4" /> 문제 바꾸기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle>백준 문제 가져오기</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 my-4">
          <Input
            placeholder="문제 번호 입력 (예: 1000)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="bg-slate-950 border-slate-700"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "검색 중..." : "검색"}
          </Button>
        </div>

        {preview && (
          <div className="mt-4 p-4 rounded-md bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-blue-400 mb-2">{preview.title}</h4>
            <p className="text-sm text-slate-400 line-clamp-3 mb-4">
              {/* HTML 태그를 제거하고 텍스트만 미리보기 */}
              {preview.description.replace(/<[^>]*>?/gm, '').slice(0, 150)}...
            </p>
            <Button className="w-full" onClick={handleConfirm}>이 문제 풀기</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}