'use client';

interface ProblemData {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
}

interface ProblemViewerProps {
  problemId: string;
  data: ProblemData | null;
  isLoading: boolean;
}

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

  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-900/30 selection:bg-blue-500/30">
      <div className="mb-8">
        <span className="text-blue-500 font-mono text-sm mb-1 block"># {problemId}</span>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{data.title}</h2>
      </div>

      <div className="space-y-10 pb-20">
        {/* 문제 설명 */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Description</h3>
          <div
            className="prose prose-invert max-w-none text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </section>

        {/* 입력 조건 */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Input</h3>
          <div
            className="prose prose-invert max-w-none text-slate-300"
            dangerouslySetInnerHTML={{ __html: data.inputDescription }}
          />
        </section>

        {/* 출력 조건 */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Output</h3>
          <div
            className="prose prose-invert max-w-none text-slate-300"
            dangerouslySetInnerHTML={{ __html: data.outputDescription }}
          />
        </section>
      </div>
    </div>
  );
}