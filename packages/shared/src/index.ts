// User & Auth Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  nativeLang: string;
  targetLangs: string[];
  timezone: string;
  xp: number;
  level: number;
  streak: {
    current: number;
    lastLearnedDate: string | null;
  };
  role: 'learner' | 'admin';
  createdAt: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  nativeLang?: string;
  targetLangs?: string[];
  timezone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  message: string;
}

// Deck & Card Types
export interface Deck {
  id: string;
  ownerId: string;
  langCode: string;
  title: string;
  description: string;
  isPublic: boolean;
  status: 'draft' | 'pending' | 'approved';
  tags: string[];
  cardCount: number;
  createdAt: string;
}

export interface CardMeaning {
  langCode: string;
  text: string;
  partOfSpeech: string;
}

export interface CardExample {
  en: string;
  vi?: string;
}

export interface Card {
  id: string;
  deckId: string;
  langCode: string;
  term: string;
  ipa?: { us?: string; uk?: string };
  meanings: CardMeaning[];
  examples: CardExample[];
  audioUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

// FSRS SRS State & Review Log
export type SRSState = 'new' | 'learning' | 'review' | 'relearning';
export type SRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface UserCardState {
  id: string;
  userId: string;
  cardId: string;
  deckId: string;
  state: SRSState;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  due: string;
  lastReview?: string;
}

export interface ReviewLog {
  id: string;
  userId: string;
  cardId: string;
  rating: SRSRating;
  stateBefore: SRSState;
  stateAfter: SRSState;
  reviewedAt: string;
}

// Global Dictionary Store (Cache)
export interface DictionaryDefinition {
  definition: string;
  example?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryStoreItem {
  id: string;
  word: string;
  langCode: string;
  ipa?: { us?: string; uk?: string };
  audioUrl?: { us?: string; uk?: string };
  meanings: DictionaryMeaning[];
  translations: Array<{ langCode: string; text: string }>;
  source: 'dictionary_api' | 'llm_fallback' | 'manual';
  updatedAt: string;
}

// GET /api/dictionary/lookup response — pre-shaped for the Card creation form:
// ipa matches Card.ipa ({us,uk}), audioUrl matches Card.audioUrl (a single string).
export interface DictionaryLookupResult {
  ipa: { us?: string; uk?: string };
  audioUrl?: string;
}

// Quiz & Question Types (Discriminated Union)
export type QuestionType = 'mcq' | 'fill_blank' | 'matching' | 'listening' | 'ordering';

export interface BaseQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  audioUrl?: string;
  explanation: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  payload: {
    options: string[];
    answerIndex: number;
  };
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  payload: {
    answer: string;
    caseSensitive?: boolean;
  };
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  payload: {
    pairs: Array<{ left: string; right: string }>;
  };
}

export interface ListeningQuestion extends BaseQuestion {
  type: 'listening';
  payload: {
    options: string[];
    answerIndex: number;
  };
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  payload: {
    items: string[];
    correctOrder: number[];
  };
}

export type Question =
  | MCQQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | ListeningQuestion
  | OrderingQuestion;

export interface Quiz {
  id: string;
  topicId?: string;
  sourceDeckId?: string;
  langCode: string;
  title: string;
  questionCount: number;
  timeLimit: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  answers: Array<{
    questionId: string;
    userAnswer: any;
    isCorrect: boolean;
  }>;
  timeSpent: number;
  createdAt: string;
}

// Helper API Response Format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
