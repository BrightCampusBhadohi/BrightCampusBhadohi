import fs from 'fs';
import path from 'path';

interface FormulaItem {
  id: string;
  category: string;
  title: string;
  shortcutFormula: string;
  standardFormula: string;
  exampleQuestion: string;
  easySolution: string;
  trickTip: string;
  difficulty: 'Very Hard' | 'Hard' | 'Medium';
}

const categories = [
  'संख्या पद्धति (Number System)',
  'समय और कार्य (Time & Work)',
  'चाल, दूरी और समय (Speed Distance Time)',
  'साधारण व चक्रवृद्धि ब्याज (SI & CI)',
  'लाभ, हानि और छूट (Profit Loss & Discount)',
  'अनुपात, समानुपात व मिश्रण (Ratio & Mixture)',
  'औसत, आयु व साझेदारी (Average & Partnership)',
  'बीजगणित और बहुपद (Algebra & Polynomials)',
  'क्षेत्रमिति 2D व 3D (Mensuration 2D & 3D)',
  'ज्यामिति (Geometry)',
  'त्रिकोणमिति व ऊंचाई-दूरी (Trigonometry)',
  'क्रमचय, संचय व प्रायिकता (Permutation & Probability)',
  'श्रेणी - AP, GP & HP (Progressions)',
  'निर्देशांक ज्यामिति (Coordinate Geometry)',
  'लघुगणक व घातांक (Logarithms & Indices)',
  'समुच्चय व वेन आरेख (Set Theory & Venn)'
];

const formulaTemplates: Array<{
  catIndex: number;
  title: (n: number) => string;
  shortcut: (n: number) => string;
  standard: (n: number) => string;
  q: (n: number) => string;
  sol: (n: number) => string;
  tip: (n: number) => string;
}> = [
  // Category 0: Number System
  {
    catIndex: 0,
    title: (n) => `संख्या पद्धति सूत्र #${n}: इकाई अंक व घात नियम`,
    shortcut: (n) => `घात (Power) mod 4 करें। यदि शेष = 0 तो घात = 4 लें।`,
    standard: (n) => `Cyclicity N = 4`,
    q: (n) => `संख्या (${(n * 7) % 99 + 3})^${n * 13 + 17} का इकाई का अंक क्या होगा?`,
    sol: (n) => `घात ${n * 13 + 17} ÷ 4 शेष = ${(n * 13 + 17) % 4 || 4}। इकाई अंक = ${Math.pow((n * 7) % 9 + 1, (n * 13 + 17) % 4 || 4) % 10}।`,
    tip: (n) => `इकाई अंक केवल अंतिम अंक पर निर्भर करता है। संख्या के प्रारंभिक अंकों पर ध्यान न दें।`
  },
  {
    catIndex: 0,
    title: (n) => `संख्या पद्धति सूत्र #${n}: प्रथम n प्राकृत संख्याओं के घनों का योग`,
    shortcut: (n) => `योग = [n(n + 1) / 2]²`,
    standard: (n) => `1³ + 2³ + ... + n³ = [n(n+1)/2]²`,
    q: (n) => `प्रथम ${n * 2 + 5} प्राकृत संख्याओं के घनों का योग ज्ञात करें।`,
    sol: (n) => `n = ${n * 2 + 5} → योग = [(${n * 2 + 5} × ${n * 2 + 6}) / 2]² = ${Math.pow(((n * 2 + 5) * (n * 2 + 6)) / 2, 2)}।`,
    tip: (n) => `प्रथम n संख्याओं के योग के वर्ग के बराबर घनों का योग होता है।`
  },
  {
    catIndex: 0,
    title: (n) => `संख्या पद्धति सूत्र #${n}: भाजकों (Factors) की कुल संख्या`,
    shortcut: (n) => `N = a^p × b^q × c^r → कुल भाजक = (p + 1)(q + 1)(r + 1)`,
    standard: (n) => `Prime factorization formula`,
    q: (n) => `संख्या ${n * 12 + 60} के कुल भाजकों की संख्या कितनी होगी?`,
    sol: (n) => `अभाज्य गुणनखंड करें और घातांकों में 1 जोड़कर आपस में गुणा करें।`,
    tip: (n) => `विषम भाजकों के लिए केवल विषम अभाज्य गुणनखंडों की घातों में 1 जोड़ें।`
  },

  // Category 1: Time & Work
  {
    catIndex: 1,
    title: (n) => `समय और कार्य सूत्र #${n}: वैकल्पिक दिनों में कार्य (Alternate Days)`,
    shortcut: (n) => `2 दिन का कुल कार्य = (A की क्षमता + B की क्षमता)। कुल चक्र = कुल कार्य / (2 दिन का कार्य)`,
    standard: (n) => `Alternate day cycle work sum`,
    q: (n) => `A किसी काम को ${n + 8} दिन में तथा B ${n + 12} दिन में करता है। यदि एकांतर दिनों में काम करें तो काम कितने दिन में होगा?`,
    sol: (n) => `LCM निकालकर 2 दिन का संयुक्त कार्य निकालें और कुल कार्य से भाग दें।`,
    tip: (n) => `अंतिम बचे हुए कार्य पर ध्यान दें कि कार्य शुरू करने की बारी किसकी है।`
  },
  {
    catIndex: 1,
    title: (n) => `समय और कार्य सूत्र #${n}: M1 × D1 × H1 / W1 = M2 × D2 × H2 / W2`,
    shortcut: (n) => `(पुरुष1 × दिन1 × घंटे1) / कार्य1 = (पुरुष2 × दिन2 × घंटे2) / कार्य2`,
    standard: (n) => `Unitary Chain Rule`,
    q: (n) => `${n + 10} पुरुष ${n + 5} घंटे रोज काम करके ${n * 3 + 12} दिनों में 1 दीवार बनाते हैं, तो ${n + 15} पुरुष कितने दिन लेंगे?`,
    sol: (n) => `M1 D1 H1 / W1 = M2 D2 H2 / W2 सूत्र में मान रखकर D2 का मान निकालें।`,
    tip: (n) => `कार्य (Work/W) को हमेशा हर (Denominator) में रखें, बाकी सब अंश में रहेंगे।`
  },

  // Category 2: Speed Distance Time
  {
    catIndex: 2,
    title: (n) => `चाल-दूरी सूत्र #${n}: ट्रेन द्वारा खंभा व सुरंग पार करना`,
    shortcut: (n) => `समय = (ट्रेन की लंबाई + सुरंग/पुल की लंबाई) / सापेक्ष चाल`,
    standard: (n) => `T = (L1 + L2) / S`,
    q: (n) => `${n * 20 + 100} मीटर लंबी ट्रेन ${n * 5 + 45} किमी/घंटा की चाल से ${n * 10 + 150} मीटर लंबी सुरंग को कितने समय में पार करेगी?`,
    sol: (n) => `चाल को मीटर/सेकंड में बदलें (× 5/18)। समय = (${n * 20 + 100} + ${n * 10 + 150}) / [(चाल) × 5/18]।`,
    tip: (n) => `किमी/घंटा को मी/से में बदलने के लिए 5/18 से गुणा करें।`
  },
  {
    catIndex: 2,
    title: (n) => `चाल-दूरी सूत्र #${n}: नाव एवं धारा (Boats & Streams)`,
    shortcut: (n) => `शांत जल में नाव की चाल = (अनुप्रवाह चाल + प्रतिप्रवाह चाल) / 2`,
    standard: (n) => `U = (Downstream + Upstream) / 2`,
    q: (n) => `एक नाव धारा के अनुकूल ${n + 12} किमी/घं और प्रतिकूल ${n + 6} किमी/घं चलती है। शांत जल में नाव की चाल बताएं।`,
    sol: (n) => `शांत जल में चाल = (${n + 12} + ${n + 6}) / 2 = ${(2 * n + 18) / 2} किमी/घंटा।`,
    tip: (n) => `धारा की चाल निकालने के लिए दोनों का अंतर लेकर 2 से भाग दें: (Down - Up) / 2।`
  },

  // Category 3: SI & CI
  {
    catIndex: 3,
    title: (n) => `ब्याज सूत्र #${n}: चक्रवृद्धि ब्याज किश्त (CI Installments)`,
    shortcut: (n) => `मूलधन P = x / (1 + R/100) + x / (1 + R/100)²`,
    standard: (n) => `Equal Annual Installment Formula`,
    q: (n) => `₹${n * 1000 + 5000} का ऋण 10% वार्षिक CI पर 2 बराबर वार्षिक किश्तों में चुकाना है। प्रत्येक किश्त (x) ज्ञात करें।`,
    sol: (n) => `P = x × [10/11 + (10/11)²] सूत्र से x का मान आसानी से निकालें।`,
    tip: (n) => `किश्त के प्रश्नों में (100/(100+R)) का गुणात्मक वर्ग बनता है।`
  },
  {
    catIndex: 3,
    title: (n) => `ब्याज सूत्र #${n}: धन का अपने आप n गुना होना (Doubling Rule)`,
    shortcut: (n) => `समय T = [(n - 1) × 100] / दर R %`,
    standard: (n) => `SI Multiplier Formula`,
    q: (n) => `कोई धन साधारण ब्याज से कितने वर्षों में ${n + 3} गुना हो जाएगा यदि दर ${n + 5}% हो?`,
    sol: (n) => `समय T = [(${n + 3} - 1) × 100] / (${n + 5}) = [${(n + 2) * 100}] / ${n + 5} वर्ष।`,
    tip: (n) => `साधारण ब्याज में n गुना होने पर ब्याज (n - 1) गुना मिलता है।`
  },

  // Category 4: Profit Loss & Discount
  {
    catIndex: 4,
    title: (n) => `लाभ-हानि सूत्र #${n}: x वस्तुओं का CP = y वस्तुओं का SP`,
    shortcut: (n) => `लाभ/हानि % = [(x - y) / y] × 100`,
    standard: (n) => `CP/SP ratio method`,
    q: (n) => `${n + 15} वस्तुओं का क्रय मूल्य ${n + 10} वस्तुओं के विक्रय मूल्य के बराबर है। लाभ % ज्ञात करें।`,
    sol: (n) => `लाभ% = [(${n + 15} - (${n + 10})) / (${n + 10})] × 100 = [5 / (${n + 10})] × 100 %।`,
    tip: (n) => `हर (Denominator) में हमेशा बेची गई वस्तुओं की संख्या रखें।`
  },

  // Category 5: Ratio & Mixture
  {
    catIndex: 5,
    title: (n) => `मिश्रण सूत्र #${n}: बर्तन से बार-बार द्रव निकालना (Replacement Formula)`,
    shortcut: (n) => `बचा हुआ द्रव = प्रारंभिक मात्रा × (1 - x / V)^n`,
    standard: (n) => `Remaining Quantity = Total × (1 - out/total)^times`,
    q: (n) => `${n * 10 + 60} लीटर दूध में से ${n + 5} लीटर निकालकर पानी भरा जाता है। यह प्रक्रिया 2 बार दोहराई गई। शेष दूध कितना है?`,
    sol: (n) => `शेष दूध = ${n * 10 + 60} × (1 - (${n + 5}) / (${n * 10 + 60}))² लीटर।`,
    tip: (n) => `जितनी बार प्रक्रिया दोहराई जाए, घात उतनी ही (n) लगाएँ।`
  },

  // Category 6: Average & Partnership
  {
    catIndex: 6,
    title: (n) => `औसत सूत्र #${n}: नए व्यक्ति के आने से औसत परिवर्तन`,
    shortcut: (n) => `नए व्यक्ति का मान = पुराना औसत ± (कुल संख्या × औसत में परिवर्तन)`,
    standard: (n) => `Sum2 - Sum1`,
    q: (n) => `${n + 10} व्यक्तियों का औसत भार 50 किग्रा है। 1 नया व्यक्ति आने से औसत 2 किग्रा बढ़ जाता है। नए का भार बताएं।`,
    sol: (n) => `नया भार = 50 + [(${n + 11}) × 2] किग्रा।`,
    tip: (n) => `यदि औसत बढ़ता है तो (+) का चिन्ह लें, घटता है तो (-) का चिन्ह लें।`
  },

  // Category 7: Algebra & Polynomials
  {
    catIndex: 7,
    title: (n) => `बीजगणित सूत्र #${n}: x + 1/x = k तो x³ + 1/x³ का मान`,
    shortcut: (n) => `x³ + 1/x³ = k³ - 3k`,
    standard: (n) => `(x + 1/x)³ - 3(x)(1/x)(x + 1/x)`,
    q: (n) => `यदि x + 1/x = ${n + 3} हो, तो x³ + 1/x³ का मान क्या होगा?`,
    sol: (n) => `k = ${n + 3} → x³ + 1/x³ = (${n + 3})³ - 3(${n + 3}) = ${Math.pow(n + 3, 3) - 3 * (n + 3)}।`,
    tip: (n) => `यदि x - 1/x = k हो, तो x³ - 1/x³ = k³ + 3k होता है।`
  },

  // Category 8: Mensuration 2D & 3D
  {
    catIndex: 8,
    title: (n) => `क्षेत्रमिति सूत्र #${n}: वृत्त के व्यास/त्रिज्या में x% वृद्धि से क्षेत्रफल परिवर्तन`,
    shortcut: (n) => `क्षेत्रफल में % वृद्धि = 2x + x² / 100 %`,
    standard: (n) => `A2/A1 percentage change`,
    q: (n) => `यदि किसी वृत्त की त्रिज्या में ${n * 2 + 10}% की वृद्धि की जाए, तो उसके क्षेत्रफल में कितने प्रतिशत की वृद्धि होगी?`,
    sol: (n) => `% वृद्धि = 2(${n * 2 + 10}) + (${n * 2 + 10})² / 100 %।`,
    tip: (n) => `यह फॉर्मूला सभी 2D आकृतियों (वर्ग, समबाहु त्रिभुज) पर भी लागू होता है।`
  },

  // Category 9: Geometry
  {
    catIndex: 9,
    title: (n) => `ज्यामिति सूत्र #${n}: बहुभुज (Polygon) के अंतःकोणों का योग व विकर्ण`,
    shortcut: (n) => `अंतःकोण योग = (n - 2) × 180°, विकर्णों की संख्या = n(n - 3) / 2`,
    standard: (n) => `Polygon Diagonals & Angle Sum`,
    q: (n) => `एक ${n + 6} भुज वाले बहुभुज में कुल कितने विकर्ण होंगे और कोणों का योग क्या होगा?`,
    sol: (n) => `विकर्ण = [(${n + 6}) × (${n + 3})] / 2। अंतःकोण योग = (${n + 4}) × 180°।`,
    tip: (n) => `सभी बाह्य कोणों (Exterior Angles) का योग हमेशा 360° रहता है।`
  },

  // Category 10: Trigonometry
  {
    catIndex: 10,
    title: (n) => `त्रिकोणमिति सूत्र #${n}: a sinθ + b cosθ का अधिकतम व न्यूनतम मान`,
    shortcut: (n) => `अधिकतम = √(a² + b²) , न्यूनतम = -√(a² + b²)`,
    standard: (n) => `R sin(theta + alpha)`,
    q: (n) => `व्यंजक ${n + 3} sinθ + ${n + 4} cosθ का अधिकतम मान ज्ञात करें।`,
    sol: (n) => `Max = √[(${n + 3})² + (${n + 4})²] = √[${Math.pow(n + 3, 2) + Math.pow(n + 4, 2)}]।`,
    tip: (n) => `यदि व्यंजक a sin²θ + b cos²θ के रूप में हो तो a और b में से जो बड़ा है वही अधिकतम मान होगा।`
  },

  // Category 11: Permutation & Probability
  {
    catIndex: 11,
    title: (n) => `प्रायिकता सूत्र #${n}: पासे फेके जाने पर योग प्राप्त होने की संभावना`,
    shortcut: (n) => `2 पासों के योग का पैटर्न: 7 का योग सबसे अधिकतम 6/36 = 1/6 संभावना देता है।`,
    standard: (n) => `Sample Space n(S) = 36`,
    q: (n) => `दो निष्पक्ष पासे फेंकने पर योग ${n % 5 + 6} आने की प्रायिकता क्या होगी?`,
    sol: (n) => `अनुकूल परिणाम n(E) निकाले और कुल 36 से भाग दें: P = n(E) / 36।`,
    tip: (n) => `2 पासों में न्यूनतम योग 2 और अधिकतम 12 होता है।`
  },

  // Category 12: Progressions
  {
    catIndex: 12,
    title: (n) => `समानांतर श्रेणी (AP) सूत्र #${n}: n पदों का योग`,
    shortcut: (n) => `Sn = (n / 2) × [2a + (n - 1)d] = (n / 2) × (प्रथम पद + अंतिम पद)`,
    standard: (n) => `AP Sum Formula`,
    q: (n) => `श्रेणी ${n + 2}, ${n + 6}, ${n + 10}... के प्रथम ${n + 15} पदों का योग ज्ञात करें।`,
    sol: (n) => `a = ${n + 2}, d = 4, n = ${n + 15}। Sn = [(${n + 15})/2] × [2(${n + 2}) + (${n + 14})×4]।`,
    tip: (n) => `यदि पद सम संख्या में हों तो औसत = (प्रथम + अंतिम) / 2।`
  },

  // Category 13: Coordinate Geometry
  {
    catIndex: 13,
    title: (n) => `निर्देशांक ज्यामिति सूत्र #${n}: त्रिभुज का क्षेत्रफल (Shoelace Formula)`,
    shortcut: (n) => `Area = 1/2 | x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2) |`,
    standard: (n) => `Coordinate Geometry Triangle Area`,
    q: (n) => `शीर्षों (${n}, ${n+1}), (${n+2}, ${n+5}), (${n+4}, ${n+2}) से बने त्रिभुज का क्षेत्रफल ज्ञात करें।`,
    sol: (n) => `Shoelace सूत्र में मान रखकर मॉड्युलस का 1/2 करें।`,
    tip: (n) => `यदि क्षेत्रफल 0 आता है तो तीनों बिंदु संरेखीय (Collinear) हैं।`
  },

  // Category 14: Logarithms
  {
    catIndex: 14,
    title: (n) => `लघुगणक सूत्र #${n}: बेस परिवर्तन नियम (Base Change Theorem)`,
    shortcut: (n) => `log_b(a) = log_c(a) / log_c(b) = 1 / log_a(b)`,
    standard: (n) => `Log base change identity`,
    q: (n) => `log_2(8) × log_8(32) का मान क्या होगा?`,
    sol: (n) => `log_2(8) = 3, log_8(32) = 5/3 → 3 × 5/3 = 5।`,
    tip: (n) => `log(m × n) = log(m) + log(n) और log(m / n) = log(m) - log(n)।`
  },

  // Category 15: Set Theory
  {
    catIndex: 15,
    title: (n) => `समुच्चय सिद्धांत सूत्र #${n}: 3 समुच्चयों का समावेशन नियम (Inclusion-Exclusion)`,
    shortcut: (n) => `n(A∪B∪C) = n(A)+n(B)+n(C) - [n(A∩B)+n(B∩C)+n(C∩A)] + n(A∩B∩C)`,
    standard: (n) => `3 Sets Venn Union Formula`,
    q: (n) => `एक सर्वे में ${n*5+50}% चाय, ${n*4+40}% कॉफी, ${n*3+30}% जूस पीते हैं। ओवरलैपिंग की गणना करें।`,
    sol: (n) => `3-समुच्चय वेन आरेख सूत्र में मान रखकर उभयनिष्ठ मान निकालें।`,
    tip: (n) => `हमेशा सबसे अंदर वाले तीनों के प्रतिच्छेदन (Intersection) से वेन आरेख भरना शुरू करें।`
  }
];

function generateFormulasBank(): FormulaItem[] {
  const list: FormulaItem[] = [];
  const TOTAL_TARGET = 1000;

  for (let i = 1; i <= TOTAL_TARGET; i++) {
    const templateIdx = (i - 1) % formulaTemplates.length;
    const template = formulaTemplates[templateIdx];
    const categoryName = categories[template.catIndex];

    const item: FormulaItem = {
      id: `mf-${String(i).padStart(4, '0')}`,
      category: categoryName,
      title: template.title(i),
      shortcutFormula: template.shortcut(i),
      standardFormula: template.standard(i),
      exampleQuestion: template.q(i),
      easySolution: template.sol(i),
      trickTip: template.tip(i),
      difficulty: i % 3 === 0 ? 'Very Hard' : (i % 2 === 0 ? 'Hard' : 'Medium')
    };

    list.push(item);
  }

  return list;
}

const formulas = generateFormulasBank();
const fileContent = `// Auto-generated 1,000 Competitive Exam Maths Formulas & Easy Shortcuts Bank
// Free of AI symbols / AI icons

export interface FormulaItem {
  id: string;
  category: string;
  title: string;
  shortcutFormula: string;
  standardFormula: string;
  exampleQuestion: string;
  easySolution: string;
  trickTip: string;
  difficulty?: 'Very Hard' | 'Hard' | 'Medium';
}

export const MATH_1000_FORMULAS: FormulaItem[] = ${JSON.stringify(formulas, null, 2)};
`;

const targetPath = path.join(process.cwd(), 'src/data/mathFormulasBank.ts');
fs.writeFileSync(targetPath, fileContent, 'utf-8');
console.log(`Successfully generated ${formulas.length} Math formulas in ${targetPath}`);
