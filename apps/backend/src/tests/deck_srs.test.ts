import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../server';

let mongoServer: MongoMemoryServer;
let authCookie: string;
let createdDeckId: string;
let createdCardId: string;

describe('Phase 2: Deck, Card & FSRS SRS Engine Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Register test user to get authCookie
    const res = await request(app).post('/api/auth/register').send({
      email: 'srsuser@example.com',
      password: 'password123',
      name: 'SRS Learner',
    });

    authCookie = res.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('1. POST /api/decks - Should create a new user deck', async () => {
    const res = await request(app)
      .post('/api/decks')
      .set('Cookie', [authCookie])
      .send({
        title: 'Oxford Business 500',
        description: 'Chuyên ngành kinh tế thương mại',
        langCode: 'en',
        isPublic: false,
        tags: ['business', 'toeic'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Oxford Business 500');
    expect(res.body.data.cardCount).toBe(0);

    createdDeckId = res.body.data._id;
  });

  it('2. GET /api/decks - Should list created deck', async () => {
    const res = await request(app)
      .get('/api/decks')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('3. POST /api/cards/deck/:deckId - Should add cards to deck', async () => {
    const res = await request(app)
      .post(`/api/cards/deck/${createdDeckId}`)
      .set('Cookie', [authCookie])
      .send({
        term: 'Perseverance',
        ipa: { us: '/ˌpɜː.sɪˈvɪə.rəns/' },
        meanings: [{ langCode: 'vi', text: 'Sự kiên trì, bền bỉ' }],
        examples: [
          { en: 'Success requires hard work and perseverance.', vi: 'Thành công đòi hỏi sự chăm chỉ và kiên trì.' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.term).toBe('Perseverance');
    expect(res.body.data.deckId).toBe(createdDeckId);

    createdCardId = res.body.data._id;
  });

  it('4. GET /api/srs/due - Should retrieve due cards for study session', async () => {
    const res = await request(app)
      .get(`/api/srs/due?deckId=${createdDeckId}`)
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].card.term).toBe('Perseverance');
    expect(res.body.data[0].userState.state).toBe('new');
  });

  it('5. POST /api/srs/review - Should calculate FSRS rating, update state & award +10 XP', async () => {
    const res = await request(app)
      .post('/api/srs/review')
      .set('Cookie', [authCookie])
      .send({
        cardId: createdCardId,
        deckId: createdDeckId,
        rating: 3, // Good
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.xpEarned).toBe(10);
    expect(res.body.data.totalXp).toBe(10);
    expect(res.body.data.nextState.reps).toBe(1);
    expect(res.body.data.nextState.state).toBeDefined();
  });
});
