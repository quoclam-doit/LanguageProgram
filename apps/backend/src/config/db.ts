import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/english_learning_db';
    await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};
