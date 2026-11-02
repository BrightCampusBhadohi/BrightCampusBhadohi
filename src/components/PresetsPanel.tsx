import React, { useState } from 'react';
import { Question, CategoryType } from '../types';
import { Sparkles, Zap, Loader2 } from 'lucide-react';

interface PresetsPanelProps {
  allQuestions: Question[];
  onSelectQuestions: (selected: Question[]) => void;
  onAddGeneratedQuestions: (questions: Question[]) => void;
}

export const PresetsPanel: React.FC<PresetsPanelProps> = ({
  allQuestions,
  onSelectQuestions,
  onAddGeneratedQuestions
}) => {
  const [customTopic, setCustomTopic] = useState('');
  const [customCount, setCustomCount] = useState(5);
  const [customDiff, setCustomDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);

  // Preset Filters
  const handleLoadPreset = (presetType: string) => {
    let filtered: Question[] = [];
    switch (presetType) {
      case 'up-pcs-ca':
        filtered = allQuestions.filter(q => q.category === 'National Current Affairs' || q.category === 'UP Special' || q.category === 'Budget & Economy');
        break;
      case 'up-special':
        filtered = allQuestions.filter(q => q.category === 'UP Special');
        break;
      case 'csat':
        filtered = allQuestions.filter(q => q.category === 'CSAT Math' || q.category === 'CSAT Reasoning');
        break;
      case 'gs1-polity-env':
        filtered = allQuestions.filter(q => q.category === 'GS Polity' || q.category === 'GS Environment' || q.category === 'GS History');
        break;
      case 'all':
      default:
        filtered = [...allQuestions];
        break;
    }
    if (filtered.length > 0) {
      onSelectQuestions(filtered);
    }
  };

  const handleGenerateAiQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      alert('कृपया प्रश्न जनरेशन हेतु कोई विषय लिखें!');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic,
          count: customCount,
          difficulty: customDiff
        })
      });

      const data = await res.json();
      if (data.success && data.questions) {
        const formatted: Question[] = data.questions.map((q: any, idx: number) => ({
          id: `ai-gen-${Date.now()}-${idx}`,
          code: `AI-${Math.floor(100 + Math.random() * 900)}`,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          answerKey: q.answerKey as any,
          category: (q.category as CategoryType) || 'UP Special',
          examFocus: 'UP PCS 2026-2027',
          explanation: q.explanation || '',
          difficulty: customDiff
        }));

        onAddGeneratedQuestions(formatted);
        setCustomTopic('');
      } else {
        alert('प्रश्न तैयार करने में समस्या आई: ' + (data.error || 'अज्ञात त्रुटि'));
      }
    } catch (err: any) {
      console.error(err);
      alert('नेटवर्क त्रुटि।');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5 font-hind text-slate-900">
      
      {/* Preset Test Papers Card */}
      <div className="bg-white border border-amber-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FF9933]/15 text-[#ea580c] border border-[#FF9933]/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#000080] font-outfit">त्वरित टेस्ट पेपर प्रीसेट (Instant Test Presets)</h3>
            <p className="text-xs text-slate-600">1-क्लिक में UP PCS 2026-2027 तथा UPSC हेतु मॉडल पेपर लोड करें</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <button
            onClick={() => handleLoadPreset('up-pcs-ca')}
            className="p-4 rounded-2xl bg-[#fff7ed] border border-amber-200 hover:border-[#FF9933] text-left transition group active:scale-[0.99]"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#ea580c] border border-[#FF9933]/30">
              UP PCS 2026-2027
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-[#FF9933] transition">
              समसामयिकी (Current Affairs)
            </h4>
            <p className="text-xs text-slate-500 mt-1">राष्ट्रीय, अंतर्राष्ट्रीय एवं आर्थिक घटनाएं</p>
          </button>

          <button
            onClick={() => handleLoadPreset('up-special')}
            className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:border-[#138808] text-left transition group active:scale-[0.99]"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#138808] border border-emerald-300">
              भदोही एवं उत्तर प्रदेश
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-[#138808] transition">
              UP Special & ODOP पेपर
            </h4>
            <p className="text-xs text-slate-500 mt-1">कालीन नगरी, भूगोल एवं राज्य विशेष</p>
          </button>

          <button
            onClick={() => handleLoadPreset('csat')}
            className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 hover:border-[#000080] text-left transition group active:scale-[0.99]"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-[#000080] border border-indigo-300">
              UPSC CSAT
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-[#000080] transition">
              Maths & Reasoning स्पीड सेट
            </h4>
            <p className="text-xs text-slate-500 mt-1">संख्यात्मक योग्यता एवं तर्कशक्ति</p>
          </button>

          <button
            onClick={() => handleLoadPreset('all')}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#FF9933] text-left transition group active:scale-[0.99]"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              मास्टर कलेक्शन
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-[#FF9933] transition">
              संपूर्ण प्रश्न बैंक ({allQuestions.length} Qs)
            </h4>
            <p className="text-xs text-slate-500 mt-1">सभी विषयों का संयुक्त संग्रह</p>
          </button>

        </div>
      </div>

      {/* AI Custom Question Generator Card */}
      <div className="bg-white border border-amber-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#138808]/10 text-[#138808] border border-[#138808]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#000080] font-outfit">AI कस्टम प्रश्न जनरेटर (Gemini 3.8 Flash)</h3>
            <p className="text-xs text-slate-600">अपनी इच्छानुसार किसी भी टॉपिक पर नए प्रश्न तैयार करें</p>
          </div>
        </div>

        <form onSubmit={handleGenerateAiQuestions} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">विषय / टॉपिक (Topic Name)</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="उदा. उत्तर प्रदेश बजट 2026-27, गंगा एक्सप्रेसवे..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF9933] font-devanagari"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">प्रश्नों की संख्या (Count)</label>
            <select
              value={customCount}
              onChange={(e) => setCustomCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF9933]"
            >
              <option value={3}>3 प्रश्न</option>
              <option value={5}>5 प्रश्न</option>
              <option value={10}>10 प्रश्न</option>
              <option value={15}>15 प्रश्न</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 bg-[#FF9933] hover:bg-[#ea580c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 min-h-[42px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                AI बना रहा है...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                AI प्रश्न तैयार करें
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
};
