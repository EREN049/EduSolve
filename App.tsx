
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ExerciseResult from './components/ExerciseResult';
import { AppState, SolveMode, HistoryItem, ExerciseSolution, AppTheme } from './types';
import { solveExercise, explainConcept } from './services/geminiService';

const THEMES: AppTheme[] = [
  { name: 'البنفسجي الملكي', primary: '#4f46e5', surface: '#fdfbff', container: '#f3f0f9' },
  { name: 'الأزرق الأطلسي', primary: '#0284c7', surface: '#f0f9ff', container: '#e0f2fe' },
  { name: 'الأخضر الغابوي', primary: '#059669', surface: '#f0fdf4', container: '#dcfce7' },
  { name: 'الأسود الأنيق', primary: '#18181b', surface: '#fafafa', container: '#f4f4f5' }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState & { showConceptInput: boolean, conceptText: string }>({
    image: null,
    loading: false,
    solution: null,
    error: null,
    mode: SolveMode.FAST_EXAM,
    history: [],
    theme: THEMES[0],
    activeTab: 'solve',
    isDarkMode: localStorage.getItem('theme') === 'dark',
    showConceptInput: false,
    conceptText: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.isDarkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [state.isDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--m3-primary', state.theme.primary);
    const saved = localStorage.getItem('edusolve_v8_history');
    if (saved) try { setState(prev => ({ ...prev, history: JSON.parse(saved) })); } catch(e) {}
  }, [state.theme]);

  const addToHistory = (image: string | null, solution: ExerciseSolution) => {
    const newItem = { id: Date.now().toString(), timestamp: Date.now(), image: image || '', solution };
    const newHistory = [newItem, ...state.history].slice(0, 20);
    setState(prev => ({ ...prev, history: newHistory }));
    localStorage.setItem('edusolve_v8_history', JSON.stringify(newHistory));
  };

  const processImage = async (base64: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, image: base64, solution: null }));
    try {
      const result = await solveExercise(base64, state.mode);
      setState(prev => ({ ...prev, solution: result, loading: false }));
      addToHistory(base64, result);
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleConceptSubmit = async () => {
    if (!state.conceptText.trim()) return;
    setState(prev => ({ ...prev, loading: true, showConceptInput: false, solution: null, error: null }));
    try {
      const result = await explainConcept(state.conceptText);
      setState(prev => ({ ...prev, solution: result, loading: false, conceptText: '' }));
      addToHistory(null, result);
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => processImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetAll = () => setState(p => ({ ...p, solution: null, image: null, activeTab: 'solve', error: null }));

  const getIndicatorPosition = () => {
    if (state.activeTab === 'solve') return '1%';
    if (state.activeTab === 'history') return '34%';
    return '67%';
  };

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500 bg-[#fdfbff] dark:bg-slate-950" dir="rtl">
      <Header onOpenSettings={() => setState(p => ({...p, activeTab: 'settings'}))} />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-40">
        {state.activeTab === 'solve' && (
          <div className="max-w-xl mx-auto">
            {!state.solution && !state.loading && (
              <div className="space-y-8 animate-spring-up py-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">مساء الجد والاجتهاد 🚀</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">اختر تمرينك أو اسأل عن مفهوم غامض.</p>
                </div>

                <div className="grid gap-5">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="group bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6 shadow-lg shadow-slate-200/50 dark:shadow-none active:scale-95 transition-all">
                    <div className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center bg-indigo-600 text-white shadow-xl group-hover:rotate-6 duration-500">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">اختر التمرين من المعرض</h3>
                  </button>

                  <button onClick={() => setState(p => ({...p, showConceptInput: true}))}
                    className="group bg-slate-900 dark:bg-indigo-600/10 p-7 rounded-[2.5rem] flex items-center gap-6 border border-slate-800 dark:border-indigo-600/30 hover:bg-slate-800 active:scale-95 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl group-hover:scale-110 duration-300">💡</div>
                    <div className="text-right">
                      <h4 className="text-lg font-black text-white">مفسر المفاهيم الذكي</h4>
                      <p className="text-xs text-white/50 font-medium">اشرح لي مبرهنة، قاعدة، أو قانون..</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {state.showConceptInput && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">ما هو المفهوم الذي تريد شرحه؟</h3>
                  <textarea 
                    value={state.conceptText}
                    onChange={(e) => setState(p => ({...p, conceptText: e.target.value}))}
                    placeholder="مثال: مبرهنة فيتاغورس، قانون أوم، الأعداد العقدية..."
                    className="w-full h-32 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 ring-indigo-500 text-slate-800 dark:text-white font-bold text-sm resize-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={handleConceptSubmit} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">اشرح لي</button>
                    <button onClick={() => setState(p => ({...p, showConceptInput: false}))} className="px-6 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-bold">إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {state.loading && (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">جاري تحضير الإجابة...</h2>
              </div>
            )}

            {state.solution && !state.loading && (
              <ExerciseResult solution={state.solution} themeColor={state.theme.primary} onReset={resetAll} />
            )}
            
            {state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 text-center mt-10">
                <p className="text-red-700 dark:text-red-400 font-black">{state.error}</p>
                <button onClick={() => setState(p => ({...p, error: null}))} className="mt-4 px-6 py-2 bg-white dark:bg-slate-800 text-red-600 rounded-full text-xs font-bold shadow-sm">إغلاق</button>
              </div>
            )}
          </div>
        )}

        {state.activeTab === 'history' && (
           <div className="max-w-xl mx-auto space-y-6">
              <h2 className="text-2xl font-black px-2">السجل الدراسي</h2>
              {state.history.length === 0 ? <p className="text-center py-20 text-slate-400">لا يوجد سجل حالياً</p> : 
                state.history.map(h => (
                  <button key={h.id} onClick={() => setState(p => ({...p, activeTab: 'solve', solution: h.solution, image: h.image}))}
                    className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 text-right">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">📝</div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm">{h.solution.mainIdea}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{h.solution.subject}</p>
                    </div>
                  </button>
                ))
              }
           </div>
        )}

        {state.activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-black px-2">الإعدادات</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
              <button onClick={() => setState(p => ({...p, isDarkMode: !p.isDarkMode}))} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="font-bold">الوضع الليلي</span>
                <div className={`w-12 h-6 rounded-full relative ${state.isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.isDarkMode ? 'left-1' : 'left-7'}`}></div>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-[100] pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-sm glass-nav rounded-[2.5rem] shadow-2xl p-2">
          <div className="flex items-center h-14 relative overflow-hidden rounded-[2rem]">
            <div className="absolute h-11 bg-slate-900 dark:bg-white rounded-2xl transition-all duration-500 z-0" 
              style={{ width: '32%', right: getIndicatorPosition() }}
            ></div>

            {[
              { id: 'solve', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'الرئيسية' },
              { id: 'history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'السجل' },
              { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'الإعدادات' }
            ].map(tab => (
              <button key={tab.id} onClick={() => {
                if (tab.id === 'solve' && state.solution) resetAll();
                else setState(p => ({...p, activeTab: tab.id as any}));
              }}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center transition-all h-full ${state.activeTab === tab.id ? 'text-white dark:text-slate-900' : 'text-slate-400 hover:text-indigo-400'}`}>
                {tab.id === 'solve' && state.solution ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon}/></svg>
                )}
                {state.activeTab === tab.id && <span className="text-[8px] font-black mt-1 uppercase">{(tab.id === 'solve' && state.solution) ? 'تمرين جديد' : tab.label}</span>}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
    </div>
  );
};

export default App;
