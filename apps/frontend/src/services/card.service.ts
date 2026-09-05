import { API_BASE } from './api';

export interface CardData {
  _id: string;
  deckId: string;
  langCode: string;
  term: string;
  partOfSpeech?: string;
  ipa?: { us?: string; uk?: string };
  meanings: Array<{ langCode: string; text: string; partOfSpeech?: string }>;
  examples: Array<{ en: string; vi?: string }>;
  audioUrl?: string;
  imageUrl?: string;
  createdAt?: string;
}

export const cardService = {
  async getCardsByDeck(deckId: string): Promise<CardData[]> {
    const res = await fetch(`${API_BASE}/cards/deck/${deckId}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tải danh sách thẻ');
    return json.data;
  },

  async createCard(
    deckId: string,
    data: {
      term: string;
      partOfSpeech?: string;
      ipa?: { us?: string; uk?: string };
      meanings: { langCode: string; text: string; partOfSpeech?: string }[];
      examples?: { en: string; vi?: string }[];
      audioUrl?: string;
      imageUrl?: string;
    }
  ): Promise<CardData> {
    // Ensure partOfSpeech is attached to each meaning item for backend Zod validation
    const formattedMeanings = data.meanings.map((m) => ({
      langCode: m.langCode || 'vi',
      text: m.text,
      partOfSpeech: m.partOfSpeech || data.partOfSpeech || 'noun',
    }));

    const payload = {
      term: data.term,
      ipa: data.ipa,
      meanings: formattedMeanings,
      examples: data.examples || [],
      audioUrl: data.audioUrl,
      imageUrl: data.imageUrl,
    };

    const res = await fetch(`${API_BASE}/cards/deck/${deckId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tạo thẻ từ vựng');
    return json.data;
  },

  async deleteCard(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi xóa thẻ');
  },
};
