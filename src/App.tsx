import React, { useState, useEffect, useMemo } from 'react';
import { Question, HeaderConfig, PDFStyleConfig } from './types';
import { CATEGORIES } from './data/questionsData';
import { MASTER_1200_QUESTIONS } from './data/upPcs2026QuestionsBank';
import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { PDFPreview } from './components/PDFPreview';
import { HeaderCustomizerModal } from './components/HeaderCustomizerModal';
import { QuestionEditModal } from './components/QuestionEditModal';
import { AIOCRExtractorModal } from './components/AIOCRExtractorModal';
import { QuizMode } from './components/QuizMode';
import { PresetsPanel } from './components/PresetsPanel';
import { Search, Filter, Eye, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // Main Questions State
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('bright_campus_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length >= 100) return parsed;
      } catch (e) { console.error(e); }
    }
    return MASTER_1200_QUESTIONS;
  });

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
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      fontStyle: 'kalam',
      fontWeight: 'bold-900',
      paperTheme: 'ruled',
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
  const [showAnswersInEditor, setShowAnswersInEditor] = useState(true);

  // Modal States
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Filtered Questions list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = searchQuery === '' || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionB.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionC.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionD.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      const matchesExam = selectedExam === 'all' || q.examFocus === selectedExam;

      return matchesSearch && matchesCategory && matchesExam;
    });
  }, [questions, searchQuery, selectedCategory, selectedExam]);

  // Question CRUD handlers
  const handleSaveQuestion = (q: Question) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((item) => item.id === q.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = q;
        return copy;
      }
      return [q, ...prev];
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
      question: `${q.question} (प्रतिलिपि)`
    };
    setQuestions((prev) => [dup, ...prev]);
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
    setQuestions((prev) => [...imported, ...prev]);
    setActiveTab('studio');
    setStudioSubView('pdf-preview');
  };

  const handleResetInitial = () => {
    if (confirm('क्या आप प्रश्न बैंक को संपूर्ण 1,200 UP PCS 2026 प्रश्नों से रीसेट करना चाहते हैं?')) {
      setQuestions(MASTER_1200_QUESTIONS);
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
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: STUDIO (PDF Preview / Editor Feed) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            
            {/* Search & Filter Toolbar in Tan Theme */}
            <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="प्रश्न, उत्तर या व्याख्या खोजें..."
                  className="w-full pl-10 pr-4 py-2 bg-[#f8f3ea] border border-[#d8c5a8] rounded-xl text-xs text-[#2c1e12] placeholder-slate-400 focus:outline-none focus:border-[#FF9933] font-devanagari"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filters & Subview Switchers */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                
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
                    <option value="UPSC GS-1" className="bg-white">UPSC GS-1</option>
                    <option value="UPSC CSAT" className="bg-white">UPSC CSAT</option>
                  </select>
                </div>

                {/* Subview Toggle */}
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

              </div>

            </div>

            {/* SUB-VIEW 1: PDF CANVAS PREVIEW */}
            {studioSubView === 'pdf-preview' && (
              <PDFPreview
                questions={filteredQuestions}
                headerConfig={headerConfig}
                styleConfig={styleConfig}
                onUpdateStyleConfig={setStyleConfig}
                onOpenHeaderModal={() => setIsHeaderModalOpen(true)}
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

      {/* Footer Branding */}
      <footer className="mt-auto border-t border-amber-200 bg-[#fff7ed] py-6 text-center text-xs text-slate-600 font-hind">
        <p className="font-bold text-[#000080]">BRIGHT CAMPUS BHADOHI • UP PCS 2026-2027 & UPSC PREPARATION SUITE</p>
        <p className="mt-1">📍 Chauri Rd, BADI BAGH, Bhadohi, UP | 📞 +91 87075 25421</p>
      </footer>

    </div>
  );
}
