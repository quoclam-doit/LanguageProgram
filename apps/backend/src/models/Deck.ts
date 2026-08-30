import { Schema, model, Document, Types } from 'mongoose';

export interface IDeckDocument extends Document {
  ownerId: Types.ObjectId;
  langCode: string;
  title: string;
  description: string;
  isPublic: boolean;
  status: 'draft' | 'pending' | 'approved';
  tags: string[];
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeckSchema = new Schema<IDeckDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    langCode: { type: String, required: true, default: 'en' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'pending', 'approved'], default: 'approved' },
    tags: { type: [String], default: [] },
    cardCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Deck = model<IDeckDocument>('Deck', DeckSchema);
