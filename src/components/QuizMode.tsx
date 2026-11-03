import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Timer, CheckCircle, ChevronRight, ChevronLeft, RotateCcw, Award } from 'lucide-react';

interface QuizModeProps {
  questions: Question[];
  onExitQuiz: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ questions, onExitQuiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(questions.length * 60); // 1 min per question

  useEffect(() => {
    if (isSubmitted || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, secondsLeft]);

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-amber-200 rounded-3xl text-slate-900">
        <h3 className="text-lg font-bold mb-2">कोई प्रश्न उपलब्ध नहीं है</h3>
        <button onClick={onExitQuiz} className="px-4 py-2 bg-[#FF9933] text-white text-xs font-bold rounded-xl">
          वापस जाएं
        </button>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, questions.length - 1));
  const currentQ = questions[safeIndex] || questions[0];
  const selectedOption = currentQ ? userAnswers[currentQ.id] : undefined;

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted || !currentQ) return;
    setUserAnswers({ ...userAnswers, [currentQ.id]: opt });
  };

  const calculateScore = () => {
    let correct = 0;
    let wrong = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans) {
        if (ans === q.answerKey) correct++;
        else wrong++;
      }
    });
    const score = correct * 2 - wrong * 0.66; // UP PCS Pattern (+2 for right, -0.66 for wrong)
    return { correct, wrong, totalAttempted: Object.keys(userAnswers).length, score: Math.max(0, Number(score.toFixed(2))) };
  };

  const scoreData = calculateScore();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 font-hind text-slate-900">
      
      {/* Top Test Navigation Bar */}
      <div className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 bg-[#FF9933]/15 text-[#ea580c] rounded-lg border border-[#FF9933]/30">
            प्रश्न {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            {currentQ.category}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-[#fff7ed] px-3 py-1.5 rounded-xl border border-amber-200">
          <Timer className="w-4 h-4 text-[#FF9933] animate-pulse" />
          <span className="text-xs font-bold text-[#b45309] font-mono">
            {formatTime(secondsLeft)}
          </span>
        </div>

        <button
          onClick={onExitQuiz}
          className="text-xs text-slate-500 hover:text-slate-800 underline transition font-medium"
        >
          परीक्षण समाप्त करें (Exit)
        </button>
      </div>

      {/* Main Test Card */}
      {!isSubmitted ? (
        <div className="bg-white border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          
          <h2 className="text-lg font-bold text-slate-900 leading-relaxed font-devanagari">
            Q{currentIndex + 1}. {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3 font-devanagari">
            {[
              { code: 'A', text: currentQ.optionA },
              { code: 'B', text: currentQ.optionB },
              { code: 'C', text: currentQ.optionC },
              { code: 'D', text: currentQ.optionD },
            ].map((opt) => {
              const isSelected = selectedOption === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => handleSelectOption(opt.code as any)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-amber-50 border-[#FF9933] text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${isSelected ? 'bg-[#FF9933] text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {opt.code}
                    </span>
                    <span className="text-sm">{opt.text}</span>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-[#FF9933]" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Prev / Next Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" /> पिछला
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => setIsSubmitted(true)}
                className="px-6 py-2 bg-[#138808] hover:bg-[#0f6b06] text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                परीक्षण जमा करें (Submit Test)
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 bg-[#FF9933] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md transition"
              >
                अगला <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Test Results & Performance Analytics */
        <div className="bg-white border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-[#FF9933] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-outfit">परीक्षण परिणाम (Test Results)</h2>
            <p className="text-xs text-slate-600">BRIGHT CAMPUS BHADOHI - UP PCS Mock Test Report</p>
          </div>

          {/* Score Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-[#fff7ed] border border-amber-200">
              <p className="text-[10px] text-slate-600 font-bold uppercase">प्राप्तांक (Total Marks)</p>
              <p className="text-2xl font-black text-[#FF9933] mt-1">{scoreData.score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-[10px] text-[#138808] font-bold uppercase">सही उत्तर (Correct)</p>
              <p className="text-2xl font-black text-[#138808] mt-1">{scoreData.correct}</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <p className="text-[10px] text-rose-600 font-bold uppercase">गलत उत्तर (Wrong)</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{scoreData.wrong}</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
              <p className="text-[10px] text-[#000080] font-bold uppercase">प्रयास किए (Attempted)</p>
              <p className="text-2xl font-black text-[#000080] mt-1">{scoreData.totalAttempted} / {questions.length}</p>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">प्रश्नों की समीक्षा एवं व्याख्या (Question Review):</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 font-devanagari">
              {questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isRight = userAns === q.answerKey;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      isRight
                        ? 'bg-emerald-50 border-emerald-300'
                        : userAns
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 text-sm">
                        Q{idx + 1}. {q.question}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isRight ? 'bg-[#138808] text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {isRight ? 'सही' : userAns ? 'गलत' : 'अनुत्तरित'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>A) {q.optionA}</div>
                      <div>B) {q.optionB}</div>
                      <div>C) {q.optionC}</div>
                      <div>D) {q.optionD}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">आपका उत्तर: <b className="text-slate-900">{userAns || 'कोई नहीं'}</b></span>
                      <span className="text-[#138808] font-bold">सही उत्तर: ({q.answerKey})</span>
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-sm font-bold text-[#138808] leading-relaxed">
                        <span className="font-extrabold text-[#138808] block mb-0.5">व्याख्या (Explanation):</span>
                        <span className="text-[#138808] font-bold">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setUserAnswers({});
                setSecondsLeft(questions.length * 60);
              }}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" /> पुनः प्रयास करें (Retake)
            </button>
            <button
              onClick={onExitQuiz}
              className="px-6 py-2 bg-[#FF9933] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              मुख्य स्टूडियो में लौटें
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
