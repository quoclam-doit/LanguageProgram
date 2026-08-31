export interface CardData {
  _id: string;
  deckId: string;
  langCode: string;
  term: string;
  ipa?: { us?: string; uk?: string };
  meanings: Array<{ langCode: string; text: string }>;
  examples: Array<{ en: string; vi?: string }>;
  audioUrl?: string;
  imageUrl?: string;
  createdAt?: string;
}

export const cardService = {
  async getCardsByDeck(deckId: string): Promise<CardData[]> {
    const res = await fetch(`/api/cards/deck/${deckId}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tải danh sách thẻ');
    return json.data;
  },

  async createCard(deckId: string, data: { term: string; ipa?: { us?: string; uk?: string }; meanings: { langCode: string; text: string }[]; examples?: { en: string; vi?: string }[] }): Promise<CardData> {
    const res = await fetch(`/api/cards/deck/${deckId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tạo thẻ từ vựng');
    return json.data;
  },

  async deleteCard(id: string): Promise<void> {
    const res = await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi xóa thẻ');
  },
};
