import { apiFetch } from './api';

export interface PhoneticLookupResult {
  word: string;
  ipa?: {
    us?: string;
    uk?: string;
  };
  audioUrl?: string;
}

export const dictionaryService = {
  /**
   * Looks up phonetic IPA and Audio URL for a word.
   * Tries backend /api/dictionary/lookup first, falls back directly to Free Dictionary API.
   */
  async lookupPhonetic(word: string): Promise<PhoneticLookupResult | null> {
    if (!word || !word.trim()) return null;
    const cleanWord = word.trim().toLowerCase();

    // 1. Try Backend API first
    try {
      const res = await apiFetch<PhoneticLookupResult>(`/dictionary/lookup?word=${encodeURIComponent(cleanWord)}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // Fallback silently to external Free Dictionary API
    }

    // 2. Direct Fallback to Free Dictionary API (api.dictionaryapi.dev)
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
      if (!response.ok) return null;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const entry = data[0];
      let usIpa: string | undefined;
      let ukIpa: string | undefined;
      let audioUrl: string | undefined;

      if (Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (p.text && !usIpa) usIpa = p.text;
          if (p.audio && !audioUrl) audioUrl = p.audio;
        }
      }

      if (!usIpa && entry.phonetic) {
        usIpa = entry.phonetic;
      }

      return {
        word: cleanWord,
        ipa: { us: usIpa, uk: ukIpa },
        audioUrl,
      };
    } catch (err) {
      console.error('[Dictionary Lookup Fallback Error]:', err);
      return null;
    }
  },
};
