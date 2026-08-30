import { Schema, model, Document } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  nativeLang: string;
  targetLangs: string[];
  timezone: string;
  xp: number;
  streak: {
    current: number;
    lastLearnedDate: string | null;
  };
  role: 'learner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    nativeLang: { type: String, default: 'vi' },
    targetLangs: { type: [String], default: ['en'] },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    xp: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      lastLearnedDate: { type: String, default: null },
    },
    role: { type: String, enum: ['learner', 'admin'], default: 'learner' },
  },
  { timestamps: true }
);

export const User = model<IUserDocument>('User', UserSchema);
