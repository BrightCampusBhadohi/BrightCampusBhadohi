import React, { useState, useEffect } from 'react';
import { SarkariItem, INITIAL_SARKARI_UPDATES } from '../data/sarkariData';
import { X, Search, RefreshCw, ExternalLink, Briefcase, Award, FileText, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface SarkariUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SarkariUpdatesModal: React.FC<SarkariUpdatesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'job' | 'admit-card' | 'result' | 'army'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<SarkariItem[]>(INITIAL_SARKARI_UPDATES);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('03 मार्च 2026, 11:30 AM');
  const [isLiveFetched, setIsLiveFetched] = useState(false);

  const fetchLiveUpdates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sarkari-updates');
      const data = await res.json();
      if (data.success) {
        if (data.items && data.items.length > 0) {
          // Merge live items with initial rich database
          const liveMerged = [...data.items, ...INITIAL_SARKARI_UPDATES];
          setItems(liveMerged);
          setIsLiveFetched(true);
        }
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }
      }
    } catch (e) {
      console.log('Using stored authentic sarkari data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveUpdates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.postName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'army') return item.isArmy === true || item.organization.includes('Army') || item.title.includes('आर्मी');
    return item.category === activeTab;
  });

  const jobsCount = items.filter(i => i.category === 'job').length;
  const admitCount = items.filter(i => i.category === 'admit-card').length;
  const resultCount = items.filter(i => i.category === 'result').length;
  const armyCount = items.filter(i => i.isArmy).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-amber-300 overflow-hidden font-hind flex flex-col max-h-[92vh]">
        
        {/* Top Tricolor Bar & Header */}
        <div className="h-2 w-full flex shrink-0">
          <div className="h-full w-1/3 bg-[#FF9933]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#138808]"></div>
        </div>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 text-white p-4 sm:p-5 shrink-0 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white text-2xl shadow-inner shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-devanagari tracking-tight text-white flex items-center gap-2">
                  सरकारी रिजल्ट • लाइव अपडेट्स
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-red-950 font-black text-[10px] tracking-wider uppercase animate-pulse">
                  {isLiveFetched ? '● LIVE' : '2026 ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                नवीनतम भर्ती (Vacancy), एडमिट कार्ड (Admit Card) एवं परीक्षा परिणाम (Result)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveUpdates}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-white/20 cursor-pointer disabled:opacity-50"
              title="ताज़ा अपडेट प्राप्त करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">रीफ्रेश</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live News Alert Marquee */}
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-950 font-bold shrink-0 overflow-hidden">
          <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] shrink-0 font-black uppercase">
            ताज़ा सूचना
          </span>
          <div className="truncate">
            📢 UP PCS 2026 आवेदन शुरू | SSC GD एडमिट कार्ड उपलब्ध | UP Police सिपाही रिजल्ट जारी | भारतीय सेना अग्निवीर भर्ती 2026 पंजीकरण चालू!
          </div>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-amber-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="भर्ती, परीक्षा या विभाग खोजें..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF9933] font-devanagari"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              सभी ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'job'
                  ? 'bg-[#138808] text-white shadow-xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> भर्ती ({jobsCount})
            </button>
            <button
              onClick={() => setActiveTab('admit-card')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'admit-card'
                  ? 'bg-[#000080] text-white shadow-xs'
                  : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> एडमिट कार्ड ({admitCount})
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'result'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-red-800 hover:bg-red-50 border border-red-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> रिजल्ट ({resultCount})
            </button>
            <button
              onClick={() => setActiveTab('army')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'army'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              🪖 आर्मी ({armyCount})
            </button>
          </div>

        </div>

        {/* Content Body / Cards Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-[#fffbf5]">
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-amber-200 p-8 space-y-2">
              <p className="text-base font-bold text-slate-800">कोई सूचना नहीं मिली</p>
              <p className="text-xs text-slate-500">कृपया खोज शब्द बदलें या रीफ्रेश करें।</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                className="px-4 py-1.5 bg-[#FF9933] text-white text-xs font-bold rounded-xl"
              >
                सभी देखें
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-amber-200 hover:border-[#FF9933] p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    
                    {/* Top Row: Category Pill & Status Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                            item.category === 'job'
                              ? 'bg-emerald-100 text-[#138808] border border-emerald-200'
                              : item.category === 'admit-card'
                              ? 'bg-blue-100 text-[#000080] border border-blue-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {item.category === 'job' ? '💼 नवीनतम भर्ती' : item.category === 'admit-card' ? '🎫 एडमिट कार्ड' : '🏆 परीक्षा परिणाम'}
                        </span>

                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            {item.badge}
                          </span>
                        )}
                        {item.isArmy && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-white font-bold">
                            🪖 ARMY
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500 font-semibold">
                        {item.date}
                      </span>
                    </div>

                    {/* Vacancy / Notification Title */}
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#000080] group-hover:text-[#ea580c] transition leading-snug font-devanagari">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        आयोग / विभाग: <span className="text-slate-800">{item.organization}</span>
                      </p>
                    </div>

                    {/* Post & Eligibility Highlights */}
                    <div className="bg-[#fff7ed] p-2.5 rounded-xl border border-amber-100 text-xs space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-600 font-medium">पद का नाम:</span>
                        <span className="font-bold text-slate-900 text-right">{item.postName}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 font-medium">कुल पद:</span>
                        <span className="font-black text-[#138808]">{item.totalPosts}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 font-medium">योग्यता:</span>
                        <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{item.eligibility}</span>
                      </div>
                      {item.lastDate && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/50">
                          <span className="text-rose-700 font-bold">तिथि विवरण:</span>
                          <span className="font-bold text-rose-800 text-right">{item.lastDate}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {item.status}
                    </span>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-sm transition active:scale-95 ${
                        item.category === 'job'
                          ? 'bg-[#138808] hover:bg-[#0e6606]'
                          : item.category === 'admit-card'
                          ? 'bg-[#000080] hover:bg-[#000060]'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <span>
                        {item.category === 'job' ? 'आवेदन लिंक / विवरण' : item.category === 'admit-card' ? 'एडमिट कार्ड डाउनलोड' : 'रिजल्ट / मेरिट सूची'}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>स्रोत: SarkariResult & आधिकारिक भर्ती आयोग</span>
            <span className="text-slate-400">|</span>
            <span>अंतिम अपडेट: {lastUpdated}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
