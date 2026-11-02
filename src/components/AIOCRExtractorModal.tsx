import React, { useState } from 'react';
import { Question } from '../types';
import { X, Upload, ScanLine, FileText, Image as ImageIcon, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';

interface AIOCRExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Question[]) => void;
}

export const AIOCRExtractorModal: React.FC<AIOCRExtractorModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedQs, setExtractedQs] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setErrorMsg(null);
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRunOCR = async () => {
    if (!file && !pastedText.trim()) {
      setErrorMsg('कृपया कोई फोटो/PDF फ़ाइल चुनें या प्रश्न सामग्री पेस्ट करें!');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setExtractedQs([]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (pastedText.trim()) {
        formData.append('text', pastedText);
      }

      const res = await fetch('/api/ocr-extract', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'प्रश्न एक्सट्रैक्ट करने में त्रुटि हुई।');
      }

      if (data.questions && data.questions.length > 0) {
        const formatted: Question[] = data.questions.map((q: any, idx: number) => ({
          id: `ocr-${Date.now()}-${idx}`,
          code: `OCR-${Math.floor(100 + Math.random() * 900)}`,
          question: q.question || 'अनपेक्षित प्रश्न',
          optionA: q.optionA || 'विकल्प A',
          optionB: q.optionB || 'विकल्प B',
          optionC: q.optionC || 'विकल्प C',
          optionD: q.optionD || 'विकल्प D',
          answerKey: (['A', 'B', 'C', 'D'].includes(q.answerKey?.toUpperCase()) ? q.answerKey.toUpperCase() : 'A') as any,
          category: q.category || 'UP Special',
          examFocus: 'UP PCS 2026-2027',
          explanation: q.explanation || 'Gemini AI द्वारा एक्सट्रैक्ट किया गया प्रश्न।',
          difficulty: 'Medium'
        }));
        setExtractedQs(formatted);
      } else {
        setErrorMsg('कोई प्रश्न नहीं मिला। कृपया स्पष्ट चित्र या टेक्स्ट प्रदान करें।');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'नेटवर्क त्रुटि।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAll = () => {
    if (extractedQs.length > 0) {
      onImportQuestions(extractedQs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-amber-200 text-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-4 sm:my-6">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#fff7ed] border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#FF9933] text-white shadow-md">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#000080] font-outfit flex flex-wrap items-center gap-1.5 sm:gap-2">
                AI स्कैनर & OCR Extractor
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#ea580c] border border-amber-200 font-mono">
                  Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600">फोटो, PDF बुकलेट या टेक्स्ट से MCQs निकालें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-amber-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto font-hind">
          
          {/* Tab Selection */}
          <div className="flex border-b border-amber-200 gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition border-b-2 ${
                activeTab === 'upload'
                  ? 'border-[#FF9933] text-[#FF9933]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> प्रश्न पत्र फोटो / PDF
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition border-b-2 ${
                activeTab === 'text'
                  ? 'border-[#FF9933] text-[#FF9933]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> टेक्स्ट सामग्री
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-amber-200 hover:border-[#FF9933] rounded-2xl p-4 sm:p-6 text-center bg-[#fff7ed] transition">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ocr-file-input"
                />
                <label htmlFor="ocr-file-input" className="cursor-pointer space-y-2.5 block">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FF9933]/15 text-[#ea580c] border border-[#FF9933]/30 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">प्रश्न पत्र का चित्र (Image) या PDF चुनें</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP या PDF (अधिकतम 15MB)</p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#FF9933]" />
                    <div className="truncate max-w-[200px] sm:max-w-xs">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    हटाएं
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="max-h-40 sm:max-h-48 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-40 sm:max-h-48 object-contain" />
                </div>
              )}
            </div>
          ) : (
            /* Text Tab */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                प्रश्न सामग्री यहाँ पेस्ट करें (Unstructured Text):
              </label>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="उदा: 1. उत्तर प्रदेश की राजधानी क्या है? A) कानपुर B) लखनऊ C) प्रयागराज D) आगरा उत्तर: B..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-[#FF9933] font-devanagari resize-none"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {errorMsg}
            </div>
          )}

          {/* Action Run Button */}
          <button
            onClick={handleRunOCR}
            disabled={isLoading}
            className="w-full py-3 bg-[#FF9933] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-200" />
                Gemini AI प्रश्नों का विश्लेषण कर रहा है...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                AI द्वारा प्रश्न एक्सट्रैक्ट करें (Extract MCQs)
              </>
            )}
          </button>

          {/* Extracted Questions Preview List */}
          {extractedQs.length > 0 && (
            <div className="pt-4 border-t border-amber-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#138808] flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> एक्सट्रैक्ट किए गए कुल {extractedQs.length} प्रश्न
                </h3>
                <button
                  onClick={handleImportAll}
                  className="px-3.5 py-1.5 bg-[#138808] hover:bg-[#0f6b06] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow transition"
                >
                  सब बैंक में जोड़ें
                </button>
              </div>

              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {extractedQs.map((q, idx) => (
                  <div key={idx} className="p-3 bg-[#fff7ed] border border-amber-200 rounded-xl text-xs space-y-1 text-slate-900">
                    <p className="font-bold">Q{idx + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-1 text-slate-700 text-[11px] font-mono">
                      <span>(a) {q.optionA}</span>
                      <span>(b) {q.optionB}</span>
                      <span>(c) {q.optionC}</span>
                      <span>(d) {q.optionD}</span>
                    </div>
                    <p className="text-[10px] text-[#138808] font-bold">उत्तर: ({q.answerKey})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
