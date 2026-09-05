import { Schema, model, Document, Types } from 'mongoose';

export interface IImportJobDocument extends Document {
  deckId: Types.ObjectId;
  ownerId: Types.ObjectId;
  cardIds: Types.ObjectId[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  rowErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ImportJobSchema = new Schema<IImportJobDocument>(
  {
    deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cardIds: { type: [Schema.Types.ObjectId], ref: 'Card', default: [] },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    rowErrors: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ImportJob = model<IImportJobDocument>('ImportJob', ImportJobSchema);
