export interface Question {
  id: string;
  code?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answerKey: 'A' | 'B' | 'C' | 'D';
  category: CategoryType;
  examFocus: 'UP PCS 2026-2027' | 'UPSC GS-1' | 'UPSC CSAT' | 'UP Special';
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  year?: string;
  bookmarked?: boolean;
}

export type CategoryType = 
  | 'UP Special'
  | 'National Current Affairs'
  | 'International Current Affairs'
  | 'Budget & Economy'
  | 'Awards & Honours'
  | 'Sports'
  | 'Science & Tech'
  | 'Appointments'
  | 'CSAT Math'
  | 'CSAT Reasoning'
  | 'GS Polity'
  | 'GS History'
  | 'GS Geography'
  | 'GS Environment';

export interface HeaderConfig {
  instituteName: string;
  tagline: string;
  address: string;
  contactNumber: string;
  docTitle: string;
  docSubtitle: string;
  examYear: string;
  setNumber: string;
  totalTime: string;
  totalMarks: string;
  negativeMarking: string;
  watermarkText: string;
  showWatermark: boolean;
  showContactInHeader: boolean;
  showAddressInHeader: boolean;
  showExamMetadataLine?: boolean;
}

export interface PDFStyleConfig {
  fontStyle: 'kalam' | 'devanagari' | 'hind' | 'outfit';
  fontWeight: 'bold-900' | 'bold-700' | 'normal';
  paperTheme: 'ruled' | 'plain' | 'grid' | 'parchment';
  inkColor: '#1e40af' | '#0f172a' | '#b91c1c' | '#047857' | '#111827'; // Royal Blue, Navy, Red, Emerald, Black
  questionsPerPage: 3 | 4 | 5 | 2; // 3 Qs/page default for mobile read
  layoutMode: 'portrait-single' | 'portrait-double';
  showAnswerKeyTable: boolean;
  showInlineExplanations: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  lineSpacing: 'tight' | 'normal' | 'relaxed';
}

export interface SavedPreset {
  id: string;
  name: string;
  questionIds: string[];
  createdAt: string;
}
