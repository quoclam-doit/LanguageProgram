import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../server';

let mongoServer: MongoMemoryServer;
let authCookie: string;
let deckId: string;
let createdCardId: string;

describe('Phase 3 Ticket 01: partOfSpeech required on Card meanings', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const res = await request(app).post('/api/auth/register').send({
      email: 'posuser@example.com',
      password: 'password123',
      name: 'Part Of Speech Tester',
    });
    authCookie = res.headers['set-cookie'][0];

    const deckRes = await request(app)
      .post('/api/decks')
      .set('Cookie', [authCookie])
      .send({ title: 'POS Test Deck' });
    deckId = deckRes.body.data._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('1. POST /api/cards/deck/:deckId - rejects when a meaning is missing partOfSpeech', async () => {
    const res = await request(app)
      .post(`/api/cards/deck/${deckId}`)
      .set('Cookie', [authCookie])
      .send({
        term: 'Resilience',
        meanings: [{ langCode: 'vi', text: 'Sự kiên cường' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('2. POST /api/cards/deck/:deckId - creates card when partOfSpeech is provided', async () => {
    const res = await request(app)
      .post(`/api/cards/deck/${deckId}`)
      .set('Cookie', [authCookie])
      .send({
        term: 'Resilience',
        meanings: [{ langCode: 'vi', text: 'Sự kiên cường', partOfSpeech: 'n' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.meanings[0].partOfSpeech).toBe('n');

    createdCardId = res.body.data._id;
  });

  it('3. PUT /api/cards/:id - rejects update when a meaning is missing partOfSpeech', async () => {
    const res = await request(app)
      .put(`/api/cards/${createdCardId}`)
      .set('Cookie', [authCookie])
      .send({
        meanings: [{ langCode: 'vi', text: 'Nghĩa sửa lại thiếu từ loại' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('4. PUT /api/cards/:id - updates card when partOfSpeech is provided', async () => {
    const res = await request(app)
      .put(`/api/cards/${createdCardId}`)
      .set('Cookie', [authCookie])
      .send({
        meanings: [{ langCode: 'vi', text: 'Khả năng phục hồi', partOfSpeech: 'n' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.meanings[0].partOfSpeech).toBe('n');
  });
});
