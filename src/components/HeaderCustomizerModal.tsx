import React from 'react';
import { HeaderConfig } from '../types';
import { X, Building2, Phone, MapPin, FileText, Sparkles, Check } from 'lucide-react';

interface HeaderCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
}

export const HeaderCustomizerModal: React.FC<HeaderCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof HeaderConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleResetDefault = () => {
    onChange({
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
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-amber-200 text-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header with Tiranga Stripe */}
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#138808]"></div>
        </div>

        <div className="px-6 py-4 bg-[#fff7ed] border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF9933]/15 text-[#ea580c] border border-[#FF9933]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#000080] font-outfit">कोचिंग संस्थान एवं हेडर कस्टमाइज़र</h2>
              <p className="text-xs text-slate-600">PDF हेडर, टैगलाइन, फोन नंबर तथा परीक्षा विवरण बदलें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-amber-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-hind">
          
          {/* Institute Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#FF9933] flex items-center gap-2">
              <Building2 className="w-4 h-4" /> कोचिंग संस्थान की जानकारी
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">संस्थान का नाम (Institute Name)</label>
                <input
                  type="text"
                  value={config.instituteName}
                  onChange={(e) => handleChange('instituteName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#FF9933]"
                  placeholder="BRIGHT CAMPUS BHADOHI"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">संपर्क नंबर (Contact Number)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={config.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#FF9933]"
                    placeholder="📞 +91 87075 25421"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">टैगलाइन / उपशीर्षक (Tagline)</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#FF9933]"
                placeholder="उत्तर प्रदेश लोक सेवा आयोग - समसामयिकी एवं राज्य विशेष अध्ययन केंद्र"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">संस्थान का पता (Address)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#FF9933]"
                  placeholder="Chauri Rd, BADI BAGH, Bhadohi, UP"
                />
              </div>
            </div>
          </div>

          <hr className="border-amber-200" />

          {/* Document Title & Subtitle */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#138808] flex items-center gap-2">
              <FileText className="w-4 h-4" /> प्रश्न पत्र शीर्षक विवरण
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">मुख्य शीर्षक (Document Title)</label>
              <input
                type="text"
                value={config.docTitle}
                onChange={(e) => handleChange('docTitle', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#138808] font-bold"
                placeholder="UP PCS PRELIMS 2026-2027 TOP 100 CURRENT AFFAIRS"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">उप-शीर्षक (Document Subtitle)</label>
              <input
                type="text"
                value={config.docSubtitle}
                onChange={(e) => handleChange('docSubtitle', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#138808]"
                placeholder="विशेष अभ्यास श्रृंखला - भदोही कैंपस अध्ययन सामग्री"
              />
            </div>
          </div>

          <hr className="border-amber-200" />

          {/* Watermark & Toggle options */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#000080] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9933]" /> वॉटरमार्क एवं दृश्यता विकल्प
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">समय, सेट नंबर व अंकन पंक्ति दिखाएं (Exam Specs Bar)</p>
                <p className="text-[11px] text-slate-500">हेडर के नीचे 'समय: 2 Hours | सेट कोड: SET-01...' पंक्ति दिखाएं</p>
              </div>
              <input
                type="checkbox"
                checked={config.showExamMetadataLine || false}
                onChange={(e) => handleChange('showExamMetadataLine', e.target.checked)}
                className="w-5 h-5 accent-[#FF9933] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">पृष्ठभूमि वॉटरमार्क दिखाएं (Watermark)</p>
                <p className="text-[11px] text-slate-500">PDF पेज के बीच में हल्का वॉटरमार्क दिखाई देगा</p>
              </div>
              <input
                type="checkbox"
                checked={config.showWatermark}
                onChange={(e) => handleChange('showWatermark', e.target.checked)}
                className="w-5 h-5 accent-[#FF9933] rounded cursor-pointer"
              />
            </div>

            {config.showWatermark && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">वॉटरमार्क टेक्स्ट (Watermark Text)</label>
                <input
                  type="text"
                  value={config.watermarkText}
                  onChange={(e) => handleChange('watermarkText', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#FF9933]"
                  placeholder="BRIGHT CAMPUS BHADOHI"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#fff7ed] border-t border-amber-200 flex items-center justify-between">
          <button
            onClick={handleResetDefault}
            className="text-xs text-slate-600 hover:text-slate-900 underline transition font-medium"
          >
            डिफ़ॉल्ट सेटिंग्स रीसेट करें
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#138808] hover:bg-[#0f6b06] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <Check className="w-4 h-4" /> सहेजें एवं लागू करें
          </button>
        </div>

      </div>
    </div>
  );
};
