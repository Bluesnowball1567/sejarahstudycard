import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X, ArrowLeft, RotateCcw, Trophy, Home, Loader2 } from 'lucide-react';

// 注意：这里移除了无效的 @tailwindcss/vite 和 autoprefixer 导入，这些会导致 JS 报错。

const SYLLABUS = {
  form4: {
    title: "马来西亚高中中四 (Form 4)",
    chapters: [
      "Warisan Negara Bangsa", "Kebangkitan Nasionalisme", "Konflik Dunia dan Pendudukan Jepun",
      "Era Pentadbiran Britania", "Persekutuan Tanah Melayu 1948", "Ancaman Komunis dan Perisytiharan Darurat",
      "Usaha ke Arah Kemerdekaan", "Pilihan Raya", "Perlembagaan Persekutuan Tanah Melayu 1957", "Pemasyhuran Kemerdekaan"
    ]
  },
  form5: {
    title: "马来西亚高中中五 (Form 5)",
    chapters: [
      "Kedaulatan Negara", "Perlembagaan Persekutuan", "Raja Berperlembagaan dan Demokrasi Berparlimen",
      "Sistem Persekutuan", "Pembentukan Malaysia", "Cabaran Selepas Pembentukan Malaysia",
      "Membina Kesejahteraan Negara", "Membina Kemakmuran Negara", "Dasar Luar Malaysia", "Kecemerlangan Malaysia di Persada Dunia"
    ]
  }
};

const App = () => {
  const [page, setPage] = useState('home'); 
  const [questionsDb, setQuestionsDb] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [unitName, setUnitName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores] = useState([]); 

// App.jsx 里的 useEffect 修改为：
useEffect(() => {
  const loadData = async () => {
    try {
      // 完美适配本地和 GitHub Pages 的绝对路径获取方式
      const jsonPath = `${import.meta.env.BASE_URL}data.json`;
      
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const dataJson = await response.json();
      setQuestionsDb(dataJson);
    } catch (err) {
      console.error("Failed to fetch data.json:", err);
      setQuestionsDb({});
    } finally {
      setIsLoading(false);
    }
  };
  
  loadData();
}, []);

  const currentQuestions = useMemo(() => {
    if (!activeUnitId || !questionsDb[activeUnitId]) {
      return [{ q: "此单元题目尚未准备好", a: "请检查 data.json 是否包含此单元。" }];
    }
    return questionsDb[activeUnitId];
  }, [questionsDb, activeUnitId]);

  const handleNext = (isCorrect = null) => {
    let newScores = [...scores];
    if (isCorrect !== null) {
      newScores[currentIndex] = isCorrect;
      setScores(newScores);
    }
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setPage('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const startStudy = (form, index, name) => {
    setActiveUnitId(`${form}-${index + 1}`);
    setUnitName(name);
    setCurrentIndex(0);
    setScores([]);
    setShowAnswer(false);
    setPage('study');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (page === 'home') {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-6 md:p-12 font-sans">
        <header className="max-w-5xl mx-auto mb-20 border-l-2 border-black pl-8">
          <h1 className="text-4xl font-light tracking-[0.25em] uppercase leading-tight">Sejarah<br />Flashcards</h1>
          <p className="text-gray-400 text-xs mt-4 tracking-widest uppercase font-bold">SPM Syllabus Reference</p>
        </header>
        <main className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20">
          {Object.entries(SYLLABUS).map(([formKey, data]) => (
            <div key={formKey} className="group">
              <h2 className="text-xs font-black tracking-[0.3em] text-gray-300 uppercase mb-8 group-hover:text-black transition-colors">{data.title}</h2>
              <div className="space-y-1">
                {data.chapters.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => startStudy(formKey, i, name)}
                    className="w-full flex items-center justify-between p-4 border border-transparent border-b-gray-100 hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-4 overflow-hidden">
                      <span className="text-[10px] font-mono opacity-50">{(i + 1).toString().padStart(2, '0')}</span>
                      <span className="text-sm truncate font-medium uppercase tracking-tight">{name}</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (page === 'result') {
    const correctCount = scores.filter(s => s === true).length;
    const totalCount = currentQuestions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-8 animate-in zoom-in duration-500">
          <Trophy size={48} className="mx-auto text-gray-800" />
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-2">Unit Completed</h2>
            <h3 className="text-xl font-light uppercase tracking-tight">{unitName}</h3>
          </div>
          <div className="py-8 border-y border-gray-50">
            <div className="text-5xl font-light mb-2">{percentage}%</div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mastery Level</p>
          </div>
          <button onClick={() => setPage('home')} className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center space-x-3 rounded-sm hover:bg-gray-800 transition-colors">
            <Home size={14} />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="p-6 flex items-center justify-between bg-white border-b border-gray-100">
        <button onClick={() => setPage('home')} className="flex items-center text-gray-400 hover:text-black transition-colors">
          <ArrowLeft size={18} />
          <span className="text-xs font-bold uppercase ml-2 tracking-widest">Back</span>
        </button>
        <div className="text-center">
          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Studying</p>
          <p className="text-xs font-bold uppercase truncate max-w-[150px]">{unitName}</p>
        </div>
        <button onClick={() => { setCurrentIndex(0); setShowAnswer(false); setScores([]); } } className="text-gray-400 hover:text-black">
          <RotateCcw size={16} />
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="w-full relative">
          <button onClick={handlePrev} disabled={currentIndex === 0} className={`absolute -left-20 top-1/2 -translate-y-1/2 p-4 text-gray-200 hover:text-black hidden lg:block ${currentIndex === 0 ? 'opacity-0' : ''}`}>
            <ChevronLeft size={60} strokeWidth={1} />
          </button>
          
          <div 
            onClick={() => setShowAnswer(!showAnswer)} 
            className="w-full aspect-[3/4] md:aspect-[4/3] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-8 text-center cursor-pointer select-none active:scale-95 transition-all duration-300 hover:shadow-md"
          >
            <div className={`mb-10 text-[10px] font-black uppercase tracking-[0.4em] ${showAnswer ? 'text-blue-500' : 'text-gray-300'}`}>
              {showAnswer ? "Answer" : "Question"}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-xl md:text-2xl font-light leading-relaxed ${showAnswer ? 'text-gray-600' : 'text-gray-900'}`}>
                {showAnswer ? currentQuestions[currentIndex].a : currentQuestions[currentIndex].q}
              </p>
            </div>
            <div className="mt-8 text-[9px] text-gray-200 font-bold uppercase tracking-[0.2em]">
              Tap to Flip
            </div>
          </div>

          <button onClick={() => handleNext(null)} disabled={currentIndex === currentQuestions.length - 1} className={`absolute -right-20 top-1/2 -translate-y-1/2 p-4 text-gray-200 hover:text-black hidden lg:block ${currentIndex === currentQuestions.length - 1 ? 'opacity-0' : ''}`}>
            <ChevronRight size={60} strokeWidth={1} />
          </button>
        </div>

        <div className="w-full mt-12 space-y-10">
          <div className="flex justify-between px-2 items-center text-gray-400 font-bold text-[10px] uppercase tracking-tighter">
            <button onClick={handlePrev} className={currentIndex === 0 ? 'invisible' : 'hover:text-black'}>Prev</button>
            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-mono">{currentIndex + 1} / {currentQuestions.length}</span>
            <button onClick={() => handleNext(null)} className={currentIndex === currentQuestions.length - 1 ? 'invisible' : 'hover:text-black'}>Next</button>
          </div>
          <div className="flex justify-center space-x-16">
            <button onClick={() => handleNext(false)} className="group flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-red-500 group-hover:border-red-500 group-hover:bg-red-50 transition-all">
                <X size={24} />
              </div>
              <span className="text-[9px] font-black uppercase text-gray-300 group-hover:text-red-500">Again</span>
            </button>
            <button onClick={() => handleNext(true)} className="group flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-green-500 group-hover:border-green-500 group-hover:bg-green-50 transition-all">
                <Check size={24} />
              </div>
              <span className="text-[9px] font-black uppercase text-gray-300 group-hover:text-green-500">Easy</span>
            </button>
          </div>
        </div>
      </main>
      
      <div className="w-full h-1 bg-gray-100">
        <div 
          className="h-full bg-black transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default App;