import { Schema, model, Document, Types } from 'mongoose';

export interface ICardDocument extends Document {
  deckId: Types.ObjectId;
  langCode: string;
  term: string;
  ipa?: { us?: string; uk?: string };
  meanings: Array<{ langCode: string; text: string }>;
  examples: Array<{ en: string; vi?: string }>;
  audioUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICardDocument>(
  {
    deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    langCode: { type: String, required: true, default: 'en' },
    term: { type: String, required: true, trim: true, index: true },
    ipa: {
      us: { type: String },
      uk: { type: String },
    },
    meanings: [
      {
        langCode: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    examples: [
      {
        en: { type: String, required: true },
        vi: { type: String },
      },
    ],
    audioUrl: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Card = model<ICardDocument>('Card', CardSchema);
