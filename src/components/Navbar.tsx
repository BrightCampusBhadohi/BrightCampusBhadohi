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
  const isAdmin = true; // Placeholder for admin logic
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
      
      {/* Indian Flag Top Tricolor Stripe */}
      <div className="h-2 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-2 pt-2">
        <div className="flex items-center justify-between h-20 gap-2">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-20 h-20 rounded-full bg-white p-0.5 shadow-sm border border-amber-200">
              <img src="/assets/aistudio/Square150x150Logo.scale-200_9bff154c.png" alt="Bright Campus Bhadohi" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#000080] tracking-tight uppercase leading-none">
                BRIGHT CAMPUS <span className="text-[#FF9933]">BHADOHI</span>
              </h1>
              <p className="text-[10px] text-[#138808] font-hind font-bold tracking-tight leading-none mt-1">
                UP PCS | SSC | RAILWAY | BANKING | TEACHING
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5 bg-[#fff7ed] p-0.5 rounded-xl border border-amber-200 text-[10px] font-semibold">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'studio'
                  ? 'bg-[#FF9933] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#000080]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> स्टूडियो ({questionCount})
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                    activeTab === 'presets'
                      ? 'bg-[#FF9933] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#000080]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> प्रीसेट
                </button>
                <button
                  onClick={() => setActiveTab('ocr')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                    activeTab === 'ocr'
                      ? 'bg-[#FF9933] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#000080]'
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5" /> AI OCR
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'quiz'
                  ? 'bg-[#138808] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#138808]'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> टेस्ट
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenAddModal}
              className="px-2 py-1.5 bg-[#138808] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
              title="नया प्रश्न"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">प्रश्न</span>
            </button>
            <button
              onClick={onExportPDF}
              className="px-2 py-1.5 bg-[#FF9933] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
              title="PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-between py-1.5 border-t border-amber-200 text-[9px] font-bold">
          <button onClick={() => setActiveTab('studio')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'studio' ? 'text-[#FF9933]' : 'text-slate-600'}`}>
            <FileText className="w-3.5 h-3.5" /> स्टूडियो
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('presets')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'presets' ? 'text-[#FF9933]' : 'text-slate-600'}`}>
                <Sparkles className="w-3.5 h-3.5" /> प्रीसेट
              </button>
              <button onClick={() => setActiveTab('ocr')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'ocr' ? 'text-[#000080]' : 'text-slate-600'}`}>
                <ScanLine className="w-3.5 h-3.5" /> OCR
              </button>
            </>
          )}
          <button onClick={() => setActiveTab('quiz')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'quiz' ? 'text-[#138808]' : 'text-slate-600'}`}>
            <Award className="w-3.5 h-3.5" /> टेस्ट
          </button>
        </div>
      </div>
    </header>
  );
};
