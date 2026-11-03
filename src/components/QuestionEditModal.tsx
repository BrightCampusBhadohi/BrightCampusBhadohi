import React, { useState, useEffect } from 'react';
import { Question, CategoryType } from '../types';
import { CATEGORIES } from '../data/questionsData';
import { X, Plus, Save } from 'lucide-react';

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion
}) => {
  const [formData, setFormData] = useState<Question>({
    id: '',
    code: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answerKey: 'A',
    category: 'UP Special',
    examFocus: 'UP PCS 2026-2027',
    explanation: '',
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialQuestion) {
      setFormData(initialQuestion);
    } else {
      setFormData({
        id: `custom-${Date.now()}`,
        code: `Q-${Math.floor(100 + Math.random() * 900)}`,
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        answerKey: 'A',
        category: 'UP Special',
        examFocus: 'UP PCS 2026-2027',
        explanation: '',
        difficulty: 'Medium'
      });
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      alert('कृपया प्रश्न पाठ दर्ज करें।');
      return;
    }
    if (!formData.optionA.trim() || !formData.optionB.trim()) {
      alert('कृपया कम से कम विकल्प A और B दर्ज करें।');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1e12]/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#fffdf9] border border-[#d8c5a8] text-[#2c1e12] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#f5efe6] border-b border-[#d8c5a8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#047857]/15 text-[#047857] border border-[#047857]/30">
              {initialQuestion ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2c1e12] font-outfit">
                {initialQuestion ? 'प्रश्न संपादित करें (Edit Question)' : 'नया प्रश्न जोड़ें (Add New Question)'}
              </h2>
              <p className="text-xs text-[#6e5944]">UP PCS / UPSC परीक्षा हेतु प्रश्न और व्याख्या दर्ज करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6e5944] hover:text-[#2c1e12] hover:bg-[#e8decb] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-hind">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#594433] mb-1">विषय श्रेणी (Category)</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                className="w-full px-3 py-2 bg-[#f8f3ea] border border-[#d8c5a8] rounded-lg text-xs text-[#2c1e12] focus:outline-none focus:border-[#8c5319]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594433] mb-1">परीक्षा का नाम (Exam Focus)</label>
              <select
                value={formData.examFocus}
                onChange={(e) => setFormData({ ...formData, examFocus: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#f8f3ea] border border-[#d8c5a8] rounded-lg text-xs text-[#2c1e12] focus:outline-none focus:border-[#8c5319]"
              >
                <option value="UP PCS 2026-2027">UP PCS 2026-2027</option>
                <option value="UP Special">UP Special</option>
                <option value="UPSC GS-1">UPSC GS-1</option>
                <option value="UPSC CSAT">UPSC CSAT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594433] mb-1">कठिनाई (Difficulty)</label>
              <select
                value={formData.difficulty || 'Medium'}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#f8f3ea] border border-[#d8c5a8] rounded-lg text-xs text-[#2c1e12] focus:outline-none focus:border-[#8c5319]"
              >
                <option value="Easy">Easy (सरल)</option>
                <option value="Medium">Medium (मध्यम)</option>
                <option value="Hard">Hard (कठिन)</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-[#594433] mb-1">प्रश्न (Question Text in Hindi/English)</label>
            <textarea
              rows={3}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="उदा. उत्तर प्रदेश के किस जिले को कालीन नगरी (Carpet City) के नाम से जाना जाता है?"
              className="w-full px-3 py-2 bg-[#f8f3ea] border border-[#d8c5a8] rounded-xl text-sm text-[#2c1e12] focus:outline-none focus:border-[#8c5319] font-devanagari resize-none"
              required
            />
          </div>

          {/* Options (A, B, C, D) & Correct Answer Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#b45309]">विकल्प एवं सही उत्तर (Options & Correct Key)</label>
            
            {[
              { key: 'optionA', label: 'Option A', val: formData.optionA, code: 'A' },
              { key: 'optionB', label: 'Option B', val: formData.optionB, code: 'B' },
              { key: 'optionC', label: 'Option C', val: formData.optionC, code: 'C' },
              { key: 'optionD', label: 'Option D', val: formData.optionD, code: 'D' },
            ].map((opt) => (
              <div key={opt.key} className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer min-w-[90px]">
                  <input
                    type="radio"
                    name="correctAnswerKey"
                    checked={formData.answerKey === opt.code}
                    onChange={() => setFormData({ ...formData, answerKey: opt.code as any })}
                    className="w-4 h-4 accent-[#047857]"
                  />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${formData.answerKey === opt.code ? 'bg-emerald-100 text-[#047857] border border-emerald-300' : 'bg-[#e8decb] text-[#594433]'}`}>
                    {opt.code})
                  </span>
                </label>
                <input
                  type="text"
                  value={opt.val}
                  onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.value })}
                  placeholder={`विकल्प ${opt.code} का उत्तर लिखें`}
                  className="w-full px-3 py-1.5 bg-[#f8f3ea] border border-[#d8c5a8] rounded-lg text-sm text-[#2c1e12] focus:outline-none focus:border-[#8c5319]"
                  required
                />
              </div>
            ))}
          </div>

          {/* Explanation in Hindi */}
          <div>
            <label className="block text-xs font-semibold text-[#594433] mb-1">
              चरणबद्ध व्याख्या (स्पष्टीकरण)
            </label>
            <textarea
              rows={3}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="प्रश्न का स्पष्टीकरण एवं अतिरिक्त तथ्य..."
              className="w-full px-3 py-2 bg-[#f8f3ea] border border-[#d8c5a8] rounded-xl text-xs text-[#2c1e12] focus:outline-none focus:border-[#8c5319] font-devanagari resize-none"
            />
          </div>

          {/* Modal Buttons */}
          <div className="pt-3 border-t border-[#e2d3bd] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6e5944] hover:text-[#2c1e12] transition"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <Save className="w-4 h-4" /> सहेजें (Save Question)
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
