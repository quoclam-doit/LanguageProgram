import { DictionaryStore } from '../models/DictionaryStore';

const FREE_DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export interface PhoneticLookupResult {
  ipa: { us?: string; uk?: string };
  audioUrl: { us?: string; uk?: string };
}

interface FreeDictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface FreeDictionaryEntry {
  phonetic?: string;
  phonetics?: FreeDictionaryPhonetic[];
}

const EMPTY_RESULT: PhoneticLookupResult = { ipa: {}, audioUrl: {} };

function findPhonetic(phonetics: FreeDictionaryPhonetic[], region: 'us' | 'uk'): FreeDictionaryPhonetic | undefined {
  return (
    phonetics.find((p) => p.audio?.includes(`-${region}`) && p.text) ||
    phonetics.find((p) => p.audio?.includes(`-${region}`))
  );
}

function isEmptyResult(result: PhoneticLookupResult): boolean {
  return !result.ipa.us && !result.ipa.uk && !result.audioUrl.us && !result.audioUrl.uk;
}

function parseFreeDictionaryResponse(entries: FreeDictionaryEntry[]): PhoneticLookupResult {
  const entry = entries[0];
  const phonetics = entry?.phonetics || [];

  const usPhonetic = findPhonetic(phonetics, 'us');
  const ukPhonetic = findPhonetic(phonetics, 'uk');
  const fallbackPhonetic = phonetics.find((p) => p.text);

  const result: PhoneticLookupResult = {
    ipa: {
      us: usPhonetic?.text || fallbackPhonetic?.text || entry?.phonetic || undefined,
      uk: ukPhonetic?.text || undefined,
    },
    audioUrl: {
      us: usPhonetic?.audio || undefined,
      uk: ukPhonetic?.audio || undefined,
    },
  };

  return isEmptyResult(result) ? EMPTY_RESULT : result;
}

/**
 * 2-tier lookup: DictionaryStore cache first, then Free Dictionary API.
 * Never throws - a miss or a network error just yields an empty result.
 */
export async function lookupPhonetic(word: string): Promise<PhoneticLookupResult> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return EMPTY_RESULT;

  const cached = await DictionaryStore.findOne({ word: normalized });
  if (cached) {
    return { ipa: cached.ipa || {}, audioUrl: cached.audioUrl || {} };
  }

  try {
    const res = await fetch(`${FREE_DICTIONARY_API_BASE}/${encodeURIComponent(normalized)}`);
    if (!res.ok) {
      return EMPTY_RESULT;
    }

    const entries = (await res.json()) as FreeDictionaryEntry[];
    const result = parseFreeDictionaryResponse(entries);

    if (isEmptyResult(result)) {
      return EMPTY_RESULT;
    }

    // Upsert (not create): two concurrent lookups of the same uncached word would
    // otherwise race on the unique `word` index and throw a duplicate-key error.
    await DictionaryStore.findOneAndUpdate(
      { word: normalized },
      {
        word: normalized,
        langCode: 'en',
        ipa: result.ipa,
        audioUrl: result.audioUrl,
        source: 'dictionary_api',
      },
      { upsert: true }
    );

    return result;
  } catch {
    return EMPTY_RESULT;
  }
}
