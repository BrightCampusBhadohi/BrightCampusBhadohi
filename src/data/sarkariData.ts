export interface SarkariItem {
  id: string;
  title: string;           // भर्ती / परीक्षा का नाम
  organization: string;    // भर्ती बोर्ड (UPPSC, SSC, Railway, Indian Army, etc.)
  postName: string;        // पद का नाम
  totalPosts: string;      // कुल पद
  category: 'job' | 'admit-card' | 'result';
  date: string;            // तारीख / अपडेट
  lastDate?: string;       // अंतिम तिथि / परीक्षा तिथि
  status: string;          // सक्रिय / जारी / घोषित
  eligibility: string;     // शैक्षणिक योग्यता
  link: string;            // आधिकारिक लिंक
  badge?: 'नया' | 'महत्वपूर्ण' | 'लाइव' | 'अंतिम तिथि';
  isArmy?: boolean;
}

export const INITIAL_SARKARI_UPDATES: SarkariItem[] = [
  // ==================== LATEST JOBS (नवीनतम भर्ती / रिक्तियां) ====================
  {
    id: 'job-01',
    title: 'UP PCS 2026 संयुक्त राज्य / प्रवर अधीनस्थ सेवा परीक्षा',
    organization: 'उत्तर प्रदेश लोक सेवा आयोग (UPPSC)',
    postName: 'डिप्टी कलेक्टर (SDM), डीएसपी (DSP), बीडीओ (BDO), एआरसी (ARTO) आदि',
    totalPosts: '220+ पद (संभावित वृद्धि)',
    category: 'job',
    date: '02 मार्च 2026',
    lastDate: '31 मार्च 2026',
    status: 'ऑनलाइन आवेदन जारी',
    eligibility: 'स्नातक (Bachelor Degree in any stream)',
    link: 'https://uppsc.up.nic.in',
    badge: 'महत्वपूर्ण'
  },
  {
    id: 'job-02',
    title: 'भारतीय सेना अग्निवीर रैली भर्ती 2026 (Indian Army Agniveer)',
    organization: 'भारतीय थल सेना (Join Indian Army)',
    postName: 'अग्निवीर जीडी (GD), तकनीकी (Tech), क्लर्क (Clerk), ट्रेड्समैन',
    totalPosts: '25,000+ पद (विभिन्न एआरओ/ज़ोन)',
    category: 'job',
    date: '01 मार्च 2026',
    lastDate: '22 मार्च 2026',
    status: 'ऑनलाइन पंजीकरण चालू',
    eligibility: '10वीं / 12वीं उत्तीर्ण (आयु: 17.5 से 21 वर्ष)',
    link: 'https://joinindianarmy.nic.in',
    badge: 'नया',
    isArmy: true
  },
  {
    id: 'job-03',
    title: 'रेलवे आरपीएफ एसआई एवं कांस्टेबल भर्ती 2026 (RRB RPF)',
    organization: 'रेलवे भर्ती बोर्ड (RRB)',
    postName: 'सब इंस्पेक्टर (SI) एवं कांस्टेबल (Constable)',
    totalPosts: '4,660 पद',
    category: 'job',
    date: '28 फरवरी 2026',
    lastDate: '15 अप्रैल 2026',
    status: 'ऑनलाइन फॉर्म सक्रिय',
    eligibility: '10वीं पास (कांस्टेबल) / स्नातक (एसआई)',
    link: 'https://www.rrbapply.gov.in',
    badge: 'लाइव'
  },
  {
    id: 'job-04',
    title: 'उत्तर प्रदेश पुलिस उप-निरीक्षक (UP Police SI) भर्ती 2026',
    organization: 'उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड (UPPRPB)',
    postName: 'सब इंस्पेक्टर (नागरिक पुलिस) एवं प्लाटून कमांडर',
    totalPosts: '4,200 पद (विज्ञप्ति जारी)',
    category: 'job',
    date: '27 फरवरी 2026',
    lastDate: '25 अप्रैल 2026',
    status: 'विस्तृत अधिसूचना जारी',
    eligibility: 'किसी भी मान्यता प्राप्त विश्वविद्यालय से स्नातक',
    link: 'https://uppbpb.gov.in',
    badge: 'महत्वपूर्ण'
  },
  {
    id: 'job-05',
    title: 'एसएससी सीजीएल (SSC CGL 2026) भर्ती परीक्षा',
    organization: 'कर्मचारी चयन आयोग (Staff Selection Commission)',
    postName: 'सहायक अनुभाग अधिकारी (ASO), इनकम टैक्स इंस्पेक्टर, आबकारी निरीक्षक',
    totalPosts: '14,500+ पद',
    category: 'job',
    date: '25 फरवरी 2026',
    lastDate: '30 अप्रैल 2026',
    status: 'आवेदन शुरू',
    eligibility: 'स्नातक (Any Degree)',
    link: 'https://ssc.gov.in',
    badge: 'लाइव'
  },
  {
    id: 'job-06',
    title: 'बिहार शिक्षक भर्ती (BPSC TRE 4.0) 2026',
    organization: 'बिहार लोक सेवा आयोग (BPSC)',
    postName: 'प्राथमिक (PRT), मध्य (TGT) एवं उच्च माध्यमिक (PGT) शिक्षक',
    totalPosts: '75,000+ पद',
    category: 'job',
    date: '24 फरवरी 2026',
    lastDate: '10 अप्रैल 2026',
    status: 'अधिसूचना जारी',
    eligibility: 'डी.एल.एड / बी.एड एवं सीटीईटी/एसटीईटी उत्तीर्ण',
    link: 'https://bpsc.bih.nic.in',
    badge: 'नया'
  },
  {
    id: 'job-07',
    title: 'भारतीय वायुसेना अग्निवीर वायु (IAF Agniveervayu 01/2026)',
    organization: 'भारतीय वायु सेना (Indian Air Force)',
    postName: 'अग्निवीर वायु (विज्ञान एवं गैर-विज्ञान संकाय)',
    totalPosts: '3,500+ पद',
    category: 'job',
    date: '20 फरवरी 2026',
    lastDate: '28 मार्च 2026',
    status: 'ऑनलाइन आवेदन आमंत्रित',
    eligibility: '12वीं (गणित, भौतिकी, अंग्रेजी) अथवा 3-वर्षीय डिप्लोमा',
    link: 'https://agnipathvayu.cdac.in',
    badge: 'नया',
    isArmy: true
  },

  // ==================== ADMIT CARDS (प्रवेश पत्र / एडमिट कार्ड) ====================
  {
    id: 'admit-01',
    title: 'UP PCS 2026 प्रारंभिक परीक्षा एडमिट कार्ड व एग्जाम सिटी स्लिप',
    organization: 'उत्तर प्रदेश लोक सेवा आयोग (UPPSC)',
    postName: 'संयुक्त राज्य प्रवर अधीनस्थ सेवा (प्रारंभिक) परीक्षा',
    totalPosts: '220 पद',
    category: 'admit-card',
    date: '02 मार्च 2026',
    lastDate: 'परीक्षा तिथि: 12 अप्रैल 2026',
    status: 'डाउनलोड हेतु उपलब्ध',
    eligibility: 'पंजीकृत अभ्यर्थी अपना OTR नंबर दर्ज कर डाउनलोड करें',
    link: 'https://uppsc.up.nic.in',
    badge: 'लाइव'
  },
  {
    id: 'admit-02',
    title: 'एसएससी जीडी कांस्टेबल (SSC GD) परीक्षा प्रवेश पत्र 2026',
    organization: 'कर्मचारी चयन आयोग (SSC)',
    postName: 'जीडी कांस्टेबल (CRPF, BSF, CISF, ITBP, SSB, AR)',
    totalPosts: '26,146 पद',
    category: 'admit-card',
    date: '01 मार्च 2026',
    lastDate: 'कंप्यूटर आधारित परीक्षा (CBT)',
    status: 'रीजनल वेबसाइट्स पर लिंक सक्रिय',
    eligibility: 'रोल नंबर / जन्मतिथि द्वारा डाउनलोड करें',
    link: 'https://ssc.gov.in',
    badge: 'महत्वपूर्ण',
    isArmy: true
  },
  {
    id: 'admit-03',
    title: 'रेलवे एएलपी (RRB Assistant Loco Pilot) सीबीटी-1 एडमिट कार्ड',
    organization: 'रेलवे भर्ती बोर्ड (RRB)',
    postName: 'असिस्टेंट लोको पायलट (ALP)',
    totalPosts: '18,799 पद',
    category: 'admit-card',
    date: '28 फरवरी 2026',
    lastDate: 'परीक्षा तिथि: मार्च 2026',
    status: 'सिटी इंटिमेशन एवं एडमिट कार्ड जारी',
    eligibility: 'रजिस्ट्रेशन आईडी एवं पासवर्ड से लॉगिन करें',
    link: 'https://www.rrbapply.gov.in',
    badge: 'लाइव'
  },
  {
    id: 'admit-04',
    title: 'भारतीय सेना अग्निवीर CEE प्रवेश पत्र 2026 (Common Entrance Exam)',
    organization: 'ज्वाइन इंडियन आर्मी (Join Indian Army)',
    postName: 'अग्निवीर जनरल ड्यूटी, टेक्निकल व क्लर्क',
    totalPosts: 'अखिल भारतीय स्तर',
    category: 'admit-card',
    date: '26 फरवरी 2026',
    lastDate: 'ऑनलाइन कंप्यूटर परीक्षा तिथि: 22 अप्रैल 2026',
    status: 'एडमिट कार्ड डाउनलोड शुरू',
    eligibility: 'आर्मी रोल नंबर एवं जन्मतिथि द्वारा',
    link: 'https://joinindianarmy.nic.in',
    badge: 'नया',
    isArmy: true
  },
  {
    id: 'admit-05',
    title: 'सीटीईटी (CTET 2026) परीक्षा प्रवेश पत्र',
    organization: 'केंद्रीय माध्यमिक शिक्षा बोर्ड (CBSE)',
    postName: 'केंद्रीय शिक्षक पात्रता परीक्षा (पेपर I व II)',
    totalPosts: 'पात्रता परीक्षा',
    category: 'admit-card',
    date: '25 फरवरी 2026',
    lastDate: 'परीक्षा तिथि: 19 अप्रैल 2026',
    status: 'एडमिट कार्ड जारी',
    eligibility: 'आवेदन संख्या एवं जन्मतिथि द्वारा',
    link: 'https://ctet.nic.in',
    badge: 'लाइव'
  },

  // ==================== RESULTS (परीक्षा परिणाम / रिजल्ट) ====================
  {
    id: 'res-01',
    title: 'उत्तर प्रदेश पुलिस सिपाही भर्ती परीक्षा परिणाम 2026 (UP Police Constable)',
    organization: 'उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड (UPPRPB)',
    postName: 'आरक्षी नागरिक पुलिस (कांस्टेबल)',
    totalPosts: '60,244 पद',
    category: 'result',
    date: '02 मार्च 2026',
    lastDate: 'कटऑफ एवं मेरिट सूची घोषित',
    status: 'परिणाम व DV/PST सूची जारी',
    eligibility: 'रोल नंबर व रजिस्ट्रेशन से स्कोरकार्ड देखें',
    link: 'https://uppbpb.gov.in',
    badge: 'महत्वपूर्ण'
  },
  {
    id: 'res-02',
    title: 'UP PCS 2025 मुख्य परीक्षा अंतिम परिणाम एवं टॉपर सूची',
    organization: 'उत्तर प्रदेश लोक सेवा आयोग (UPPSC)',
    postName: 'डिप्टी कलेक्टर, पुलिस उपाधीक्षक, खंड विकास अधिकारी',
    totalPosts: '254 पद',
    category: 'result',
    date: '28 फरवरी 2026',
    lastDate: 'साक्षात्कार उपरांत अंतिम चयन',
    status: 'अंतिम चयन सूची (Final Merit List) उपलब्ध',
    eligibility: 'पीडीएफ डाउनलोड कर रोल नंबर जांचें',
    link: 'https://uppsc.up.nic.in',
    badge: 'लाइव'
  },
  {
    id: 'res-03',
    title: 'एसएससी सीजीएल (SSC CGL Tier-1) स्कोरकार्ड व कट-ऑफ मार्क्स',
    organization: 'कर्मचारी चयन आयोग (SSC)',
    postName: 'कंबाइंड ग्रेजुएट लेवल (Tier-1)',
    totalPosts: '17,727 पद',
    category: 'result',
    date: '26 फरवरी 2026',
    lastDate: 'टियर-2 परीक्षा हेतु शॉर्टलिस्ट',
    status: 'मार्क्स एवं नॉर्मलाइज्ड स्कोर जारी',
    eligibility: 'एसएससी पोर्टल पर लॉगिन कर मार्क्स देखें',
    link: 'https://ssc.gov.in',
    badge: 'लाइव'
  },
  {
    id: 'res-04',
    title: 'रेलवे एनटीपीसी (RRB NTPC Graduate Level) अंतिम चयन सूची',
    organization: 'रेलवे भर्ती बोर्ड (RRB)',
    postName: 'स्टेशन मास्टर, गुड्स गार्ड, सीनियर क्लर्क',
    totalPosts: '8,113 पद',
    category: 'result',
    date: '24 फरवरी 2026',
    lastDate: 'दस्तावेज सत्यापन उपरांत अंतिम परिणाम',
    status: 'सभी 21 आरआरबी जोन्स का रिजल्ट घोषित',
    eligibility: 'ज़ोनल आरआरबी वेबसाइट पर मेरिट लिस्ट उपलब्ध',
    link: 'https://www.rrbapply.gov.in',
    badge: 'महत्वपूर्ण'
  },
  {
    id: 'res-05',
    title: 'भारतीय सेना अग्निवीर रैली भर्ती फाइनल मेरिट लिस्ट 2026',
    organization: 'ज्वाइन इंडियन आर्मी (Join Indian Army)',
    postName: 'अग्निवीर जीडी एवं क्लर्क (लखनऊ, वाराणसी, आगरा व दानापुर ज़ोन)',
    totalPosts: 'मेरिट सूची अनुसार',
    category: 'result',
    date: '22 फरवरी 2026',
    lastDate: 'मेडिकल एवं शारीरिक परीक्षण उपरांत',
    status: 'चयनित अभ्यर्थियों की सूची जारी',
    eligibility: 'एआरओ वेबसाइट पर रोल नंबर से जांचें',
    link: 'https://joinindianarmy.nic.in',
    badge: 'नया',
    isArmy: true
  }
];
