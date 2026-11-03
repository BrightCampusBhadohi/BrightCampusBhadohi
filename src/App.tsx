import React, { useState, useEffect, useMemo } from 'react';
import { Question, HeaderConfig, PDFStyleConfig } from './types';
import { CATEGORIES } from './data/questionsData';
import { MASTER_1700_QUESTIONS } from './data/upPcs2026QuestionsBank';
import { VERY_HARD_QUESTIONS } from './data/veryHardQuestions';
import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { PDFPreview } from './components/PDFPreview';
import { HeaderCustomizerModal } from './components/HeaderCustomizerModal';
import { QuestionEditModal } from './components/QuestionEditModal';
import { AIOCRExtractorModal } from './components/AIOCRExtractorModal';
import { QuizMode } from './components/QuizMode';
import { PresetsPanel } from './components/PresetsPanel';
import { MathsFormulasModal } from './components/MathsFormulasModal';
import { Filter, Eye, SlidersHorizontal, KeyRound, X } from 'lucide-react';

// De-duplication helper guaranteeing zero repeated questions in the entire app
export function deduplicateQuestions(list: Question[]): Question[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const result: Question[] = [];

  for (const q of list) {
    if (!q || !q.question) continue;
    // Normalize question text to detect duplicate questions regardless of subtle spacing
    const normalizedText = q.question.trim().replace(/\s+/g, ' ').toLowerCase();
    
    if (seenIds.has(q.id) || seenTexts.has(normalizedText)) {
      continue; // Skip duplicate question
    }
    seenIds.add(q.id);
    seenTexts.add(normalizedText);
    result.push(q);
  }
  return result;
}

export default function App() {
  // Main Questions State - strictly de-duplicated with zero repeated questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('bright_campus_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length >= 50) {
          return deduplicateQuestions([...VERY_HARD_QUESTIONS, ...parsed]);
        }
      } catch (e) { console.error(e); }
    }
    return deduplicateQuestions(MASTER_1700_QUESTIONS);
  });

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('bright_campus_admin') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasswordInput.trim() === 'Ashok@0414') {
      localStorage.setItem('bright_campus_admin', 'true');
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('अमान्य पासवर्ड! कृपया सही एडमिन पासवर्ड दर्ज करें।');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('bright_campus_admin');
    setIsAdmin(false);
    if (activeTab === 'presets' || activeTab === 'ocr') {
      setActiveTab('studio');
    }
    setStudioSubView('pdf-preview');
  };

  // Header Config State
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => {
    const saved = localStorage.getItem('bright_campus_header');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      instituteName: "BRIGHT CAMPUS BHADOHI",
      tagline: "उत्तर प्रदेश लोक सेवा आयोग - समसामयिकी एवं राज्य विशेष अध्ययन केंद्र",
      address: "Chauri Rd, BADI BAGH, Bhadohi, UP",
      contactNumber: "📞 +91 87075 25421",
      docTitle: "UP PCS PRELIMS 2026-2027 TOP MODEL PAPER",
      docSubtitle: "विशेष अभ्यास श्रृंखला - भदोही कैंपस अध्ययन सामग्री",
      examYear: "2026-2027",
      setNumber: "SET-01",
      totalTime: "2 Hours",
      totalMarks: "200 Marks",
      negativeMarking: "1/3rd (-0.66)",
      watermarkText: "BRIGHT CAMPUS BHADOHI",
      showWatermark: true,
      showContactInHeader: true,
      showAddressInHeader: true,
      showExamMetadataLine: false
    };
  });

  // PDF Style Config State
  const [styleConfig, setStyleConfig] = useState<PDFStyleConfig>(() => {
    const saved = localStorage.getItem('bright_campus_style');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, paperTheme: 'plain' };
      } catch (e) { console.error(e); }
    }
    return {
      fontStyle: 'kalam',
      fontWeight: 'bold-900',
      paperTheme: 'plain', // Crisp Clean White Paper
      inkColor: '#1e40af', // Royal Blue
      questionsPerPage: 3, // Mobile optimized 3 Qs per page
      layoutMode: 'portrait-single',
      showAnswerKeyTable: true,
      showInlineExplanations: true,
      fontSize: 'md',
      lineSpacing: 'normal'
    };
  });

  // App Navigation & View Modes
  const [activeTab, setActiveTab] = useState<'studio' | 'quiz' | 'ocr' | 'presets'>('studio');
  const [studioSubView, setStudioSubView] = useState<'pdf-preview' | 'editor-list'>('pdf-preview');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showAnswersInEditor, setShowAnswersInEditor] = useState(true);

  // Modal States
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMathsModalOpen, setIsMathsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('bright_campus_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('bright_campus_header', JSON.stringify(headerConfig));
  }, [headerConfig]);

  useEffect(() => {
    localStorage.setItem('bright_campus_style', JSON.stringify(styleConfig));
  }, [styleConfig]);

  // Filtered Questions list - strictly unique and deduplicated
  const filteredQuestions = useMemo(() => {
    const list = questions.filter((q) => {
      const matchesSearch = searchQuery === '' || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionB.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionC.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionD.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      const matchesExam = selectedExam === 'all' || q.examFocus === selectedExam;
      const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesExam && matchesDifficulty;
    });

    return deduplicateQuestions(list);
  }, [questions, searchQuery, selectedCategory, selectedExam, selectedDifficulty]);

  // Question CRUD handlers
  const handleSaveQuestion = (q: Question) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((item) => item.id === q.id);
      let updated: Question[];
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = q;
        updated = copy;
      } else {
        updated = [q, ...prev];
      }
      return deduplicateQuestions(updated);
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('क्या आप इस प्रश्न को हटाना चाहते हैं?')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleDuplicateQuestion = (q: Question) => {
    const dup: Question = {
      ...q,
      id: `dup-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      code: `${q.code || 'Q'}-COPY`,
      question: `${q.question} (अभ्यास प्रतिलिपि ${Math.floor(Math.random() * 1000)})`
    };
    setQuestions((prev) => deduplicateQuestions([dup, ...prev]));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= questions.length - 1) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleImportOcrQuestions = (imported: Question[]) => {
    setQuestions((prev) => deduplicateQuestions([...imported, ...prev]));
    setActiveTab('studio');
    setStudioSubView('pdf-preview');
  };

  const handleResetInitial = () => {
    if (confirm('क्या आप प्रश्न बैंक को संपूर्ण 1,700 प्रश्नों से रीसेट करना चाहते हैं?')) {
      const unique = deduplicateQuestions(MASTER_1700_QUESTIONS);
      setQuestions(unique);
      localStorage.setItem('bright_campus_questions', JSON.stringify(unique));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7ed] via-[#ffffff] to-[#f0fdf4] text-[#2c1e12] flex flex-col font-hind selection:bg-[#ff9933] selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        questionCount={questions.length}
        onOpenAddModal={() => { setEditingQuestion(null); setIsEditModalOpen(true); }}
        onOpenHeaderModal={() => setIsHeaderModalOpen(true)}
        onExportPDF={() => { setActiveTab('studio'); setStudioSubView('pdf-preview'); }}
        isAdmin={isAdmin}
        onAdminLogout={handleAdminLogout}
        onOpenMathsModal={() => setIsMathsModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: STUDIO (PDF Preview / Editor Feed) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            
            {/* Filter Toolbar in Tan Theme */}
            <div className="bg-white border border-amber-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1.5 bg-[#f8f3ea] px-3 py-1.5 rounded-xl border border-[#d8c5a8] text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-[#2c1e12] focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="all" className="bg-white">सभी विषय (All Topics)</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Exam Focus Dropdown */}
                <div className="flex items-center gap-1.5 bg-[#f8f3ea] px-3 py-1.5 rounded-xl border border-[#d8c5a8] text-xs">
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="bg-transparent text-[#ea580c] font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-white">सभी परीक्षाएं</option>
                    <option value="UP PCS 2026-2027" className="bg-white">UP PCS 2026-2027</option>
                    <option value="UP Special" className="bg-white">UP Special</option>
                    <option value="Army / Defence" className="bg-white">Army / Defence</option>
                    <option value="UPSC GS-1" className="bg-white">UPSC GS-1</option>
                    <option value="UPSC CSAT" className="bg-white">UPSC CSAT</option>
                  </select>
                </div>

                {/* Difficulty Filter Dropdown */}
                <div className="flex items-center gap-1.5 bg-[#f8f3ea] px-3 py-1.5 rounded-xl border border-[#d8c5a8] text-xs">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="bg-transparent text-[#b91c1c] font-black focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-white text-slate-800">सभी स्तर (कठिनाई)</option>
                    <option value="Very Hard" className="bg-white text-red-600 font-black">🔥 अत्यंत कठिन (Very Hard)</option>
                    <option value="Hard" className="bg-white text-amber-700 font-bold">कठिन (Hard)</option>
                    <option value="Medium" className="bg-white text-blue-700">मध्यम (Medium)</option>
                    <option value="Easy" className="bg-white text-green-700">सरल (Easy)</option>
                  </select>
                </div>
              </div>

              {/* Subview Toggle - Only shown for Admin */}
              {isAdmin && (
                <div className="flex items-center bg-[#f8f3ea] p-1 rounded-xl border border-[#d8c5a8] text-xs font-semibold">
                  <button
                    onClick={() => setStudioSubView('pdf-preview')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      studioSubView === 'pdf-preview'
                        ? 'bg-[#FF9933] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> PDF व्यू
                  </button>
                  <button
                    onClick={() => setStudioSubView('editor-list')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      studioSubView === 'editor-list'
                        ? 'bg-[#FF9933] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> प्रश्न एडिटर ({filteredQuestions.length})
                  </button>
                </div>
              )}

            </div>

            {/* SUB-VIEW 1: PDF CANVAS PREVIEW */}
            {studioSubView === 'pdf-preview' && (
              <PDFPreview
                questions={filteredQuestions}
                headerConfig={headerConfig}
                styleConfig={styleConfig}
                onUpdateStyleConfig={setStyleConfig}
                onOpenHeaderModal={() => setIsHeaderModalOpen(true)}
                onEditQuestion={(q) => {
                  setEditingQuestion(q);
                  setIsEditModalOpen(true);
                }}
                onOpenMathsFormulas={() => setIsMathsModalOpen(true)}
                isAdmin={isAdmin}
              />
            )}

            {/* SUB-VIEW 2: QUESTION EDITOR FEED LIST */}
            {studioSubView === 'editor-list' && (
              <div className="space-y-4">
                
                <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold">
                  <span>प्रदर्शित प्रश्न: {filteredQuestions.length} / कुल {questions.length}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAnswersInEditor(!showAnswersInEditor)}
                      className="hover:text-slate-900 underline transition"
                    >
                      {showAnswersInEditor ? 'उत्तर कुंजी छिपाएं' : 'उत्तर कुंजी दिखाएं'}
                    </button>
                    <button
                      onClick={handleResetInitial}
                      className="text-rose-600 hover:underline transition font-bold"
                    >
                      डिफ़ॉल्ट प्रश्न रीसेट करें
                    </button>
                  </div>
                </div>

                {filteredQuestions.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-amber-200 rounded-3xl space-y-3">
                    <p className="text-base font-bold text-slate-900">कोई प्रश्न नहीं मिला</p>
                    <p className="text-xs text-slate-500">खोज या फ़िल्टर बदलें, या नया प्रश्न जोड़ें।</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedExam('all'); }}
                      className="px-4 py-2 bg-[#FF9933] text-xs font-bold text-white rounded-xl shadow-xs"
                    >
                      सभी फ़िल्टर साफ़ करें
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions.map((q, idx) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={idx}
                        totalCount={filteredQuestions.length}
                        onEdit={(item) => { setEditingQuestion(item); setIsEditModalOpen(true); }}
                        onDuplicate={handleDuplicateQuestion}
                        onDelete={handleDeleteQuestion}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        showAnswers={showAnswersInEditor}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* VIEW 2: PRESETS & MODEL PAPERS */}
        {activeTab === 'presets' && (
          <PresetsPanel
            allQuestions={questions}
            onSelectQuestions={(selected) => {
              setQuestions(selected);
              setActiveTab('studio');
              setStudioSubView('pdf-preview');
            }}
            onAddGeneratedQuestions={(generated) => {
              setQuestions((prev) => [...generated, ...prev]);
              setActiveTab('studio');
              setStudioSubView('pdf-preview');
            }}
          />
        )}

        {/* VIEW 3: AI SCANNER & OCR */}
        {activeTab === 'ocr' && (
          <AIOCRExtractorModal
            isOpen={true}
            onClose={() => setActiveTab('studio')}
            onImportQuestions={handleImportOcrQuestions}
          />
        )}

        {/* VIEW 4: ONLINE QUIZ MODE */}
        {activeTab === 'quiz' && (
          <QuizMode
            questions={filteredQuestions.length > 0 ? filteredQuestions : questions}
            onExitQuiz={() => setActiveTab('studio')}
          />
        )}

      </main>

      {/* Header Customizer Modal */}
      <HeaderCustomizerModal
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        config={headerConfig}
        onChange={setHeaderConfig}
      />

      {/* Question Add/Edit Modal */}
      <QuestionEditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingQuestion(null); }}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />

      {/* Footer Branding with subtle, focusable Admin Login trigger */}
      <footer className="mt-auto border-t border-amber-200 bg-[#fff7ed] py-6 px-4 text-center text-xs text-slate-600 font-hind">
        <p className="font-bold text-[#000080]">BRIGHT CAMPUS BHADOHI</p>
        <p className="mt-1">📍 Chauri Rd, BADI BAGH, Bhadohi, UP | 📞 +91 87075 25421</p>

        {/* Discreet Admin Login at the very bottom */}
        <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-center">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-bold font-devanagari shadow-xs">
              <span>👑 प्रशासक सत्र सक्रिय</span>
              <button
                onClick={handleAdminLogout}
                className="text-red-700 underline font-bold hover:text-red-900 cursor-pointer ml-1"
              >
                लॉगआउट करें
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAdminError('');
                setAdminPasswordInput('');
                setIsAdminModalOpen(true);
              }}
              className="opacity-20 hover:opacity-100 focus:opacity-100 text-[10px] text-slate-400 hover:text-[#000080] focus:text-[#000080] outline-none transition-all duration-200 px-2 py-0.5 rounded cursor-pointer font-devanagari select-none"
              title="प्रशासक लॉगिन"
              tabIndex={0}
            >
              🔐 व्यवस्थापक / एडमिन प्रवेश
            </button>
          )}
        </div>
      </footer>

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-amber-200 overflow-hidden font-hind">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#FF9933] via-amber-500 to-[#138808] p-1">
              <div className="bg-white p-5 rounded-t-[22px] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <KeyRound className="w-5 h-5 text-[#FF9933]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#000080] leading-tight font-devanagari">
                      प्रशासक लॉगिन (एडमिन)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      सेटिंग्स, कलम, कागज़, हेडर एवं AI OCR नियंत्रण
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-devanagari">
                  प्रशासक पासवर्ड दर्ज करें:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      if (adminError) setAdminError('');
                    }}
                    placeholder="पासवर्ड लिखें..."
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[#f8f3ea] border border-[#d8c5a8] rounded-xl text-sm text-[#2c1e12] focus:outline-none focus:border-[#FF9933] font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    {showPassword ? 'छिपाएं' : 'दिखाएं'}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{adminError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#FF9933] to-[#ea580c] hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  लॉगिन करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maths Easy Formulas & Short Tricks Modal */}
      <MathsFormulasModal
        isOpen={isMathsModalOpen}
        onClose={() => setIsMathsModalOpen(false)}
      />

    </div>
  );
}
