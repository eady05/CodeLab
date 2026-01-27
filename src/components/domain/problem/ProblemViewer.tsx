'use client';

interface ProblemData {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
}

interface ProblemViewerProps {
  problemId: string;
  data: ProblemData | null;
  isLoading: boolean;
}

import { ExternalLink } from "lucide-react";

export default function ProblemViewer({ problemId, data, isLoading }: ProblemViewerProps) {
  if (isLoading) {
    return <div className="p-6 text-slate-500 animate-pulse">문제를 가져오는 중...</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-slate-500 flex flex-col items-center justify-center h-full border-dashed border-2 border-slate-800 m-4 rounded-lg">
        <p>문제 번호를 입력하고 '가져오기'를 눌러주세요.</p>
      </div>
    );
  }
  const problemUrl = `https://www.acmicpc.net/problem/${problemId}`;

  return (
    <div className="p-6 overflow-y-auto h-full bg-white dark:bg-slate-900/30 selection:bg-blue-500/30 transition-colors">
      {/* 제목 및 링크 영역 */}
      <div className="mb-8">
        {/* # 번호와 링크를 한 줄에 배치 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-600 dark:text-blue-500 font-mono text-sm block"># {problemId}</span>

          {problemUrl && (
            <a
              href={problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-slate-400 hover:text-blue-500 transition-colors"
              title="백준에서 문제 보기"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {data.title}
        </h2>
      </div>
      <div className="space-y-10 pb-20">
        {/* 반복되는 섹션 구조를 위해 helper 적용 */}
        {[
          { title: "Description", content: data.description },
          { title: "Input", content: data.inputDescription },
          { title: "Output", content: data.outputDescription },
          { title: "Sample Input", content: data.sampleInput, isSampel: true },
          { title: "Sample Output", content: data.sampleOutput, isSampel: true }
        ].map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
              {section.title}
            </h3>
            {section.isSampel ? (
              /* ✅ 예제 입출력을 위한 전용 스타일 */
              <pre className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {section.content}
              </pre>
            ) : (
              /* 일반 설명 텍스트 */
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}