import React from 'react';
import { FileText, ScanLine, Award, Sparkles, Plus, Download, GraduationCap, Calculator } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'quiz' | 'ocr' | 'presets';
  setActiveTab: (tab: 'studio' | 'quiz' | 'ocr' | 'presets') => void;
  questionCount: number;
  onOpenAddModal: () => void;
  onOpenHeaderModal: () => void;
  onExportPDF: () => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  onOpenMathsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  questionCount,
  onOpenAddModal,
  onOpenHeaderModal,
  onExportPDF,
  isAdmin,
  onAdminLogout,
  onOpenMathsModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
      
      {/* Indian Flag Top Tricolor Stripe */}
      <div className="h-2 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-2 pt-2">
        <div className="flex items-center justify-between min-h-20 gap-2">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer py-1" onClick={() => setActiveTab('studio')}>
            <div className="w-20 h-20 shrink-0 rounded-full bg-white p-0.5 shadow-md border-2 border-amber-300">
              <img src="/assets/aistudio/Square150x150Logo.scale-200_9bff154c.png" alt="Bright Campus Bhadohi" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#000080] tracking-tight uppercase leading-none drop-shadow-xs">
                BRIGHT CAMPUS <span className="text-[#FF9933]">BHADOHI</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#138808] font-hind font-bold tracking-tight leading-none mt-1.5">
                UP PCS | SSC | RAILWAY | BANKING | ARMY | TEACHING
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#fff7ed] p-1 rounded-xl border border-amber-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'studio'
                  ? 'bg-[#FF9933] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#000080]'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> क्लास ({questionCount})
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    activeTab === 'presets'
                      ? 'bg-[#FF9933] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#000080]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" /> प्रीसेट
                </button>
                <button
                  onClick={() => setActiveTab('ocr')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    activeTab === 'ocr'
                      ? 'bg-[#FF9933] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#000080]'
                  }`}
                >
                  <ScanLine className="w-4 h-4" /> AI OCR
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'quiz'
                  ? 'bg-[#138808] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#138808]'
              }`}
            >
              <Award className="w-4 h-4" /> टेस्ट
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* Maths Formulas Button */}
            {onOpenMathsModal && (
              <button
                onClick={onOpenMathsModal}
                className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 via-[#ea580c] to-[#000080] hover:opacity-95 text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-md transition cursor-pointer"
                title="गणित आसान सूत्र एवं शॉर्ट-ट्रिक्स"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="tracking-tight">गणित सूत्र</span>
              </button>
            )}

            {isAdmin && (
              <div className="hidden lg:flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold">
                <span>👑 एडमिन</span>
                <button
                  onClick={onAdminLogout}
                  className="text-red-700 hover:text-red-900 underline text-[11px] ml-1"
                  title="एडमिन लॉगआउट"
                >
                  लॉगआउट
                </button>
              </div>
            )}
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="px-2.5 py-1.5 bg-[#138808] hover:bg-[#0e6606] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
                title="नया प्रश्न जोड़ें"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">प्रश्न</span>
              </button>
            )}
            <button
              onClick={onExportPDF}
              className="px-2.5 py-1.5 bg-[#FF9933] hover:bg-[#ea580c] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
              title="PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-around py-1.5 border-t border-amber-200 text-[10px] font-bold">
          <button onClick={() => setActiveTab('studio')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'studio' ? 'text-[#FF9933]' : 'text-slate-600'}`}>
            <GraduationCap className="w-4 h-4" /> क्लास
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('presets')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'presets' ? 'text-[#FF9933]' : 'text-slate-600'}`}>
                <Sparkles className="w-4 h-4" /> प्रीसेट
              </button>
              <button onClick={() => setActiveTab('ocr')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'ocr' ? 'text-[#000080]' : 'text-slate-600'}`}>
                <ScanLine className="w-4 h-4" /> AI OCR
              </button>
            </>
          )}
          <button onClick={() => setActiveTab('quiz')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'quiz' ? 'text-[#138808]' : 'text-slate-600'}`}>
            <Award className="w-4 h-4" /> टेस्ट
          </button>
        </div>
      </div>
    </header>
  );
};
