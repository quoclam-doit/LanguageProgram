import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Database Connection
connectDB();

// 2. Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// 4. Routes
app.use('/api/auth', authRoutes);

// 5. Global Error Middleware
app.use(errorHandler);

// 6. Start Listening
app.listen(PORT, () => {
  console.log(`[Express Backend] Server is running on port ${PORT}`);
  console.log(`[Express Backend] Allowed CORS origin: ${CLIENT_URL}`);
});

export default app;
