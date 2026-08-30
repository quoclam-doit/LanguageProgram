import { Schema, model, Document, Types } from 'mongoose';

export interface IReviewLogDocument extends Document {
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  rating: 1 | 2 | 3 | 4;
  stateBefore: string;
  stateAfter: string;
  reviewedAt: Date;
}

const ReviewLogSchema = new Schema<IReviewLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cardId: { type: Schema.Types.ObjectId, ref: 'Card', required: true, index: true },
    rating: { type: Number, enum: [1, 2, 3, 4], required: true },
    stateBefore: { type: String, required: true },
    stateAfter: { type: String, required: true },
    reviewedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const ReviewLog = model<IReviewLogDocument>('ReviewLog', ReviewLogSchema);
