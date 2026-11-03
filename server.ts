import express from 'express';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max file size
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Server-side Gemini AI Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Endpoint 1: OCR / Document Question Extraction
app.post('/api/ocr-extract', upload.single('file'), async (req, res) => {
  try {
    const ai = getGeminiClient();
    const textContent = req.body.text || '';
    const file = req.file;

    let contents: any[] = [];

    const promptText = `आप एक उत्तर प्रदेश लोक सेवा आयोग (UP PCS 2026-2027) तथा UPSC प्रश्न पत्र विश्लेषक और टाइपसेटर विशेषज्ञ हैं।
दिए गए चित्र / दस्तावेज़ / पाठ्य सामग्री में से सभी बहुविकल्पीय प्रश्नों (MCQs) को निकालें।

प्रत्येक प्रश्न के लिए:
1. प्रश्न पाठ (Question in Hindi/English)
2. विकल्प A (Option A)
3. विकल्प B (Option B)
4. विकल्प C (Option C)
5. विकल्प D (Option D)
6. सही उत्तर (Correct Answer Key: "A", "B", "C", या "D")
7. विषय श्रेणी (Category: Choose from "UP Special", "National Current Affairs", "International Current Affairs", "Awards & Honours", "Budget & Economy", "Sports", "Science & Tech", "Appointments", "CSAT Math", "CSAT Reasoning", "GS Polity", "GS History", "GS Geography", "GS Environment")
8. व्याख्या (Detailed Step-by-Step Explanation in Hindi)

उत्तर केवल शुद्ध JSON एरे (Valid JSON Array) के रूप में प्रदान करें।`;

    if (file) {
      const mimeType = file.mimetype || 'image/png';
      const base64Data = file.buffer.toString('base64');
      contents = [
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        },
        { text: promptText + (textContent ? `\n\nअतिरिक्त विवरण:\n${textContent}` : '') }
      ];
    } else if (textContent) {
      contents = [
        { text: `${promptText}\n\nनीचे दिया गया टेक्स्ट सामग्री विश्लेषित करें:\n${textContent}` }
      ];
    } else {
      return res.status(400).json({ error: 'कृपया कोई फ़ाइल अपलोड करें या टेक्स्ट प्रदान करें।' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: "You extract competitive exam MCQs from images, PDFs, or unstructured text into high quality Hindi/English JSON format for UP PCS and UPSC preparation.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Full question text" },
              optionA: { type: Type.STRING, description: "Option A" },
              optionB: { type: Type.STRING, description: "Option B" },
              optionC: { type: Type.STRING, description: "Option C" },
              optionD: { type: Type.STRING, description: "Option D" },
              answerKey: { type: Type.STRING, description: "Correct option A, B, C, or D" },
              category: { type: Type.STRING, description: "Topic category" },
              explanation: { type: Type.STRING, description: "Step by step explanation in Hindi" }
            },
            required: ["question", "optionA", "optionB", "optionC", "optionD", "answerKey", "category"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const parsedQuestions = JSON.parse(jsonText);

    return res.json({
      success: true,
      count: parsedQuestions.length,
      questions: parsedQuestions
    });

  } catch (error: any) {
    console.error("Error in OCR extraction:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "प्रश्न निकालने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
    });
  }
});

// API Endpoint 2: AI Question & Explanation Generator
app.post('/api/generate-questions', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { topic = "UP Special & Current Affairs 2026-2027", count = 5, difficulty = "Medium" } = req.body;

    const promptText = `BRIGHT CAMPUS BHADOHI - UP PCS 2026-2027 & UPSC परीक्षा की दृष्टि से अति-महत्वपूर्ण ${count} परीक्षा-स्तरीय नए बहुविकल्पीय प्रश्न (MCQs) हिंदी में तैयार करें।
विषय: ${topic}
कठिनाई का स्तर: ${difficulty}

प्रत्येक प्रश्न में:
- प्रामाणिक प्रश्न (Question Text)
- 4 विकल्प (A, B, C, D)
- सही उत्तर कुंजी (A/B/C/D)
- विस्तृत चरणबद्ध हिंदी व्याख्या (Detailed Explanation)
- विषय वर्ग (Category)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              optionA: { type: Type.STRING },
              optionB: { type: Type.STRING },
              optionC: { type: Type.STRING },
              optionD: { type: Type.STRING },
              answerKey: { type: Type.STRING },
              category: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "optionA", "optionB", "optionC", "optionD", "answerKey", "category"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const questions = JSON.parse(jsonText);

    return res.json({ success: true, questions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API Endpoint 3: SarkariResult Live Updates (Latest Jobs, Admit Cards, Results)
app.get('/api/sarkari-updates', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let liveItems: any[] = [];
    try {
      const response = await fetch('https://www.sarkariresult.com', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'hi,en-US,en;q=0.9'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        const linkRegex = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
        let match;
        let count = 0;
        while ((match = linkRegex.exec(html)) !== null && count < 25) {
          const rawUrl = match[1];
          const rawText = match[2].replace(/<[^>]+>/g, '').trim();
          if (
            rawText &&
            rawText.length > 5 &&
            !rawText.includes('Home') &&
            !rawText.includes('Contact') &&
            !rawText.includes('Disclaimer') &&
            !rawText.includes('Privacy')
          ) {
            let cat: 'job' | 'admit-card' | 'result' = 'job';
            const lower = rawText.toLowerCase();
            if (lower.includes('admit') || lower.includes('hall ticket') || lower.includes('city') || lower.includes('card')) {
              cat = 'admit-card';
            } else if (lower.includes('result') || lower.includes('cutoff') || lower.includes('score') || lower.includes('marks')) {
              cat = 'result';
            }
            liveItems.push({
              id: `sr-live-${count}`,
              title: rawText,
              organization: rawText.includes('UP') ? 'उत्तर प्रदेश सरकार / UPPSC' : rawText.includes('SSC') ? 'कर्मचारी चयन आयोग (SSC)' : rawText.includes('Railway') ? 'रेलवे (RRB)' : 'सरकारी भर्ती बोर्ड',
              postName: rawText,
              totalPosts: 'विज्ञप्ति अनुसार',
              category: cat,
              date: new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              status: 'लाइव अपडेट',
              eligibility: 'अधिसूचना अनुसार',
              link: rawUrl,
              badge: 'लाइव'
            });
            count++;
          }
        }
      }
    } catch (e) {
      // Live fetch timeout/protection fallback
    }

    return res.json({
      success: true,
      lastUpdated: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'sarkariresult.com',
      liveCount: liveItems.length,
      items: liveItems.length >= 5 ? liveItems : null
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Vite middleware in development
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await import('fs').then(fs => fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8'));
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 BRIGHT CAMPUS PDF STUDIO server running at http://localhost:${PORT}`);
  });
}

startServer();
