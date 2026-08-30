import { Schema, model, Document, Types } from 'mongoose';

export interface IUserCardStateDocument extends Document {
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  deckId: Types.ObjectId;
  state: 'new' | 'learning' | 'review' | 'relearning';
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  due: Date;
  lastReview?: Date;
  updatedAt: Date;
}

const UserCardStateSchema = new Schema<IUserCardStateDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
    deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    state: {
      type: String,
      enum: ['new', 'learning', 'review', 'relearning'],
      default: 'new',
    },
    stability: { type: Number, default: 0 },
    difficulty: { type: Number, default: 0 },
    elapsedDays: { type: Number, default: 0 },
    scheduledDays: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    lapses: { type: Number, default: 0 },
    due: { type: Date, default: Date.now, index: true },
    lastReview: { type: Date },
  },
  { timestamps: true }
);

// Compound index on (userId, cardId) for instant lookup
UserCardStateSchema.index({ userId: 1, cardId: 1 }, { unique: true });
UserCardStateSchema.index({ userId: 1, due: 1 });

export const UserCardState = model<IUserCardStateDocument>('UserCardState', UserCardStateSchema);
