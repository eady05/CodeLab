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
        {showFeedback && (
          <ScrollArea className="max-h-[600px] p-6 animate-in slide-in-from-top duration-300">
            <div className="space-y-6 text-sm pb-10">
              {/* 피드백 3종 세트 */}
              <div className="grid gap-4">
                <section>
                  <h4 className="font-bold mb-2 text-blue-500 flex items-center gap-1">
                    <Lightbulb size={14} /> 형식 및 로직 피드백
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border dark:border-slate-700 space-y-2">
                    <p><span className="font-semibold text-slate-500">[형식]</span> {result.feedback.format}</p>
                    <p><span className="font-semibold text-slate-500">[로직]</span> {result.feedback.logic}</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-bold mb-2 text-amber-500 flex items-center gap-1">
                    <Lightbulb size={14} /> 최적화 제안 (Efficiency)
                  </h4>
                  <p className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-100 dark:border-amber-900/30">
                    {result.feedback.efficiency}
                  </p>
                </section>

                {/* 3. 모범 답안 (프롬프트의 solution 활용) */}
                <section>
                  <h4 className="font-bold mb-2 text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Code2 size={14} /> CodeLab 추천 모범 답안
                  </h4>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto">
                    <code>{result.solution}</code>
                  </pre>
                </section>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}