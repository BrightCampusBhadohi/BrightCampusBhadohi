import React from 'react';
import { Question } from '../types';
import { Edit3, Copy, Trash2, ArrowUp, ArrowDown, CheckCircle2, Bookmark, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  totalCount: number;
  onEdit: (q: Question) => void;
  onDuplicate: (q: Question) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleBookmark?: (id: string) => void;
  showAnswers?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalCount,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleBookmark,
  showAnswers = true
}) => {
  const [showExp, setShowExp] = React.useState(false);

  return (
    <div className="bg-white border border-amber-200 hover:border-[#FF9933]/60 rounded-2xl p-5 shadow-sm transition group text-slate-900">
      
      {/* Top Bar: Question Index, Category, Exam Tag & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-7 h-7 rounded-lg bg-[#FF9933]/15 text-[#ea580c] font-black text-xs flex items-center justify-center border border-[#FF9933]/30">
            Q{index + 1}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#138808]/10 text-[#138808] font-bold border border-[#138808]/20">
            {question.category}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#000080] border border-indigo-200 font-bold">
            {question.examFocus}
          </span>
          {question.difficulty === 'Very Hard' && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 font-bold">
              🔥 अत्यंत कठिन
            </span>
          )}
          {question.code && (
            <span className="text-[10px] text-slate-400 font-mono">
              #{question.code}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(question.id)}
              className={`p-1.5 rounded-lg text-xs transition ${question.bookmarked ? 'text-[#FF9933] bg-amber-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Bookmark question"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="ऊपर भेजें (Move Up)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalCount - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="नीचे भेजें (Move Down)"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDuplicate(question)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF9933] hover:bg-amber-50 transition"
            title="कॉपी बनाएं (Duplicate)"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(question)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#138808] hover:bg-emerald-50 transition"
            title="संपादित करें (Edit)"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="हटाएं (Delete)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Statement */}
      <h3 className="text-base font-bold text-slate-900 mb-4 leading-relaxed font-devanagari whitespace-pre-line">
        Q{index + 1}. {question.question}
      </h3>

      {/* Options Grid (A, B, C, D) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4 font-devanagari">
        {[
          { code: 'A', text: question.optionA },
          { code: 'B', text: question.optionB },
          { code: 'C', text: question.optionC },
          { code: 'D', text: question.optionD },
        ].map((opt) => {
          const isCorrect = showAnswers && question.answerKey === opt.code;
          return (
            <div
              key={opt.code}
              className={`p-3 rounded-xl border text-sm flex items-start gap-3 transition ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                  isCorrect
                    ? 'bg-[#138808] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                ({opt.code.toLowerCase()})
              </span>
              <span className="pt-0.5 leading-snug">{opt.text}</span>
              {isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-[#138808] ml-auto shrink-0 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Answer Key & Explanation Toggle */}
      <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">सही उत्तर:</span>
          <span className="font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            विकल्प ({question.answerKey.toLowerCase()})
          </span>
        </div>

        {question.explanation && (
          <button
            onClick={() => setShowExp(!showExp)}
            className="text-[#138808] hover:text-[#0f6b06] flex items-center gap-1 font-bold transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showExp ? 'व्याख्या छिपाएं' : 'चरणबद्ध व्याख्या देखें'}
            {showExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Explanation Box (Bada Green Text) */}
      {showExp && question.explanation && (
        <div className="mt-3 p-4 rounded-xl bg-emerald-50 border-2 border-[#138808]/40 text-sm text-[#138808] leading-relaxed font-devanagari space-y-1 shadow-xs">
          <p className="font-extrabold text-[#138808] text-base flex items-center gap-1.5 mb-1">
            📌 उत्तर व्याख्या (Step-by-step Hindi Explanation):
          </p>
          <p className="text-sm font-bold text-[#138808] leading-relaxed">{question.explanation}</p>
        </div>
      )}

    </div>
  );
};
