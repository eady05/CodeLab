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
    <div className="p-6 overflow-y-auto h-full bg-white dark:bg-slate-900/30 selection:bg-blue-500/30 transition-colors">
      <div className="mb-8">
        <span className="text-blue-600 dark:text-blue-500 font-mono text-sm mb-1 block"># {problemId}</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{data.title}</h2>
      </div>

      <div className="space-y-10 pb-20">
        {/* 반복되는 섹션 구조를 위해 helper 적용 */}
        {[
          { title: "Description", content: data.description },
          { title: "Input", content: data.inputDescription },
          { title: "Output", content: data.outputDescription }
        ].map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
              {section.title}
            </h3>
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed 
                     prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                     prose-code:text-blue-600 dark:prose-code:text-blue-400
                     prose-code:bg-slate-100 dark:prose-code:bg-slate-800/50
                     prose-code:px-1 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}