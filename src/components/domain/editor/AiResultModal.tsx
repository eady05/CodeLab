// src/components/domain/editor/AiResultModal.tsx
"use client";

import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AiResultModal({ isOpen, onClose, result }: any) {
  const [showFeedback, setShowFeedback] = useState(false);

  if (!result) return null;
  const isPass = result.status === "PASS";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) setShowFeedback(false);
      onClose();
    }}>
      <DialogContent className="sm:max-w-[1000px] md:max-w-[1200px] lg:max-w-[1400px] w-[95vw] max-h-[90vh] bg-white dark:bg-[#1e1e1e] border-slate-200 dark:border-slate-800 p-0 overflow-hidden flex flex-col shadow-2xl transition-all">
        {/* 1. 결과 요약 (프롬프트의 status와 reason 활용) */}
        <div className={`p-10 flex flex-col items-center justify-center text-white ${isPass ? "bg-green-500" : "bg-red-500"}`}>
          {isPass ? <CheckCircle2 className="w-16 h-16 mb-4" /> : <XCircle className="w-16 h-16 mb-4" />}
          <h2 className="text-3xl font-bold mb-1">{isPass ? "SUCCESS" : "FAILED"}</h2>
          <p className="text-white/90 text-center px-6 mt-2 font-medium">
            {result.reason} {/* 프롬프트의 "reason" 표시 */}
          </p>

          <Button
            variant="ghost"
            className="mt-6 text-white hover:bg-white/20 border border-white/30 gap-2"
            onClick={() => setShowFeedback(!showFeedback)}
          >
            {showFeedback ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showFeedback ? "결과 요약 보기" : "상세 피드백 및 모범답안 확인"}
          </Button>
        </div>

        {/* 2. 상세 피드백 영역 */}
        {/* 2. 상세 피드백 영역 */}
        {showFeedback && (
          /* flex-1과 overflow-hidden으로 부모가 늘어나는 걸 막고 내부 스크롤을 유도합니다 */
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="overflow-y-auto p-6 animate-in slide-in-from-top duration-300 custom-scrollbar">
              {/* 💡 h-[500px] 같은 고정 높이 대신, 내용이 모달을 뚫고 나가지 않게 조절 */}
              <div className="space-y-6 text-sm pb-12 pr-2">
                <div className="grid gap-4">
                  <section>
                    <h4 className="font-bold mb-2 text-blue-500 flex items-center gap-1 text-base">
                      <Lightbulb size={16} /> 형식 및 로직 피드백
                    </h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 space-y-3 shadow-sm">
                      <p className="leading-relaxed"><span className="font-bold text-slate-500 mr-2">[형식]</span> {result.feedback.format}</p>
                      <p className="leading-relaxed"><span className="font-bold text-slate-500 mr-2">[로직]</span> {result.feedback.logic}</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-bold mb-2 text-amber-500 flex items-center gap-1 text-base">
                      <Lightbulb size={16} /> 최적화 제안 (Efficiency)
                    </h4>
                    <p className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 leading-relaxed text-slate-700 dark:text-slate-300">
                      {result.feedback.efficiency}
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold mb-2 text-green-600 dark:text-green-400 flex items-center gap-1 text-base">
                      <Code2 size={16} /> CodeLab 추천 모범 답안
                    </h4>
                    <div className="relative group">
                      <pre className="p-5 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-normal shadow-inner whitespace-pre">
                        <code>{result.solution}</code>
                      </pre>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}