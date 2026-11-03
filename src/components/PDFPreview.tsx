import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Question, HeaderConfig, PDFStyleConfig } from '../types';
import { Download, Sparkles, Printer, Layers, Eye, EyeOff, BookOpen, ChevronLeft, ChevronRight, Play, Pause, Bookmark, Volume2, VolumeX, MoveHorizontal, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { playPageFlipSound } from '../utils/audio';

interface PDFPreviewProps {
  questions: Question[];
  headerConfig: HeaderConfig;
  styleConfig: PDFStyleConfig;
  onUpdateStyleConfig: (config: PDFStyleConfig) => void;
  onOpenHeaderModal: () => void;
  onEditQuestion?: (question: Question) => void;
  isAdmin?: boolean;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  questions,
  headerConfig,
  styleConfig,
  onUpdateStyleConfig,
  onOpenHeaderModal,
  onEditQuestion,
  isAdmin = false
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
  const [showSettings, setShowSettings] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const flipbookStageRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async (force?: boolean) => {
    const targetState = typeof force === 'boolean' ? force : !isFullscreen;
    setIsFullscreen(targetState);

    try {
      if (targetState) {
        const elem = flipbookStageRef.current || document.documentElement;
        if (!document.fullscreenElement && elem.requestFullscreen) {
          await elem.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
      }
    } catch (e) {
      // In-window overlay takes care of fullscreen seamlessly
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Voice Assistant State
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Use refs for tracking to avoid stale closures during speech synthesis callbacks
  const readingIndexRef = useRef(0);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  const speakQuestion = () => {
    const globalIndex = readingIndexRef.current;
    
    if (globalIndex >= questions.length || !isSpeakingRef.current) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }
    
    if (synth.speaking) synth.cancel();
    
    const q = questions[globalIndex];
    const textToSpeak = `प्रश्न संख्या ${globalIndex + 1}: ${q.question}. विकल्प: (A) ${q.optionA}, (B) ${q.optionB}, (C) ${q.optionC}, (D) ${q.optionD}. सही उत्तर है: ${q.answerKey}. व्याख्या: ${q.explanation}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.3; 
    utterance.pitch = 1.0;
    
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('hi') && (v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Microsoft')));
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (!isSpeakingRef.current) return;

      if (readingIndexRef.current < questions.length - 1) {
        readingIndexRef.current += 1;
        const nextPageIndex = Math.floor(readingIndexRef.current / qPerPage);
        
        // Update page if necessary
        if (nextPageIndex !== currentPage) {
          setCurrentPage(nextPageIndex);
          // Wait for page transition rendering to finish
          setTimeout(() => speakQuestion(), 1500);
        } else {
          // Continuous reading
          setTimeout(() => speakQuestion(), 200);
        }
      } else {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
    };
    synth.speak(utterance);
  };

  const toggleVoiceAssistant = () => {
    if (isSpeakingRef.current) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      synth.cancel();
    } else {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      readingIndexRef.current = currentPage * qPerPage;
      speakQuestion();
    }
  };

  // Gesture State for Touch Swipe & Mouse Drag Flexible Page Bend
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Group questions by pages based on questionsPerPage (default 3 per page)
  const qPerPage = styleConfig.questionsPerPage || 3;
  const safeQuestions = useMemo(() => Array.isArray(questions) ? questions : [], [questions]);
  
  const pageChunks: Question[][] = useMemo(() => {
    const chunks: Question[][] = [];
    for (let i = 0; i < safeQuestions.length; i += qPerPage) {
      chunks.push(safeQuestions.slice(i, i + qPerPage));
    }
    return chunks;
  }, [safeQuestions, qPerPage]);

  const totalPages = Math.max(1, pageChunks.length);
  const safeCurrentPage = Math.min(Math.max(0, currentPage), Math.max(0, pageChunks.length - 1));

  // Automatically keep currentPage within valid bounds when questions/filters change
  useEffect(() => {
    if (pageChunks.length > 0 && currentPage >= pageChunks.length) {
      setCurrentPage(pageChunks.length - 1);
    } else if (pageChunks.length === 0 && currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [pageChunks.length, currentPage]);

  // Auto flip timer
  React.useEffect(() => {
    let timer: any = null;
    if (isAutoFlipping) {
      timer = setInterval(() => {
        handleNextPage();
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoFlipping, safeCurrentPage, totalPages]);

  const triggerSound = () => {
    if (soundEnabled) {
      playPageFlipSound();
    }
  };

  const handleNextPage = () => {
    if (safeCurrentPage < totalPages - 1) {
      triggerSound();
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
        setIsFlipping(false);
        setDragOffset(0);
      }, 320);
    } else if (isAutoFlipping) {
      setIsAutoFlipping(false);
    }
  };

  const handlePrevPage = () => {
    if (safeCurrentPage > 0) {
      triggerSound();
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => Math.max(0, prev - 1));
        setIsFlipping(false);
        setDragOffset(0);
      }, 320);
    }
  };

  // --- TOUCH SWIPE & MOUSE DRAG FLEXIBLE BEND HANDLERS ---
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

    if (dragOffset < -40) {
      handleNextPage();
    } else if (dragOffset > 40) {
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

    if (dragOffset < -40) {
      handleNextPage();
    } else if (dragOffset > 40) {
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
      case 'plain': return 'bg-white notebook-plain-paper';
      case 'grid': return 'bg-white bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]';
      case 'parchment': return 'notebook-parchment-paper';
      default: return 'bg-white notebook-plain-paper';
    }
  };

  // Compute Flexible Bending Paper 3D Transform
  const computeFlexiblePaperStyle = () => {
    if (isFlipping) {
      // 180 degrees turn for full page flip
      const angle = flipDirection === 'next' ? -180 : 180;
      return {
        transform: `perspective(2000px) rotateY(${angle}deg) scale(1)`,
        transition: 'transform 0.4s cubic-bezier(0.3, 0, 0.1, 1)'
      };
    }
    if (isDragging && dragOffset !== 0) {
      // Calculate dynamic paper flex angle based on finger/mouse distance
      const flexAngle = Math.min(Math.max((dragOffset / 200) * 70, -80), 80);
      const flexSkew = flexAngle * 0.12; // Realistic paper bending curvature
      return {
        transform: `perspective(1400px) rotateY(${flexAngle}deg) skewY(${flexSkew}deg) scale(${1 - Math.abs(flexAngle) * 0.0025})`,
        transition: 'none'
      };
    }
    return {
      transform: 'perspective(1400px) rotateY(0deg) skewY(0deg) scale(1)',
      transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
    };
  };

  // Render a single page content unit with Flexible Bending Paper Physics & Spine Shadow
  const renderPageContent = (chunk: Question[] = [], pageIndex: number) => {
    const safeChunk = Array.isArray(chunk) ? chunk : [];
    return (
    <div
      key={pageIndex}
      onClick={(e) => {
        // Clicking page triggers fullscreen as requested by user
        if (!isFullscreen) {
          toggleFullscreen(true);
        }
      }}
      className={`pdf-page-unit ${getPaperClass()} border border-slate-300 rounded-sm mx-auto p-3 sm:p-8 text-slate-900 transition-all font-bold relative overflow-hidden select-none w-[95vw] sm:w-[794px] min-h-[400px] sm:min-h-[auto] cursor-pointer group/page`}
      title={isFullscreen ? "पृष्ठ (फुल स्क्रीन सक्रिय)" : "फुल स्क्रीन करने के लिए पेज पर कहीं भी क्लिक करें"}
      style={{
        boxSizing: 'border-box',
        color: styleConfig.inkColor,
        fontWeight: styleConfig.fontWeight === 'bold-900' ? 900 : 700,
        boxShadow: '-10px 0 25px rgba(0,0,0,0.15), 10px 0 20px rgba(0,0,0,0.08), inset 22px 0 32px -10px rgba(0,0,0,0.18)',
        transformOrigin: 'left center'
      }}
    >
      {/* Fullscreen Hint Badge in top-left */}
      {!isFullscreen && (
        <div className="absolute top-2 left-3 z-30 opacity-40 group-hover/page:opacity-100 transition-opacity text-[10px] text-[#000080] bg-white/95 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 shadow-xs pointer-events-none">
          <Maximize2 className="w-3 h-3 text-[#FF9933]" />
          <span>क्लिक करें: फुल स्क्रीन</span>
        </div>
      )}

      {/* Center Spine Flexible Paper Fold Shadow */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none z-20"></div>

      {/* Dynamic Paper Crease Bend Shadow overlay during flip */}
      {(isFlipping || isDragging) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-amber-900/10 to-black/15 pointer-events-none z-25"></div>
      )}

      {/* Right Book Page Stack Thickness Lines */}
      <div className="absolute top-1 bottom-1 right-0 w-1.5 sm:w-2 border-r-2 sm:border-r-4 border-double border-amber-200/90 pointer-events-none z-20"></div>

      {/* Ribbon Bookmark Corner Accent */}
      <div className="absolute top-0 right-4 sm:right-8 w-5 sm:w-6 h-8 sm:h-11 bg-[#FF9933] shadow-md z-30 flex items-end justify-center pb-1 rounded-b-sm">
        <Bookmark className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white fill-current" />
      </div>

      {/* Flexible Peeling Page Corner Curl (Click or Touch Corner to Flip Page) */}
      <div
        onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
        className="absolute bottom-0 right-0 w-14 sm:w-18 h-14 sm:h-18 bg-gradient-to-tl from-amber-400 via-amber-200/60 to-transparent pointer-events-auto z-30 rounded-tl-[40px] shadow-2xl cursor-pointer hover:scale-115 active:scale-95 transition group flex items-end justify-end p-2 border-t border-l border-amber-300"
        title="कागज़ की तरह मोडकर पेज पलटने के लिए यहाँ टच करें"
      >
        <span className="text-[11px] sm:text-xs font-black text-[#000080] group-hover:translate-x-0.5 transition flex items-center gap-0.5">
          📖 ➔
        </span>
      </div>

      {/* Watermark */}
      {headerConfig.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none rotate-[-30deg]">
          <span className="text-3xl sm:text-6xl font-black text-black tracking-widest text-center uppercase">
            {headerConfig.watermarkText || headerConfig.instituteName}
          </span>
        </div>
      )}

      {/* Page Header */}
      {pageIndex === 0 ? (
        <div className="border-b-2 border-slate-900 pb-3 sm:pb-4 mb-4 sm:mb-6 relative">
          
          {/* Top Institute Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black tracking-wide uppercase font-outfit text-[#000080]">
              {headerConfig.instituteName}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-700 font-hind">
              {headerConfig.tagline}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-slate-600 font-hind pt-0.5">
              {headerConfig.showAddressInHeader && <span>📍 {headerConfig.address}</span>}
              {headerConfig.showContactInHeader && <span>{headerConfig.contactNumber}</span>}
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] text-white rounded-lg text-center shadow-md">
            <h2 className="text-xs sm:text-base font-bold tracking-wide font-hind uppercase text-white">
              {headerConfig.docTitle}
            </h2>
            {headerConfig.docSubtitle && (
              <p className="text-[10px] sm:text-xs font-medium text-amber-200 mt-0.5 font-hind">
                {headerConfig.docSubtitle}
              </p>
            )}
          </div>

          {/* Optional Exam Info Metadata Line */}
          {headerConfig.showExamMetadataLine && (
            <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-800 mt-2 px-1 font-hind gap-1">
              {headerConfig.totalTime && <span>समय: {headerConfig.totalTime}</span>}
              {headerConfig.setNumber && <span>सेट कोड: {headerConfig.setNumber}</span>}
              {headerConfig.negativeMarking && <span>ऋणात्मक अंकन: {headerConfig.negativeMarking}</span>}
              {headerConfig.totalMarks && <span>पूर्णांक: {headerConfig.totalMarks}</span>}
            </div>
          )}

        </div>
      ) : (
        /* Header on Page 2+ */
        <div className="border-b border-slate-400 pb-2 mb-4 sm:mb-6 flex items-center justify-between text-[11px] sm:text-xs text-slate-700 font-hind">
          <span className="font-bold truncate max-w-[200px] sm:max-w-none">{headerConfig.instituteName} • {headerConfig.docTitle}</span>
          <span className="shrink-0">पृष्ठ {pageIndex + 1} / {totalPages}</span>
        </div>
      )}

      {/* Question Items on this Page */}
      <div className={`space-y-4 sm:space-y-6 ${getFontClass()}`}>
        {safeChunk.map((q, qSubIdx) => {
          if (!q) return null;
          const globalIdx = pageIndex * qPerPage + qSubIdx + 1;
          return (
            <div
              key={q.id || `q-${pageIndex}-${qSubIdx}`}
              onClick={(e) => {
                if (isAdmin && onEditQuestion) {
                  onEditQuestion(q);
                } else if (!isFullscreen) {
                  toggleFullscreen(true);
                }
              }}
              className="relative pl-3 sm:pl-6 pb-2 border-b border-blue-200/60 last:border-none group/q hover:bg-[#fff7ed]/60 rounded-xl p-2 transition cursor-pointer"
              title={isAdmin ? "प्रश्न संपादित करने के लिए क्लिक करें" : "फुल स्क्रीन करने के लिए क्लिक करें"}
            >
              {/* Quick Thumb Edit Button (Admin Only) */}
              {isAdmin && onEditQuestion && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditQuestion(q);
                  }}
                  className="absolute right-1 top-1 px-2.5 py-1 bg-[#FF9933] hover:bg-[#ea580c] text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95 z-20"
                >
                  ✏️ एडिट
                </button>
              )}
              
              {/* Question Header */}
              <div className="flex items-start gap-1.5 sm:gap-2 mb-2 pr-16 flex-wrap">
                <span className="text-sm sm:text-base font-black shrink-0">
                  प्र. {globalIdx}.
                </span>
                {q.difficulty === 'Very Hard' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-300 font-bold shrink-0">
                    🔥 अत्यंत कठिन (Very Hard)
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-black leading-relaxed whitespace-pre-line w-full">
                  {q.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm pl-3 sm:pl-6 mt-1 font-black">
                <div className={q.answerKey === 'A' ? 'text-[#138808] animate-pulse' : ''}>(A) {q.optionA}</div>
                <div className={q.answerKey === 'B' ? 'text-[#138808] animate-pulse' : ''}>(B) {q.optionB}</div>
                <div className={q.answerKey === 'C' ? 'text-[#138808] animate-pulse' : ''}>(C) {q.optionC}</div>
                <div className={q.answerKey === 'D' ? 'text-[#138808] animate-pulse' : ''}>(D) {q.optionD}</div>
              </div>

              {/* Step-by-step Hindi Explanation if enabled (Large Bold Green Text) */}
              {styleConfig.showInlineExplanations && q.explanation && (
                <div className="mt-2.5 ml-2 sm:ml-6 p-2.5 sm:p-3 rounded-lg bg-emerald-50 border-l-4 border-[#138808] text-xs sm:text-sm leading-relaxed font-devanagari text-[#138808] shadow-xs">
                  <span className="font-black text-[#138808] text-xs sm:text-sm block mb-0.5">व्याख्या (Explanation): </span>
                  <span className="font-bold text-[#138808] text-xs sm:text-sm">{q.explanation}</span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Answer Key Table at bottom of Last Page */}
      {pageIndex === pageChunks.length - 1 && styleConfig.showAnswerKeyTable && (
        <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t-2 border-slate-900 font-hind">
          <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-center">
            - उत्तर कुंजी (ANSWER KEY MATRIX) -
          </h4>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center text-xs">
            {safeQuestions.map((q, idx) => (
              <div key={q.id || `ans-${idx}`} className="p-1 bg-white border border-slate-400 rounded">
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold">Q{idx + 1}</div>
                <div className="font-black text-[#138808] text-xs">({q.answerKey})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Footer */}
      <div className="mt-6 sm:mt-auto pt-4 sm:pt-6 border-t border-slate-400 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-600 font-hind">
        <span className="truncate max-w-[200px] sm:max-w-none">{headerConfig.instituteName} - {headerConfig.contactNumber}</span>
        <span>पृष्ठ {pageIndex + 1} / {totalPages}</span>
      </div>

    </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      
      {/* Top Toolbar / Quick Style Controls in Tiranga Theme */}
      <div className="bg-white border border-amber-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-slate-900">
        
        {/* If Admin: show Settings, Kalam, Paper, and Header controls */}
        {isAdmin ? (
          <>
            {/* Admin Left: Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-[#000080] hover:bg-amber-100 transition shadow-xs"
                title="प्रशासक सेटिंग्स"
              >
                <Settings className="w-4 h-4 text-[#FF9933]" /> सेटिंग्स
              </button>
              {showSettings && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-amber-200 shadow-xl rounded-xl p-3 z-50 flex flex-col gap-2 w-52 font-hind">
                  <div className="text-xs font-bold text-slate-500 mb-1">व्यू मोड</div>
                  <button
                    onClick={() => { setViewMode('flipbook'); setShowSettings(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                      viewMode === 'flipbook' ? 'bg-[#FF9933] text-white' : 'hover:bg-amber-50 text-slate-700'
                    }`}
                  >
                    📖 3D लचीली बुक
                  </button>
                  <button
                    onClick={() => { setViewMode('scroll'); setShowSettings(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                      viewMode === 'scroll' ? 'bg-[#FF9933] text-white' : 'hover:bg-amber-50 text-slate-700'
                    }`}
                  >
                    📄 स्क्रॉल पेज
                  </button>
                  <div className="border-t border-amber-100 my-1"></div>
                  <div className="text-xs font-bold text-slate-500 mb-1">साउंड (पेज फ्लिप)</div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                      soundEnabled ? 'bg-amber-100 text-[#ea580c]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {soundEnabled ? '🔊 साउंड चालू' : '🔇 साउंड बंद'}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Center: Kalam (Font) & Kagaz (Paper Theme) */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Font Picker */}
              <div className="flex items-center gap-1 bg-[#fff7ed] px-2.5 py-1.5 rounded-xl border border-amber-300">
                <span className="text-[#000080] font-bold">कलम:</span>
                <select
                  value={styleConfig.fontStyle}
                  onChange={(e) => onUpdateStyleConfig({ ...styleConfig, fontStyle: e.target.value as any })}
                  className="bg-transparent text-[#000080] font-bold focus:outline-none cursor-pointer"
                >
                  <option value="kalam" className="bg-white">✍️ Kalam (कलम)</option>
                  <option value="devanagari" className="bg-white">📖 देवनागरी</option>
                  <option value="hind" className="bg-white">📄 हिन्द स्पष्ट</option>
                  <option value="outfit" className="bg-white">✨ आधुनिक</option>
                </select>
              </div>

              {/* Paper Theme Picker */}
              <div className="flex items-center gap-1 bg-[#fff7ed] px-2.5 py-1.5 rounded-xl border border-amber-300">
                <span className="text-[#FF9933] font-bold">कागज़:</span>
                <select
                  value={styleConfig.paperTheme}
                  onChange={(e) => onUpdateStyleConfig({ ...styleConfig, paperTheme: e.target.value as any })}
                  className="bg-transparent text-[#ea580c] font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ruled" className="bg-white">📝 नोटबुक रूल्ड</option>
                  <option value="plain" className="bg-white">⚪ प्लेन व्हाइट</option>
                  <option value="grid" className="bg-white">📐 ग्रिड पेपर</option>
                  <option value="parchment" className="bg-white">📜 तिरंगा पर्चमेंट</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          /* Normal User Display: Pure reader status badge */
          <div className="flex items-center gap-2 text-xs font-bold text-[#000080]">
            <span className="px-3 py-1.5 bg-[#fff7ed] border border-amber-200 rounded-xl text-slate-700">
              📖 ब्राइट कैंपस डिजिटल बुक (अध्ययन सामग्री)
            </span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenHeaderModal}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#ea580c] text-xs font-bold rounded-xl flex items-center gap-1 border border-amber-300 transition shadow-xs"
              title="हेडर अनुकूलन"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" /> हेडर
            </button>
          )}

          {/* Show/Hide Answer Key */}
          <button
            onClick={() => onUpdateStyleConfig({ ...styleConfig, showAnswerKeyTable: !styleConfig.showAnswerKeyTable })}
            className={`px-2.5 py-1.5 rounded-xl border font-bold flex items-center gap-1 transition text-xs ${
              styleConfig.showAnswerKeyTable
                ? 'bg-emerald-50 text-[#138808] border-emerald-300'
                : 'bg-[#fff7ed] text-slate-600 border-amber-200'
            }`}
          >
            {styleConfig.showAnswerKeyTable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {styleConfig.showAnswerKeyTable ? 'उत्तर कुंजी चालू' : 'उत्तर कुंजी बंद'}
          </button>

          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-300 transition"
          >
            <Printer className="w-3.5 h-3.5" /> प्रिंट
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting || questions.length === 0}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#138808] to-[#047857] hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-200" />
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

      {/* FLIPBOOK VIEW MODE WITH REALTIME FLEXIBLE PAPER BEND & TOUCH SWIPE */}
      {viewMode === 'flipbook' ? (
        <div
          ref={flipbookStageRef}
          className={
            isFullscreen
              ? "fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 overflow-y-auto"
              : "space-y-3 w-full max-w-full overflow-hidden"
          }
        >
          
          {/* Flipbook Controls Bar & Touch Hint */}
          <div className={`bg-white border border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-wrap items-center justify-between gap-2 max-w-4xl mx-auto w-full z-40 ${isFullscreen ? 'sticky top-0' : ''}`}>
            
            <button
              onClick={handlePrevPage}
              disabled={safeCurrentPage === 0}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#fff7ed] hover:bg-amber-100 text-[#000080] font-bold text-xs rounded-xl flex items-center gap-1 border border-amber-200 disabled:opacity-30 transition min-h-[38px] shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-[#FF9933]" />
            </button>

            {/* Page Jump Counter, Controls & Fullscreen Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-800 font-hind flex-wrap justify-center">
              <span className="px-2.5 sm:px-3 py-1 bg-[#000080] text-white rounded-lg font-mono text-xs sm:text-sm">
                {safeQuestions.length > 0 ? safeCurrentPage + 1 : 0} / {totalPages}
              </span>

              <button
                onClick={() => setIsAutoFlipping(!isAutoFlipping)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  isAutoFlipping ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="ऑटो फ्लिप शो"
              >
                {isAutoFlipping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoFlipping ? 'ऑटो बंद' : 'ऑटो चालू'}</span>
              </button>

              <button
                onClick={toggleVoiceAssistant}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  isSpeaking ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title="आवाज़ सहायक"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'बोलना बंद' : 'टीचर वाचन'}</span>
              </button>

              <button
                onClick={() => toggleFullscreen(!isFullscreen)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  isFullscreen
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                    : 'bg-[#fff7ed] hover:bg-amber-100 text-[#000080] border border-amber-200 shadow-xs'
                }`}
                title={isFullscreen ? "फुल स्क्रीन बंद करें (Esc)" : "फुल स्क्रीन मोड (पेज पर क्लिक करके भी कर सकते हैं)"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-[#FF9933]" />}
                <span>{isFullscreen ? 'स्क्रीन बंद' : 'फुल स्क्रीन'}</span>
              </button>
            </div>

            <button
              onClick={handleNextPage}
              disabled={safeCurrentPage >= totalPages - 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#fff7ed] hover:bg-amber-100 text-[#000080] font-bold text-xs rounded-xl flex items-center gap-1 border border-amber-200 disabled:opacity-30 transition min-h-[38px] shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4 text-[#FF9933]" />
            </button>

          </div>

          {/* Touch Swipe & Mouse Drag Interactive Flexible Paper Stage */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="perspective-1000 max-w-4xl mx-auto relative w-full overflow-hidden p-1 sm:p-2 cursor-grab active:cursor-grabbing select-none flex justify-center touch-pan-y"
            style={{ touchAction: 'pan-y' }}
          >
            
            <div
              className="w-full max-w-full flex justify-center transform-gpu"
              style={computeFlexiblePaperStyle()}
            >
              {pageChunks.length > 0 && pageChunks[safeCurrentPage] ? (
                renderPageContent(pageChunks[safeCurrentPage], safeCurrentPage)
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-amber-200 w-full max-w-xl mx-auto shadow-sm">
                  <p className="text-base font-bold text-slate-700">कोई प्रश्न उपलब्ध नहीं है</p>
                  <p className="text-xs text-slate-500 mt-1">कृपया विषय या कठिनाई फ़िल्टर बदलें।</p>
                </div>
              )}
            </div>

            {/* Side Tap Regions for Touch Screen */}
            {safeCurrentPage > 0 && (
              <button
                onClick={handlePrevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 sm:w-12 h-24 sm:h-28 bg-[#FF9933]/30 hover:bg-[#FF9933]/50 text-[#000080] rounded-r-2xl flex items-center justify-center transition shadow-lg backdrop-blur-xs z-30"
                title="पिछला पेज पलटे"
              >
                <ChevronLeft className="w-6 sm:w-8 h-6 sm:h-8" />
              </button>
            )}

            {safeCurrentPage < totalPages - 1 && (
              <button
                onClick={handleNextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 sm:w-12 h-28 sm:h-28 bg-[#FF9933]/30 hover:bg-[#FF9933]/50 text-[#000080] rounded-l-2xl flex items-center justify-center transition shadow-lg backdrop-blur-xs z-30"
                title="अगला पेज पलटे"
              >
                <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8" />
              </button>
            )}

          </div>

          {/* Hidden Root for Full PDF Export */}
          <div id="pdf-document-root" className="hidden">
            {pageChunks.map((chunk, idx) => renderPageContent(chunk || [], idx))}
          </div>

        </div>
      ) : (
        /* REGULAR SCROLLING PDF VIEW MODE */
        <div id="pdf-document-root" className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full overflow-hidden">
          {pageChunks.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-amber-200 rounded-3xl p-8">
              <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">कोई प्रश्न चयनित नहीं है</h3>
              <p className="text-sm text-slate-500">PDF देखने के लिए ऊपर प्रश्न चुनें या नया प्रश्न जोड़ें।</p>
            </div>
          ) : (
            pageChunks.map((chunk, pageIndex) => renderPageContent(chunk || [], pageIndex))
          )}
        </div>
      )}

    </div>
  );
};
