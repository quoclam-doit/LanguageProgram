import { API_BASE } from './api';
import { CardData } from './card.service';

export interface UserCardStateData {
  _id?: string;
  userId?: string;
  cardId?: string;
  deckId?: string;
  state: 'new' | 'learning' | 'review' | 'relearning';
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  due: string;
}

export interface DueItem {
  card: CardData;
  userState: UserCardStateData;
}

export interface ReviewResponse {
  nextState: UserCardStateData;
  xpEarned: number;
  totalXp: number;
  currentStreak: number;
}

export const srsService = {
  async getDueCards(deckId: string, limit: number = 30): Promise<DueItem[]> {
    const res = await fetch(`${API_BASE}/srs/due?deckId=${deckId}&limit=${limit}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tải danh sách thẻ học');
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
    if (!json.success) throw new Error(json.error || 'Lỗi khi đánh giá thẻ học');
    return json.data;
  },
};
