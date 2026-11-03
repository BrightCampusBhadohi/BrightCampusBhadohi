import React, { useState, useMemo } from 'react';
import { X, BookOpen, CheckCircle2, Search, Calculator, ArrowRight, Lightbulb, Layers, Bookmark, Hash } from 'lucide-react';
import { MATH_1000_FORMULAS, FormulaItem } from '../data/mathFormulasBank';

interface MathsFormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathsFormulasModal: React.FC<MathsFormulasModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(25);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(MATH_1000_FORMULAS.map(item => item.category)))];
  }, []);

  const filteredData = useMemo(() => {
    return MATH_1000_FORMULAS.filter(item => {
      const matchesSearch = searchTerm === '' ||
                            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.shortcutFormula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.exampleQuestion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const visibleFormulas = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 25);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-amber-300 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden font-hind">
        
        {/* Top Title Banner */}
        <div className="bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] p-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shrink-0">
              <Calculator className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-outfit uppercase tracking-wide flex items-center gap-2">
                1,000 गणित सूत्र व आसान ट्रिक्स
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">
                  {filteredData.length} सूत्र उपलब्ध
                </span>
              </h2>
              <p className="text-xs text-amber-100 font-hind font-semibold">
                कठिन CSAT, UP PCS व प्रतियोगी परीक्षाओं के प्रश्नों को चुटकी में हल करने वाली गाइड
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:p-4 bg-amber-50/80 border-b border-amber-200 flex flex-col gap-3 shrink-0">
          
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="सूत्र, टॉपिक या प्रश्न खोजें (जैसे: Time & Work, CI SI अंतर, इकाई अंक, त्रिकोणमिति)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(25);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-bold text-[#000080]">
              <span>कठिनाई:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setVisibleCount(25);
                }}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">सभी स्तर (All Levels)</option>
                <option value="Very Hard">अत्यंत कठिन (Very Hard)</option>
                <option value="Hard">कठिन (Hard)</option>
                <option value="Medium">मध्यम (Medium)</option>
              </select>
            </div>
          </div>

          {/* Category Quick Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(25);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#000080] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {cat === 'all' ? `सभी विषय (1,000)` : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Formula Cards Grid / Feed */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 font-hind flex-1">
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-base font-bold text-slate-700">कोई सूत्र नहीं मिला</p>
              <p className="text-xs text-slate-400 mt-1">कृपया कोई अन्य विषय या शब्द खोजें।</p>
            </div>
          ) : (
            <>
              {visibleFormulas.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition relative overflow-hidden"
                >
                  {/* Left Accent Bar */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FF9933] via-[#000080] to-[#138808]"></div>

                  {/* Header Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-[#ea580c] text-[11px] font-black border border-amber-300">
                        {item.category}
                      </span>
                      {item.difficulty === 'Very Hard' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-300">
                          अत्यंत कठिन (Very Hard)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {item.id}
                    </span>
                  </div>

                  {/* Formula Title */}
                  <h3 className="text-base sm:text-lg font-black text-[#000080] mb-3 pl-2 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#FF9933] shrink-0" />
                    {item.title}
                  </h3>

                  {/* Formula Grid Highlight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Shortcut Formula Box */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl p-3 shadow-xs">
                      <span className="text-[11px] font-black text-[#138808] uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> डायरेक्ट शॉर्टकट सूत्र (Shortcut Formula)
                      </span>
                      <p className="text-sm sm:text-base font-black text-emerald-950 font-mono bg-white/90 p-2.5 rounded-lg border border-emerald-200">
                        {item.shortcutFormula}
                      </p>
                    </div>

                    {/* Standard Formula Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        मानक विधि सूत्र (Standard Formula)
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                        {item.standardFormula}
                      </p>
                    </div>
                  </div>

                  {/* Practical Example & Easy Solution */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 mb-2.5 space-y-2">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                      <span className="text-[#FF9933] font-black">उदाहरण प्रश्न: </span>
                      {item.exampleQuestion}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-[#138808] bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                      <span className="text-[#000080] font-black">चुटकी में हल (Easy Trick): </span>
                      {item.easySolution}
                    </div>
                  </div>

                  {/* Pro Trick Tip */}
                  <div className="flex items-start gap-2 bg-blue-50/90 border border-blue-200 p-2.5 rounded-xl text-xs text-blue-900 font-semibold">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[#000080]">स्मार्ट ट्रिक टिप: </span>
                      {item.trickTip}
                    </div>
                  </div>

                </div>
              ))}

              {/* Load More Button */}
              {visibleCount < filteredData.length && (
                <div className="text-center pt-4 pb-2">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#FF9933] to-[#ea580c] hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer active:scale-95 inline-flex items-center gap-2"
                  >
                    <span>और 25 सूत्र लोड करें ({filteredData.length - visibleCount} शेष)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-amber-50 border-t border-amber-200 flex flex-wrap items-center justify-between text-xs text-slate-700 font-bold shrink-0 gap-2">
          <span>ब्राइट कैंपस भदोही - 1,000 गणित सूत्र व आसान ट्रिक्स हैंडबुक</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">दिखाए जा रहे हैं: {visibleFormulas.length} / {filteredData.length} सूत्र</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#000080] hover:bg-blue-900 text-white rounded-xl font-bold transition shadow-sm active:scale-95 cursor-pointer"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
