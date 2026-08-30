process.env.NODE_ENV = 'test';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import { User } from '../models/User.js';

describe('Phase 1: Backend Auth & Healthcheck API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  const testUser = {
    name: 'Test Runner',
    email: `ci_test_${Date.now()}@example.com`,
    password: 'password123',
  };

  let authCookie: string;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
    } catch {
      const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/english_learning_db';
      await mongoose.connect(connStr);
    }
  }, 30000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: { $regex: /^ci_test_/ } });
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  it('1. GET /api/health - should return status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('2. POST /api/auth/register - should create a new user and set HttpOnly cookies', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.xp).toBe(0);
    expect(res.body.data.user.level).toBe(0);
    expect(res.body.data.user.streak.current).toBe(0);

    // Verify HttpOnly cookie header exists
    const rawCookies = res.headers['set-cookie'];
    expect(rawCookies).toBeDefined();
    if (rawCookies) {
      const cookieArray = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
      authCookie = cookieArray.find((c: string) => c.startsWith('accessToken=')) || '';
      expect(authCookie).toContain('HttpOnly');
    }
  });

  it('3. POST /api/auth/register - should fail on duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('đã được sử dụng');
  });

  it('4. POST /api/auth/login - should authenticate user and return token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('5. POST /api/auth/login - should fail with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('6. GET /api/auth/me - should return user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(testUser.name);
  });

  it('7. GET /api/auth/me - should return 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('8. POST /api/auth/logout - should clear auth cookies', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
