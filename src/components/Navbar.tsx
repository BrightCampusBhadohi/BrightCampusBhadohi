import React from 'react';
import { FileText, ScanLine, Award, Sparkles, Plus, Download } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'quiz' | 'ocr' | 'presets';
  setActiveTab: (tab: 'studio' | 'quiz' | 'ocr' | 'presets') => void;
  questionCount: number;
  onOpenAddModal: () => void;
  onOpenHeaderModal: () => void;
  onExportPDF: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  questionCount,
  onOpenAddModal,
  onOpenHeaderModal,
  onExportPDF
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-md">
      
      {/* Indian Flag Top Tricolor Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white border-y border-slate-200"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Identity with Tiranga Emblem */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9933] via-amber-400 to-[#138808] p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-[#000080] font-black text-lg border border-amber-200">
                🇮🇳
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-[#000080] tracking-wide font-outfit uppercase">
                  BRIGHT CAMPUS <span className="text-[#FF9933] font-extrabold">PDF STUDIO</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-[#b45309] border border-amber-500/30 font-bold">
                  BHADOHI
                </span>
              </div>
              <p className="text-[11px] text-[#138808] font-hind font-bold">
                UP PCS 2026-2027 & UPSC Preparation Suite
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#fff7ed] p-1.5 rounded-2xl border border-amber-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                activeTab === 'studio'
                  ? 'bg-[#FF9933] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#000080] hover:bg-amber-100/60'
              }`}
            >
              <FileText className="w-4 h-4" /> PDF स्टूडियो
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-[#000080] text-[10px] font-bold shadow-xs">
                {questionCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                activeTab === 'presets'
                  ? 'bg-[#FF9933] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#000080] hover:bg-amber-100/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> प्रीसेट मॉडल पेपर
            </button>

            <button
              onClick={() => setActiveTab('ocr')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                activeTab === 'ocr'
                  ? 'bg-[#FF9933] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#000080] hover:bg-amber-100/60'
              }`}
            >
              <ScanLine className="w-4 h-4 text-[#000080]" /> AI स्कैनर & OCR
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                activeTab === 'quiz'
                  ? 'bg-[#138808] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#138808] hover:bg-emerald-100/60'
              }`}
            >
              <Award className="w-4 h-4 text-[#138808]" /> ऑनलाइन टेस्ट (Quiz)
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-[#138808] hover:bg-[#0f6b06] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#138808]/20 transition"
              title="नया प्रश्न जोड़ें"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">नया प्रश्न</span>
            </button>

            <button
              onClick={onExportPDF}
              className="px-3.5 py-2 bg-gradient-to-r from-[#FF9933] to-[#ea580c] hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#FF9933]/30 transition"
              title="PDF डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-amber-100" />
              <span className="hidden sm:inline">PDF डाउनलोड</span>
            </button>

          </div>

        </div>

        {/* Mobile Tab Bar with Tiranga theme */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-amber-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'studio' ? 'text-[#FF9933] font-bold' : 'text-slate-600'}`}
          >
            <FileText className="w-4 h-4" />
            <span>स्टूडियो ({questionCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'presets' ? 'text-[#FF9933] font-bold' : 'text-slate-600'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>प्रीसेट</span>
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'ocr' ? 'text-[#000080] font-bold' : 'text-slate-600'}`}
          >
            <ScanLine className="w-4 h-4" />
            <span>AI OCR</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'quiz' ? 'text-[#138808] font-bold' : 'text-slate-600'}`}
          >
            <Award className="w-4 h-4" />
            <span>ऑनलाइन टेस्ट</span>
          </button>
        </div>

      </div>
    </header>
  );
};
