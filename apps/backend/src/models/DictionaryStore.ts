import { Schema, model, Document } from 'mongoose';

export interface IDictionaryStoreDocument extends Document {
  word: string;
  langCode: string;
  ipa?: { us?: string; uk?: string };
  audioUrl?: { us?: string; uk?: string };
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example?: string }>;
  }>;
  translations: Array<{ langCode: string; text: string }>;
  source: 'dictionary_api' | 'llm_fallback' | 'manual';
  updatedAt: Date;
}

const DictionaryStoreSchema = new Schema<IDictionaryStoreDocument>(
  {
    word: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    langCode: { type: String, required: true, default: 'en' },
    ipa: { us: String, uk: String },
    audioUrl: { us: String, uk: String },
    meanings: [
      {
        partOfSpeech: { type: String, default: '' },
        definitions: [
          {
            definition: { type: String, required: true },
            example: String,
          },
        ],
      },
    ],
    translations: [
      {
        langCode: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    source: {
      type: String,
      enum: ['dictionary_api', 'llm_fallback', 'manual'],
      default: 'dictionary_api',
    },
  },
  { timestamps: true }
);

export const DictionaryStore = model<IDictionaryStoreDocument>(
  'DictionaryStore',
  DictionaryStoreSchema
);
