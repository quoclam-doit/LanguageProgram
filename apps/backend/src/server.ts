import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { authRoutes } from './routes/auth.routes';
import deckRoutes from './routes/deck.routes';
import cardRoutes from './routes/card.routes';
import srsRoutes from './routes/srs.routes';
import dictionaryRoutes from './routes/dictionary.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

// Global Process Error Listeners to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('🔥 [UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 [UNHANDLED REJECTION]:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`📥 [API ${req.method}] ${req.url}`);
  next();
});

// 1. Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/srs', srsRoutes);
app.use('/api/dictionary', dictionaryRoutes);

// 4. Global Error Middleware
app.use(errorHandler);

// 5. Database Connection & Server Listen (Only in non-test mode)
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 [Express Backend] Server is running on http://127.0.0.1:${PORT}`);
        console.log(`🌐 [Express Backend] Allowed CORS origin: ${CLIENT_URL}`);
      });
    })
    .catch((err) => {
      console.error('❌ [Database Connection Failed]:', err);
    });
}

export default app;
