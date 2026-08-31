const API_BASE = '/api/decks';

export interface DeckData {
  _id: string;
  title: string;
  description: string;
  langCode: string;
  isPublic: boolean;
  status: 'draft' | 'pending' | 'approved';
  tags: string[];
  cardCount: number;
  ownerId: string;
  createdAt: string;
}

export const deckService = {
  async getDecks(): Promise<DeckData[]> {
    const res = await fetch(API_BASE, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tải danh sách bộ thẻ');
    return json.data;
  },

  async getDeckById(id: string): Promise<DeckData> {
    const res = await fetch(`${API_BASE}/${id}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tải bộ thẻ');
    return json.data;
  },

  async createDeck(data: { title: string; description?: string; isPublic?: boolean; tags?: string[] }): Promise<DeckData> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi tạo bộ thẻ');
    return json.data;
  },

  async deleteDeck(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Lỗi khi xóa bộ thẻ');
  },
};
