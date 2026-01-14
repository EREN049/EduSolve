
import React from 'react';
import { ExerciseSolution } from '../types';

interface ExerciseResultProps {
  solution: ExerciseSolution;
  themeColor: string;
  onReset: () => void;
}

const ExerciseResult: React.FC<ExerciseResultProps> = ({ solution, themeColor, onReset }) => {
  const isArabic = solution.language === 'ar';
  
  const formatMathContent = (text: string | undefined) => {
    if (!text || text === "null") return <span className="text-slate-400 dark:text-slate-600 italic">بيانات غير متوفرة</span>;
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathContent = part.slice(2, -2).trim();
        try {
          const html = (window as any).katex.renderToString(mathContent, { displayMode: true, throwOnError: false });
          return <div key={index} className="math-block overflow-x-auto hide-scrollbar my-4" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) { return <code key={index}>Math Error</code>; }
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1).trim();
        try {
          const html = (window as any).katex.renderToString(mathContent, { displayMode: false, throwOnError: false });
          return <span key={index} className="inline-math px-1 align-middle" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) { return <code key={index}>Math Error</code>; }
      }
      return <span key={index} className="whitespace-pre-wrap leading-relaxed">{part}</span>;
    });
  };

  return (
    <div className="w-full animate-spring-up">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-16 -mt-16 opacity-60"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-5 py-1.5 rounded-full text-[10px] font-black text-white" style={{ backgroundColor: themeColor }}>{solution.subject}</span>
            <span className="px-5 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{solution.level}</span>
            <span className={`px-5 py-1.5 rounded-full text-[10px] font-bold ${solution.allSolved ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>تغطية: {solution.questions.length}/{solution.totalQuestionsFound}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{solution.mainIdea}</h2>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mb-10">
        <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800/30">ورقة التحرير النموذجية</div>
      </div>

      <div className="space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
        {solution.questions.map((q, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm relative overflow-hidden ${q.status === 'unreadable' ? 'border-amber-100 opacity-80' : 'border-slate-100 dark:border-slate-800'}`}>
            <div className="absolute top-0 right-0 w-1.5 h-full opacity-30" style={{ backgroundColor: q.status === 'unreadable' ? '#f59e0b' : themeColor }}></div>
            <div className="flex gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 dark:bg-indigo-600 text-white text-lg font-black shadow-lg">{q.number}</div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-600 dark:text-slate-400 font-bold mb-6 text-sm italic leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">{q.text}</div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6"></div>
                <div className="text-slate-900 dark:text-white text-xl font-bold leading-relaxed">{formatMathContent(q.examAnswer)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseResult;
