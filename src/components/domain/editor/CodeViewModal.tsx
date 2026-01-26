"use client";

import { useState, useEffect } from "react";
import { Code2, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useMountedTheme } from "@/hooks/use-mounted-theme";
import { LANGUAGES } from "@/lib/editor-config";

interface CodeViewModalProps {
  code: string;
  title: string;
  language: string;
}

export default function CodeViewModal({ code, title, language }: CodeViewModalProps) {
  const { theme, mounted } = useMountedTheme();
  // 소문자로 변환해서 매핑 (데이터 불일치 방지)
  const langKey = language.toLowerCase() as keyof typeof LANGUAGES;
  const extension = LANGUAGES[langKey]?.extension || LANGUAGES.javascript.extension;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("코드가 복사되었습니다!");
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-blue-500 font-medium transition-colors">
          코드 보기
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] md:max-w-[1200px] lg:max-w-[1400px] w-[95vw] max-h-[90vh] bg-white dark:bg-[#1e1e1e] border-slate-200 dark:border-slate-800 p-0 overflow-hidden flex flex-col shadow-2xl transition-all">

        {/* 헤더 부분 패딩을 조금 더 줘서 시원하게 */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-blue-500" />
            <DialogTitle className="text-slate-900 dark:text-slate-200 font-mono text-lg">
              {title} <span className="text-slate-400 font-normal ml-2 text-sm uppercase">({language})</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* 코드 영역: h-full과 w-full을 명확히 */}
        <div className="flex-1 w-full overflow-auto bg-[#1e1e1e]">
          {mounted ? (
            <CodeMirror
              value={code || "작성된 코드가 없습니다."}
              theme={theme === "light" ? vscodeLight : oneDark}
              height="100%"
              // 뷰어 모드이므로 편집 불가 설정
              readOnly={true}
              editable={false}
              extensions={[extension]}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
              }}
              className="text-base font-mono"
            />
          ) : (
            <div className="p-6 text-slate-400 font-mono text-sm">Loading code...</div>
          )}
        </div>

        <DialogFooter className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#252526]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-500"
          >
            <Copy size={14} />
            코드 복사
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}