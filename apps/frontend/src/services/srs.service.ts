import { API_BASE } from './api';
import { CardData } from './card.service';

export interface DueItem {
  card: CardData;
  userState: {
    state: 'new' | 'learning' | 'review' | 'relearning';
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
    due: string;
  };
}

export interface ReviewResponse {
  nextState: any;
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
}

export const srsService = {
  async getDueCards(deckId: string): Promise<DueItem[]> {
    const res = await fetch(`${API_BASE}/srs/due?deckId=${deckId}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tải danh sách bài học');
    return json.data;
  },

  async reviewCard(cardId: string, deckId: string, rating: 1 | 2 | 3 | 4): Promise<ReviewResponse> {
    const res = await fetch(`${API_BASE}/srs/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cardId, deckId, rating }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi ghi nhận đánh giá');
    return json.data;
  },
};
