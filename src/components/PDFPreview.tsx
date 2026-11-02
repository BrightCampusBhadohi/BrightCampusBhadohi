import React, { useState, useRef } from 'react';
import { Question, HeaderConfig, PDFStyleConfig } from '../types';
import { Download, Sparkles, Printer, Layers, Eye, EyeOff, BookOpen, ChevronLeft, ChevronRight, Play, Pause, Bookmark, Volume2, VolumeX, MoveHorizontal } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { playPageFlipSound } from '../utils/audio';

interface PDFPreviewProps {
  questions: Question[];
  headerConfig: HeaderConfig;
  styleConfig: PDFStyleConfig;
  onUpdateStyleConfig: (config: PDFStyleConfig) => void;
  onOpenHeaderModal: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  questions,
  headerConfig,
  styleConfig,
  onUpdateStyleConfig,
  onOpenHeaderModal
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressVal, setProgressVal] = useState(0);

  // View Mode: 'flipbook' or 'scroll'
  const [viewMode, setViewMode] = useState<'flipbook' | 'scroll'>('flipbook');
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gesture State for Mouse Drag & Finger Touch Swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Group questions by pages based on questionsPerPage (default 3 per page)
  const qPerPage = styleConfig.questionsPerPage || 3;
  const pageChunks: Question[][] = [];
  for (let i = 0; i < questions.length; i += qPerPage) {
    pageChunks.push(questions.slice(i, i + qPerPage));
  }

  const totalPages = Math.max(1, pageChunks.length);

  // Auto flip timer
  React.useEffect(() => {
    let timer: any = null;
    if (isAutoFlipping) {
      timer = setInterval(() => {
        handleNextPage();
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoFlipping, currentPage, totalPages]);

  const triggerSound = () => {
    if (soundEnabled) {
      playPageFlipSound();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      triggerSound();
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
        setDragOffset(0);
      }, 280);
    } else if (isAutoFlipping) {
      setIsAutoFlipping(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      triggerSound();
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
        setDragOffset(0);
      }, 280);
    }
  };

  // --- TOUCH & MOUSE GESTURE HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const clientX = e.touches[0].clientX;
    setTouchStartX(clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -50) {
      handleNextPage();
    } else if (dragOffset > 50) {
      handlePrevPage();
    } else {
      setDragOffset(0);
    }
    setTouchStartX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    const diff = e.clientX - touchStartX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -50) {
      handleNextPage();
    } else if (dragOffset > 50) {
      handlePrevPage();
    } else {
      setDragOffset(0);
    }
    setTouchStartX(null);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setProgressVal(5);
    setProgressStatus('PDF जनरेटर प्रारंभ हो रहा है...');

    try {
      await generatePDF({
        elementId: 'pdf-document-root',
        filename: `${headerConfig.instituteName.replace(/\s+/g, '_')}_${headerConfig.setNumber}_UP_PCS.pdf`,
        onProgress: (val, msg) => {
          setProgressVal(val);
          setProgressStatus(msg);
        }
      });
    } catch (err: any) {
      alert('PDF डाउनलोड करने में समस्या आई: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine font CSS class
  const getFontClass = () => {
    switch (styleConfig.fontStyle) {
      case 'kalam': return 'font-kalam';
      case 'devanagari': return 'font-devanagari';
      case 'hind': return 'font-hind';
      case 'outfit': return 'font-outfit';
      default: return 'font-kalam';
    }
  };

  // Determine paper background CSS class
  const getPaperClass = () => {
    switch (styleConfig.paperTheme) {
      case 'ruled': return 'notebook-ruled-paper';
      case 'plain': return 'notebook-plain-paper';
      case 'grid': return 'bg-white bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]';
      case 'parchment': return 'notebook-parchment-paper';
      default: return 'notebook-ruled-paper';
    }
  };

  // Render a single page content unit with Realistic Book Binding & Page Stack Layers
  const renderPageContent = (chunk: Question[], pageIndex: number) => (
    <div
      key={pageIndex}
      className={`pdf-page-unit ${getPaperClass()} border border-amber-300/80 rounded-sm mx-auto p-6 sm:p-8 text-slate-900 transition-all font-bold relative overflow-hidden select-none`}
      style={{
        width: '100%',
        maxWidth: '794px', // Standard A4 ratio
        minHeight: '1123px', // Standard A4 height
        boxSizing: 'border-box',
        color: styleConfig.inkColor,
        fontWeight: styleConfig.fontWeight === 'bold-900' ? 900 : 700,
        boxShadow: '-10px 0 25px rgba(0,0,0,0.12), 10px 0 25px rgba(0,0,0,0.08), inset 20px 0 30px -10px rgba(0,0,0,0.15)'
      }}
    >
      {/* Center Spine Inner Book Fold Shadow */}
      <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none z-20"></div>

      {/* Right Book Page Stack Thickness Lines */}
      <div className="absolute top-1 bottom-1 right-0 w-2 border-r-4 border-double border-amber-200/90 pointer-events-none z-20"></div>

      {/* Ribbon Bookmark Corner Accent */}
      <div className="absolute top-0 right-8 w-6 h-11 bg-[#FF9933] shadow-lg z-30 flex items-end justify-center pb-1 rounded-b-sm">
        <Bookmark className="w-4 h-4 text-white fill-current" />
      </div>

      {/* Peeling Page Corner Curl (Clickable to Flip Next) */}
      <div
        onClick={handleNextPage}
        className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber-300/90 via-amber-200/40 to-transparent pointer-events-auto z-30 rounded-tl-full shadow-lg cursor-pointer hover:scale-110 transition group"
        title="पेज पलटने के लिए क्लिक करें"
      >
        <div className="absolute bottom-1 right-1 text-[10px] font-bold text-slate-700 opacity-60 group-hover:opacity-100">
          ▶
        </div>
      </div>

      {/* Watermark */}
      {headerConfig.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none rotate-[-30deg]">
          <span className="text-5xl sm:text-6xl font-black text-black tracking-widest text-center uppercase">
            {headerConfig.watermarkText || headerConfig.instituteName}
          </span>
        </div>
      )}

      {/* Page Header */}
      {pageIndex === 0 ? (
        <div className="border-b-2 border-slate-900 pb-4 mb-6 relative">
          
          {/* Top Institute Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black tracking-wide uppercase font-outfit text-[#000080]">
              {headerConfig.instituteName}
            </h1>
            <p className="text-xs font-semibold text-slate-700 font-hind">
              {headerConfig.tagline}
            </p>
            
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 font-hind pt-0.5">
              {headerConfig.showAddressInHeader && <span>📍 {headerConfig.address}</span>}
              {headerConfig.showContactInHeader && <span>{headerConfig.contactNumber}</span>}
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="mt-4 p-3 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] text-white rounded-lg text-center shadow-md">
            <h2 className="text-base font-bold tracking-wide font-hind uppercase text-white">
              {headerConfig.docTitle}
            </h2>
            {headerConfig.docSubtitle && (
              <p className="text-xs font-medium text-amber-200 mt-0.5 font-hind">
                {headerConfig.docSubtitle}
              </p>
            )}
          </div>

          {/* Optional Exam Info Metadata Line */}
          {headerConfig.showExamMetadataLine && (
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mt-2 px-1 font-hind">
              {headerConfig.totalTime && <span>समय: {headerConfig.totalTime}</span>}
              {headerConfig.setNumber && <span>सेट कोड: {headerConfig.setNumber}</span>}
              {headerConfig.negativeMarking && <span>ऋणात्मक अंकन: {headerConfig.negativeMarking}</span>}
              {headerConfig.totalMarks && <span>पूर्णांक: {headerConfig.totalMarks}</span>}
            </div>
          )}

        </div>
      ) : (
        /* Header on Page 2+ */
        <div className="border-b border-slate-400 pb-2 mb-6 flex items-center justify-between text-xs text-slate-700 font-hind">
          <span className="font-bold">{headerConfig.instituteName} • {headerConfig.docTitle}</span>
          <span>पृष्ठ {pageIndex + 1} / {totalPages}</span>
        </div>
      )}

      {/* Question Items on this Page */}
      <div className={`space-y-6 ${getFontClass()}`}>
        {chunk.map((q, qSubIdx) => {
          const globalIdx = pageIndex * qPerPage + qSubIdx + 1;
          return (
            <div key={q.id} className="relative pl-6 pb-2 border-b border-blue-200/60 last:border-none">
              
              {/* Question Header */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-base font-black shrink-0">
                  प्र. {globalIdx}.
                </span>
                <h3 className="text-base font-black leading-relaxed">
                  {q.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pl-6 mt-1 font-black">
                <div>(A) {q.optionA}</div>
                <div>(B) {q.optionB}</div>
                <div>(C) {q.optionC}</div>
                <div>(D) {q.optionD}</div>
              </div>

              {/* Step-by-step Hindi Explanation if enabled (Large Bold Green Text) */}
              {styleConfig.showInlineExplanations && q.explanation && (
                <div className="mt-3 ml-6 p-3 rounded-lg bg-emerald-50 border-l-4 border-[#138808] text-sm leading-relaxed font-devanagari text-[#138808] shadow-xs">
                  <span className="font-black text-[#138808] text-sm block mb-0.5">व्याख्या (Explanation): </span>
                  <span className="font-bold text-[#138808] text-sm">{q.explanation}</span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Answer Key Table at bottom of Last Page */}
      {pageIndex === pageChunks.length - 1 && styleConfig.showAnswerKeyTable && (
        <div className="mt-8 pt-4 border-t-2 border-slate-900 font-hind">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-center">
            - उत्तर कुंजी (ANSWER KEY MATRIX) -
          </h4>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-1 text-center text-xs">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-1 bg-white border border-slate-400 rounded">
                <div className="text-[10px] text-slate-500 font-bold">Q{idx + 1}</div>
                <div className="font-black text-[#138808]">({q.answerKey})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Footer */}
      <div className="mt-auto pt-6 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-600 font-hind">
        <span>{headerConfig.instituteName} - {headerConfig.contactNumber}</span>
        <span>पृष्ठ {pageIndex + 1} / {totalPages}</span>
      </div>

    </div>
  );

  // Dynamic 3D rotation transform based on gesture drag offset
  const computeRotationStyle = () => {
    if (isFlipping) {
      return flipDirection === 'next' ? 'rotateY(-35deg) scale(0.97)' : 'rotateY(35deg) scale(0.97)';
    }
    if (isDragging && dragOffset !== 0) {
      const degrees = Math.min(Math.max((dragOffset / 280) * 45, -55), 55);
      return `rotateY(${degrees}deg) scale(${1 - Math.abs(degrees) * 0.003})`;
    }
    return 'rotateY(0deg) scale(1)';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Toolbar / Quick Style Controls in Tiranga Theme */}
      <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-900">
        
        {/* Left: Flipbook View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-[#fff7ed] p-1 rounded-xl border border-amber-200 flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('flipbook')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'flipbook'
                  ? 'bg-[#FF9933] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#000080]'
              }`}
            >
              <BookOpen className="w-4 h-4" /> 📖 3D फ़्लिपबुक (Page Flip)
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'scroll'
                  ? 'bg-[#FF9933] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#000080]'
              }`}
            >
              <Layers className="w-4 h-4" /> 📄 स्क्रॉल पेज व्यू
            </button>
          </div>
        </div>

        {/* Center: Style Controls & Audio Sound Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-amber-100 text-[#ea580c] border-amber-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="पेज फ्लिप साउंड ऑन/ऑफ़ करें"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF9933]" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? '🔊 ध्वनि ON' : '🔇 ध्वनि OFF'}
          </button>

          {/* Font Picker */}
          <div className="flex items-center gap-1 bg-[#fff7ed] px-2.5 py-1.5 rounded-xl border border-amber-200">
            <span className="text-slate-600 font-medium">फ़ॉन्ट:</span>
            <select
              value={styleConfig.fontStyle}
              onChange={(e) => onUpdateStyleConfig({ ...styleConfig, fontStyle: e.target.value as any })}
              className="bg-transparent text-[#000080] font-bold focus:outline-none cursor-pointer"
            >
              <option value="kalam" className="bg-white">✍️ Kalam Handwriting (कलम)</option>
              <option value="devanagari" className="bg-white">📖 Noto Devanagari</option>
              <option value="hind" className="bg-white">📄 Hind Clean</option>
              <option value="outfit" className="bg-white">✨ Modern Outfit</option>
            </select>
          </div>

          {/* Paper Theme Picker */}
          <div className="flex items-center gap-1 bg-[#fff7ed] px-2.5 py-1.5 rounded-xl border border-amber-200">
            <span className="text-slate-600 font-medium">कागज़:</span>
            <select
              value={styleConfig.paperTheme}
              onChange={(e) => onUpdateStyleConfig({ ...styleConfig, paperTheme: e.target.value as any })}
              className="bg-transparent text-[#FF9933] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ruled" className="bg-white">📝 नोटबुक रूल्ड</option>
              <option value="plain" className="bg-white">⚪ प्लेन व्हाइट</option>
              <option value="grid" className="bg-white">📐 ग्रिड पेपर</option>
              <option value="parchment" className="bg-white">📜 तिरंगा पर्चमेंट</option>
            </select>
          </div>

          {/* Show/Hide Answer Key */}
          <button
            onClick={() => onUpdateStyleConfig({ ...styleConfig, showAnswerKeyTable: !styleConfig.showAnswerKeyTable })}
            className={`px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1 transition ${
              styleConfig.showAnswerKeyTable
                ? 'bg-emerald-50 text-[#138808] border-emerald-300'
                : 'bg-[#fff7ed] text-slate-600 border-amber-200'
            }`}
          >
            {styleConfig.showAnswerKeyTable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {styleConfig.showAnswerKeyTable ? 'उत्तर तालिका ON' : 'उत्तर तालिका OFF'}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHeaderModal}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-[#ea580c] text-xs font-bold rounded-xl flex items-center gap-1 border border-amber-200 transition"
          >
            <Sparkles className="w-4 h-4 text-[#FF9933]" /> हेडर
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-300 transition"
          >
            <Printer className="w-4 h-4" /> प्रिंट
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting || questions.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-[#138808] to-[#047857] hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#138808]/20 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-200" />
            {isExporting ? 'बन रहा है...' : 'PDF डाउनलोड'}
          </button>
        </div>

      </div>

      {/* Progress Overlay */}
      {isExporting && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-4">
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#138808] h-full transition-all duration-300"
              style={{ width: `${progressVal}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#138808] whitespace-nowrap min-w-[180px]">
            {progressStatus} ({progressVal}%)
          </span>
        </div>
      )}

      {/* FLIPBOOK VIEW MODE WITH TOUCH & MOUSE SWIPE & FLIP SOUND SUPPORT */}
      {viewMode === 'flipbook' ? (
        <div className="space-y-4">
          
          {/* Flipbook Controls Bar & Touch Hint */}
          <div className="bg-white border border-amber-200 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-2 max-w-4xl mx-auto">
            
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-[#fff7ed] hover:bg-amber-100 text-[#000080] font-bold text-xs rounded-xl flex items-center gap-1 border border-amber-200 disabled:opacity-30 transition min-h-[40px] shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-[#FF9933]" /> 👈 पिछला (Flip Left)
            </button>

            {/* Page Jump Counter & Touch Hint Badge */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-hind">
              <span className="hidden sm:inline text-slate-600 flex items-center gap-1">
                <MoveHorizontal className="w-3.5 h-3.5 text-[#FF9933]" /> माउस/उंगली से स्वाइप करें
              </span>

              <span className="px-3 py-1 bg-[#000080] text-white rounded-lg font-mono text-sm">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={() => setIsAutoFlipping(!isAutoFlipping)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  isAutoFlipping ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Auto Flip Slideshow"
              >
                {isAutoFlipping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isAutoFlipping ? 'ऑटो बंद' : 'ऑटो चालू'}
              </button>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-[#fff7ed] hover:bg-amber-100 text-[#000080] font-bold text-xs rounded-xl flex items-center gap-1 border border-amber-200 disabled:opacity-30 transition min-h-[40px] shadow-xs active:scale-95"
            >
              अगला (Flip Right) 👉 <ChevronRight className="w-4 h-4 text-[#FF9933]" />
            </button>

          </div>

          {/* Interactive Touch Swipe & Mouse Drag Stage */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="perspective-1000 max-w-4xl mx-auto relative overflow-x-auto p-2 cursor-grab active:cursor-grabbing select-none"
          >
            
            <div
              className="transition-transform duration-250 ease-out transform-gpu origin-left"
              style={{
                perspective: '1400px',
                transformStyle: 'preserve-3d',
                transform: computeRotationStyle()
              }}
            >
              {pageChunks.length > 0 ? (
                renderPageContent(pageChunks[currentPage], currentPage)
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-amber-200">
                  <p className="text-sm font-bold text-slate-700">कोई पृष्ठ उपलब्ध नहीं है</p>
                </div>
              )}
            </div>

            {/* Touch Hint Overlay for Mobile */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-900/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-full pointer-events-none opacity-90 sm:hidden flex items-center gap-1 shadow-md">
              <MoveHorizontal className="w-3.5 h-3.5 text-amber-300" /> पेज पलटने के लिए स्वाइप करें
            </div>

            {/* Side Tap Regions */}
            {currentPage > 0 && (
              <button
                onClick={handlePrevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-28 bg-[#FF9933]/30 hover:bg-[#FF9933]/50 text-[#000080] rounded-r-2xl flex items-center justify-center transition shadow-lg backdrop-blur-xs"
                title="पिछला पेज पलटे"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {currentPage < totalPages - 1 && (
              <button
                onClick={handleNextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-28 bg-[#FF9933]/30 hover:bg-[#FF9933]/50 text-[#000080] rounded-l-2xl flex items-center justify-center transition shadow-lg backdrop-blur-xs"
                title="अगला पेज पलटे"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

          </div>

          {/* Hidden Root for Full PDF Export */}
          <div id="pdf-document-root" className="hidden">
            {pageChunks.map((chunk, idx) => renderPageContent(chunk, idx))}
          </div>

        </div>
      ) : (
        /* REGULAR SCROLLING PDF VIEW MODE */
        <div id="pdf-document-root" className="space-y-8 max-w-4xl mx-auto">
          {pageChunks.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-amber-200 rounded-3xl p-8">
              <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">कोई प्रश्न चयनित नहीं है</h3>
              <p className="text-sm text-slate-500">PDF देखने के लिए ऊपर प्रश्न चुनें या नया प्रश्न जोड़ें।</p>
            </div>
          ) : (
            pageChunks.map((chunk, pageIndex) => renderPageContent(chunk, pageIndex))
          )}
        </div>
      )}

    </div>
  );
};
